package com.pulse.service;

import com.pulse.dto.PaymentDtos.InitiateResponse;
import com.pulse.entity.Payment;
import com.pulse.entity.PaymentPurpose;
import com.pulse.exception.ApiException;
import com.pulse.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.Duration;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * eSewa ePay v2 integration (sandbox). Two steps:
 * <ol>
 *   <li>{@link #initiate} creates a PENDING payment, computes the HMAC-SHA256
 *       signature and returns the exact form fields the browser POSTs to eSewa.</li>
 *   <li>{@link #verify} confirms the payment server-side against eSewa's status API
 *       (with the signed redirect payload as fallback), then publishes a
 *       {@link PaymentCompletedEvent} so featured/ad effects apply.</li>
 * </ol>
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private static final String SIGNED_FIELDS = "total_amount,transaction_uuid,product_code";

    private final PaymentRepository paymentRepository;
    private final ApplicationEventPublisher events;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    @Value("${pulse.esewa.product-code:EPAYTEST}") private String productCode;
    @Value("${pulse.esewa.secret-key:8gBm/:&EnhH.1/q}") private String secretKey;
    @Value("${pulse.esewa.form-url:https://rc-epay.esewa.com.np/api/epay/main/v2/form}") private String formUrl;
    @Value("${pulse.esewa.status-url:https://rc.esewa.com.np/api/epay/transaction/status/}") private String statusUrl;
    @Value("${pulse.esewa.success-url:http://localhost:5173/payment/callback}") private String successUrl;
    @Value("${pulse.esewa.failure-url:http://localhost:5173/payment/callback}") private String failureUrl;

    public PaymentService(PaymentRepository paymentRepository,
                          ApplicationEventPublisher events) {
        this.paymentRepository = paymentRepository;
        this.events = events;
    }

    /** Initiate with the purpose's default price. */
    public InitiateResponse initiate(Long userId, PaymentPurpose purpose, Long targetId) {
        return initiate(userId, purpose, targetId, purpose.defaultAmount);
    }

    /** Initiate with an explicit amount (e.g. an ad slot's price). */
    @Transactional
    public InitiateResponse initiate(Long userId, PaymentPurpose purpose, Long targetId, int amount) {
        if (amount <= 0) throw ApiException.badRequest("Payment amount must be positive");

        Payment payment = paymentRepository.save(Payment.builder()
                .userId(userId).purpose(purpose).targetId(targetId)
                .amount(amount).productCode(productCode)
                .transactionUuid("pending").status(Payment.Status.PENDING)
                .build());
        // Unique, URL-safe reference now that we have the id.
        String uuid = "pulse-" + payment.getId() + "-" + payment.getCreatedAt().toEpochMilli();
        payment.setTransactionUuid(uuid);
        paymentRepository.save(payment);

        String totalAmount = String.valueOf(amount);
        String signature = sign("total_amount=" + totalAmount
                + ",transaction_uuid=" + uuid + ",product_code=" + productCode);

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("amount", totalAmount);
        fields.put("tax_amount", "0");
        fields.put("total_amount", totalAmount);
        fields.put("transaction_uuid", uuid);
        fields.put("product_code", productCode);
        fields.put("product_service_charge", "0");
        fields.put("product_delivery_charge", "0");
        fields.put("success_url", successUrl);
        fields.put("failure_url", failureUrl);
        fields.put("signed_field_names", SIGNED_FIELDS);
        fields.put("signature", signature);

        return new InitiateResponse(payment.getId(), uuid, amount, formUrl, fields);
    }

    /**
     * Verify a payment. The client-supplied {@code data} payload is trusted ONLY if
     * its eSewa HMAC signature checks out; we additionally confirm status COMPLETE and
     * that the amount/product/uuid match our stored payment. When the signed payload is
     * absent we fall back to the server-side status API (never to unsigned client data).
     */
    @Transactional
    public Payment verify(Long userId, String base64Data, String transactionUuid) {
        String uuid = transactionUuid;
        String json = null;
        String dataStatus = null;
        String refCode = null;
        boolean signatureValid = false;

        if (base64Data != null && !base64Data.isBlank()) {
            try {
                json = new String(Base64.getDecoder().decode(base64Data), StandardCharsets.UTF_8);
                String u = jsonField(json, "transaction_uuid");
                if (u != null) uuid = u;
                dataStatus = jsonField(json, "status");
                refCode = jsonField(json, "transaction_code");
                signatureValid = verifyPayloadSignature(json);
                if (!signatureValid) {
                    log.warn("eSewa payload signature INVALID for {}", uuid);
                    throw ApiException.badRequest("Payment signature verification failed");
                }
            } catch (ApiException ae) {
                throw ae;
            } catch (Exception e) {
                log.warn("Could not decode eSewa data payload: {}", e.getMessage());
            }
        }
        if (uuid == null || uuid.isBlank()) throw ApiException.badRequest("Missing transaction reference");

        Payment payment = paymentRepository.findByTransactionUuid(uuid)
                .orElseThrow(() -> ApiException.notFound("Payment not found"));
        if (!payment.getUserId().equals(userId)) {
            throw ApiException.forbidden("This payment belongs to another account");
        }
        if (payment.getStatus() == Payment.Status.COMPLETE) return payment; // idempotent

        // Cross-check the signed payload's amount/product against our record.
        if (signatureValid) {
            String amt = jsonField(json, "total_amount");
            String prod = jsonField(json, "product_code");
            if (amt != null && !sameAmount(amt, payment.getAmount())) {
                throw ApiException.badRequest("Payment amount mismatch");
            }
            if (prod != null && !prod.equals(payment.getProductCode())) {
                throw ApiException.badRequest("Payment product mismatch");
            }
        }

        // Determine completeness: a valid signed COMPLETE payload, or the status API confirming COMPLETE.
        String apiStatus = queryStatus(payment).orElse(null);
        boolean complete;
        if (apiStatus != null) {
            complete = "COMPLETE".equalsIgnoreCase(apiStatus);           // authoritative when reachable
        } else {
            complete = signatureValid && "COMPLETE".equalsIgnoreCase(dataStatus); // signed fallback
        }

        if (complete) {
            payment.setStatus(Payment.Status.COMPLETE);
            payment.setEsewaRef(refCode);
            payment.setCompletedAt(Instant.now());
            paymentRepository.save(payment);
            events.publishEvent(new PaymentCompletedEvent(payment.getId(), payment.getUserId(),
                    payment.getPurpose(), payment.getTargetId(), payment.getPurpose().days));
            log.info("Payment {} COMPLETE ({} → target {})", uuid, payment.getPurpose(), payment.getTargetId());
        } else {
            // Persist the failure (returning rather than throwing keeps this write from
            // being rolled back); the caller inspects status to decide success/failure.
            payment.setStatus(Payment.Status.FAILED);
            paymentRepository.save(payment);
            log.info("Payment {} marked FAILED (eSewa status not COMPLETE)", uuid);
        }
        return payment;
    }

    /** Refund a completed payment (tracked credit; real gateway refund is a future integration). */
    @Transactional
    public boolean refund(Long paymentId, String reason) {
        Payment p = paymentRepository.findById(paymentId).orElse(null);
        if (p == null || p.getStatus() != Payment.Status.COMPLETE) return false;
        p.setStatus(Payment.Status.REFUNDED);
        paymentRepository.save(p);
        log.info("Payment {} REFUNDED — {}", p.getTransactionUuid(), reason);
        return true;
    }

    /** Recompute the HMAC over signed_field_names and compare to the payload's signature. */
    private boolean verifyPayloadSignature(String json) {
        String signedNames = jsonField(json, "signed_field_names");
        String signature = jsonField(json, "signature");
        if (signedNames == null || signature == null) return false;
        StringBuilder message = new StringBuilder();
        String[] names = signedNames.split(",");
        for (int i = 0; i < names.length; i++) {
            String name = names[i].trim();
            String value = jsonField(json, name);
            if (i > 0) message.append(",");
            message.append(name).append("=").append(value == null ? "" : value);
        }
        return MessageDigest.isEqual(sign(message.toString()).getBytes(StandardCharsets.US_ASCII),
                signature.getBytes(StandardCharsets.US_ASCII));
    }

    private static boolean sameAmount(String value, int expected) {
        try {
            return new BigDecimal(value.replace(",", "").trim())
                    .compareTo(BigDecimal.valueOf(expected)) == 0;
        } catch (Exception e) {
            return false;
        }
    }

    /** Best-effort server-side status check against eSewa. Empty if the call fails. */
    private java.util.Optional<String> queryStatus(Payment p) {
        try {
            String url = statusUrl
                    + "?product_code=" + enc(p.getProductCode())
                    + "&total_amount=" + enc(String.valueOf(p.getAmount()))
                    + "&transaction_uuid=" + enc(p.getTransactionUuid());
            HttpResponse<String> res = http.send(
                    HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(8)).GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            return java.util.Optional.ofNullable(jsonField(res.body(), "status"));
        } catch (Exception e) {
            log.warn("eSewa status check failed for {}: {}", p.getTransactionUuid(), e.getMessage());
            return java.util.Optional.empty();
        }
    }

    private String sign(String message) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(mac.doFinal(message.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to sign eSewa payload", e);
        }
    }

    private static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    /**
     * Extract a top-level JSON field value (string or unquoted scalar). The eSewa
     * payloads are small and flat, so a targeted regex is sufficient and avoids a
     * hard dependency on any particular Jackson version.
     */
    private static String jsonField(String json, String field) {
        if (json == null) return null;
        var m = java.util.regex.Pattern
                .compile("\"" + java.util.regex.Pattern.quote(field) + "\"\\s*:\\s*(?:\"([^\"]*)\"|([^,}\\s]+))")
                .matcher(json);
        if (m.find()) {
            return m.group(1) != null ? m.group(1) : m.group(2);
        }
        return null;
    }
}

package com.pulse.service;

import com.pulse.entity.Payment;
import com.pulse.entity.PaymentPurpose;
import com.pulse.exception.ApiException;
import com.pulse.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Proxy;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PaymentServiceTests {
    @Test
    void signsInitiationAndRejectsVerificationByAnotherUser() {
        AtomicReference<Payment> stored = new AtomicReference<>();
        PaymentRepository repository = (PaymentRepository) Proxy.newProxyInstance(getClass().getClassLoader(),
                new Class<?>[]{PaymentRepository.class}, (proxy, method, args) -> switch (method.getName()) {
                    case "save" -> {
                        Payment payment = (Payment) args[0];
                        if (payment.getId() == null) payment.setId(77L);
                        if (payment.getCreatedAt() == null) payment.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
                        stored.set(payment);
                        yield payment;
                    }
                    case "findByTransactionUuid" -> Optional.ofNullable(stored.get());
                    case "toString" -> "PaymentRepository";
                    default -> null;
                });
        PaymentService service = new PaymentService(repository, event -> {});
        ReflectionTestUtils.setField(service, "productCode", "EPAYTEST");
        ReflectionTestUtils.setField(service, "secretKey", "test-secret");
        ReflectionTestUtils.setField(service, "formUrl", "https://example.test/form");
        ReflectionTestUtils.setField(service, "statusUrl", "https://example.test/status");
        ReflectionTestUtils.setField(service, "successUrl", "https://pulse.test/payment/callback");
        ReflectionTestUtils.setField(service, "failureUrl", "https://pulse.test/payment/callback");

        var initiated = service.initiate(5L, PaymentPurpose.FEATURED_HOSPITAL, 12L);

        assertThat(initiated.fields()).containsKeys("signature", "signed_field_names", "transaction_uuid");
        assertThat(initiated.amount()).isEqualTo(500);
        assertThatThrownBy(() -> service.verify(6L, null, initiated.transactionUuid()))
                .isInstanceOf(ApiException.class)
                .hasMessage("This payment belongs to another account");
    }
}

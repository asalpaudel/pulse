package com.pulse.dto;

import com.pulse.entity.Payment;
import com.pulse.entity.PaymentPurpose;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.Map;

public class PaymentDtos {

    public record InitiateRequest(@NotNull PaymentPurpose purpose, Long targetId) {}

    /**
     * Everything the browser needs to hand off to eSewa: POST {@code fields} to
     * {@code formUrl} as a normal HTML form and the user lands on eSewa's page.
     */
    public record InitiateResponse(Long paymentId, String transactionUuid, int amount,
                                   String formUrl, Map<String, String> fields) {}

    public record VerifyRequest(String data, String transactionUuid) {
        public boolean hasReference() {
            return (data != null && !data.isBlank()) || (transactionUuid != null && !transactionUuid.isBlank());
        }
    }

    public record PaymentDto(
            Long id, PaymentPurpose purpose, Long targetId, int amount,
            String transactionUuid, String status, String esewaRef,
            Instant createdAt, Instant completedAt
    ) {
        public static PaymentDto from(Payment p) {
            return new PaymentDto(p.getId(), p.getPurpose(), p.getTargetId(), p.getAmount(),
                    p.getTransactionUuid(), p.getStatus().name(), p.getEsewaRef(),
                    p.getCreatedAt(), p.getCompletedAt());
        }
    }
}

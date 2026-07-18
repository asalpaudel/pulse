package com.pulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** A single eSewa payment attempt that, once COMPLETE, unlocks a featured placement or ad. */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    public enum Status { PENDING, COMPLETE, FAILED, REFUNDED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentPurpose purpose;

    /** Hospital / blood bank / event / ad id this payment applies to. */
    @Column(name = "target_id")
    private Long targetId;

    @Column(nullable = false)
    private int amount;

    @Column(name = "transaction_uuid", nullable = false, unique = true)
    private String transactionUuid;

    @Column(name = "product_code", nullable = false)
    private String productCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    /** eSewa's transaction_code once complete. */
    @Column(name = "esewa_ref")
    private String esewaRef;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = Status.PENDING;
    }
}

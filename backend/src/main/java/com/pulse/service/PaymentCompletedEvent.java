package com.pulse.service;

import com.pulse.entity.PaymentPurpose;

/**
 * Published when a payment is verified COMPLETE. Listeners apply the effect
 * (grant featured placement, move an ad into review) — this decouples
 * {@link PaymentService} from {@code FeatureService}/{@code AdService}.
 */
public record PaymentCompletedEvent(Long paymentId, Long userId, PaymentPurpose purpose,
                                    Long targetId, int days) {}

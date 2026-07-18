package com.pulse.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Applies featured placement once the corresponding payment is COMPLETE.
 * Runs AFTER_COMMIT so a failure here can never roll back the recorded payment.
 */
@Component
public class FeaturedPaymentListener {

    private final FeatureService featureService;

    public FeaturedPaymentListener(FeatureService featureService) {
        this.featureService = featureService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaymentCompleted(PaymentCompletedEvent e) {
        switch (e.purpose()) {
            case FEATURED_HOSPITAL -> featureService.grant(FeatureService.FeatureTarget.HOSPITAL, e.targetId(), e.days());
            case FEATURED_BLOOD_BANK -> featureService.grant(FeatureService.FeatureTarget.BLOOD_BANK, e.targetId(), e.days());
            case FEATURED_EVENT -> featureService.grant(FeatureService.FeatureTarget.EVENT, e.targetId(), e.days());
            case AD_CAMPAIGN -> { /* handled by AdService's listener */ }
        }
    }
}

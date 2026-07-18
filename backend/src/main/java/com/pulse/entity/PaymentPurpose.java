package com.pulse.entity;

/**
 * What a payment unlocks. Featured purposes carry a default price (NPR) and a
 * duration in days; AD_CAMPAIGN's price is derived from the chosen ad slot.
 */
public enum PaymentPurpose {
    FEATURED_HOSPITAL(500, 30),
    FEATURED_BLOOD_BANK(500, 30),
    FEATURED_EVENT(300, 30),
    AD_CAMPAIGN(0, 30);

    public final int defaultAmount;
    public final int days;

    PaymentPurpose(int defaultAmount, int days) {
        this.defaultAmount = defaultAmount;
        this.days = days;
    }
}

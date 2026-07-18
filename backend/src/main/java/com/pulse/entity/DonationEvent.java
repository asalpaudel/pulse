package com.pulse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "donation_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "blood_bank_id", nullable = false)
    private Long bloodBankId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "blood_bank_id", insertable = false, updatable = false)
    private BloodBank bloodBank;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "event_time")
    private LocalTime eventTime;

    private Double latitude;

    private Double longitude;

    private String address;

    /** Monetization (Tier 3): brand that sponsors this donation drive ("Powered by X"). */
    @Column(name = "sponsor_name")
    private String sponsorName;

    /** Optional sponsor logo (URL or imported asset key) shown on the event card. */
    @Column(name = "sponsor_logo_url")
    private String sponsorLogoUrl;

    /** Monetization (Tier 2): paid boost — pins/highlights the drive to nearby donors. */
    @Column(nullable = false)
    @ColumnDefault("false")
    private boolean featured;

    /** When the paid boost expires (null = not boosted). */
    @Column(name = "featured_until")
    private Instant featuredUntil;
}

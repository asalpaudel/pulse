package com.pulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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

    private Double latitude;

    private Double longitude;

    private String address;
}

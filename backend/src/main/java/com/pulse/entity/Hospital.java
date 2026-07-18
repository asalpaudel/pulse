package com.pulse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Entity
@Table(name = "hospitals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    private String phone;

    private Double latitude;

    private Double longitude;

    private String address;

    @Column(nullable = false)
    private boolean verified;

    /** Monetization (Tier 2): paid "Featured" placement — surfaces first in search & a Featured section. */
    @Column(nullable = false)
    @ColumnDefault("false")
    private boolean featured;

    /** When the featured placement expires (null = not featured / no expiry tracking). */
    @Column(name = "featured_until")
    private Instant featuredUntil;

    /** Logo as a base64 data URL (optional). */
    @Column(name = "image_data", columnDefinition = "text")
    private String imageData;
}

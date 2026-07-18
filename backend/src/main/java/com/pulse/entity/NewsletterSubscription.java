package com.pulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "newsletter_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsletterSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @Column(length = 100)
    private String name;

    @Column(nullable = false, length = 40)
    private String source;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "subscribed_at", nullable = false)
    private Instant subscribedAt;

    @PrePersist
    void prePersist() {
        if (subscribedAt == null) subscribedAt = Instant.now();
    }
}

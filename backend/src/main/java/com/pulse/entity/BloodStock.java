package com.pulse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "blood_stock", uniqueConstraints = @UniqueConstraint(columnNames = {"blood_bank_id", "blood_group"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "blood_bank_id", nullable = false)
    private Long bloodBankId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "blood_bank_id", insertable = false, updatable = false)
    private BloodBank bloodBank;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", nullable = false)
    private BloodGroup bloodGroup;

    @Column(nullable = false)
    private int units;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }
}

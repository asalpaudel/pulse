package com.pulse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blood_banks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String name;

    private String phone;

    private Double latitude;

    private Double longitude;

    private String address;

    @Column(nullable = false)
    private boolean verified;
}

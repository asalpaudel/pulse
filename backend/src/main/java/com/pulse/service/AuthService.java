package com.pulse.service;

import com.pulse.dto.AuthDtos.*;
import com.pulse.entity.*;
import com.pulse.exception.ApiException;
import com.pulse.repository.*;
import com.pulse.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final HospitalRepository hospitalRepository;
    private final BloodBankRepository bloodBankRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, DonorRepository donorRepository,
                       HospitalRepository hospitalRepository, BloodBankRepository bloodBankRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.donorRepository = donorRepository;
        this.hospitalRepository = hospitalRepository;
        this.bloodBankRepository = bloodBankRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw ApiException.conflict("Email already registered");
        }
        // ADMIN and DONOR are verified by default; institutions await admin verification.
        boolean verified = req.role() == Role.DONOR || req.role() == Role.ADMIN;
        User user = User.builder()
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(req.role())
                .verified(verified)
                .build();
        user = userRepository.save(user);

        Map<String, Object> p = req.profile() == null ? Map.of() : req.profile();
        switch (req.role()) {
            case DONOR -> {
                Donor donor = Donor.builder()
                        .userId(user.getId())
                        .fullName(str(p, "fullName", req.email()))
                        .bloodGroup(parseBloodGroup(p.get("bloodGroup")))
                        .phone(str(p, "phone", null))
                        .latitude(dbl(p, "latitude"))
                        .longitude(dbl(p, "longitude"))
                        .address(str(p, "address", null))
                        .available(p.get("available") == null || Boolean.parseBoolean(String.valueOf(p.get("available"))))
                        .lastDonationDate(date(p.get("lastDonationDate")))
                        .build();
                donorRepository.save(donor);
            }
            case HOSPITAL -> {
                Hospital h = Hospital.builder()
                        .userId(user.getId())
                        .name(str(p, "name", req.email()))
                        .phone(str(p, "phone", null))
                        .latitude(dbl(p, "latitude"))
                        .longitude(dbl(p, "longitude"))
                        .address(str(p, "address", null))
                        .verified(false)
                        .build();
                hospitalRepository.save(h);
            }
            case BLOOD_BANK -> {
                BloodBank b = BloodBank.builder()
                        .userId(user.getId())
                        .name(str(p, "name", req.email()))
                        .phone(str(p, "phone", null))
                        .latitude(dbl(p, "latitude"))
                        .longitude(dbl(p, "longitude"))
                        .address(str(p, "address", null))
                        .verified(false)
                        .build();
                bloodBankRepository.save(b);
            }
            case ADMIN -> { /* no profile entity */ }
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getRole());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> ApiException.unauthorized("Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid credentials");
        }
        if (!user.isVerified()) {
            throw ApiException.forbidden("Account verification is required before signing in");
        }
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getRole());
    }

    private static String str(Map<String, Object> m, String key, String def) {
        Object v = m.get(key);
        return v == null ? def : String.valueOf(v);
    }

    private static Double dbl(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v == null) return null;
        if (v instanceof Number n) return n.doubleValue();
        return Double.parseDouble(String.valueOf(v));
    }

    private static BloodGroup parseBloodGroup(Object v) {
        if (v == null) throw ApiException.badRequest("bloodGroup is required for donor registration");
        return BloodGroup.valueOf(String.valueOf(v));
    }

    private static LocalDate date(Object v) {
        if (v == null) return null;
        return LocalDate.parse(String.valueOf(v));
    }
}

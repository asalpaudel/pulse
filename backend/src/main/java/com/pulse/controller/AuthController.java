package com.pulse.controller;

import com.pulse.dto.AuthDtos.*;
import com.pulse.dto.UserDto;
import com.pulse.entity.User;
import com.pulse.exception.ApiException;
import com.pulse.repository.UserRepository;
import com.pulse.security.SecurityUtil;
import com.pulse.service.AuthService;
import com.pulse.service.BloodBankService;
import com.pulse.service.DonorService;
import com.pulse.service.HospitalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final DonorService donorService;
    private final HospitalService hospitalService;
    private final BloodBankService bloodBankService;

    public AuthController(AuthService authService, UserRepository userRepository,
                          DonorService donorService, HospitalService hospitalService,
                          BloodBankService bloodBankService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.donorService = donorService;
        this.hospitalService = hospitalService;
        this.bloodBankService = bloodBankService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public Map<String, Object> me() {
        Long userId = SecurityUtil.currentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        Map<String, Object> result = new HashMap<>();
        result.put("user", UserDto.from(user));
        switch (user.getRole()) {
            case DONOR -> result.put("profile", donorService.getByUserId(userId));
            case HOSPITAL -> result.put("profile", hospitalService.getByUserId(userId));
            case BLOOD_BANK -> result.put("profile", bloodBankService.getByUserId(userId));
            case ADMIN -> result.put("profile", null);
        }
        return result;
    }
}

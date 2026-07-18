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
import com.pulse.service.EmailVerificationService;
import com.pulse.service.RegistrationService;
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
    private final RegistrationService registrationService;
    private final EmailVerificationService emailVerificationService;

    public AuthController(AuthService authService, UserRepository userRepository,
                          DonorService donorService, HospitalService hospitalService,
                          BloodBankService bloodBankService, RegistrationService registrationService,
                          EmailVerificationService emailVerificationService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.donorService = donorService;
        this.hospitalService = hospitalService;
        this.bloodBankService = bloodBankService;
        this.registrationService = registrationService;
        this.emailVerificationService = emailVerificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.register(req));
    }

    @PostMapping("/verify-email")
    public AuthResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return emailVerificationService.verify(request.email(), request.code());
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        emailVerificationService.resend(request.email());
        return ResponseEntity.noContent().build();
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

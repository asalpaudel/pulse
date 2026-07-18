package com.pulse.dto;

import com.pulse.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.Map;

public class AuthDtos {

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotNull Role role,
            Map<String, Object> profile
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record AuthResponse(String token, Long userId, Role role) {}

    public record RegistrationResponse(
            Long userId,
            Role role,
            boolean verificationRequired,
            long expiresInSeconds
    ) {}

    public record VerifyEmailRequest(
            @Email @NotBlank String email,
            @NotBlank @Pattern(regexp = "\\d{6}") String code
    ) {}

    public record ResendVerificationRequest(
            @Email @NotBlank String email
    ) {}
}

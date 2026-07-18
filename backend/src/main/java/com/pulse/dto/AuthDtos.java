package com.pulse.dto;

import com.pulse.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.Map;
import java.util.UUID;

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

    public record ForgotPasswordRequest(@Email @NotBlank String email) {}

    public record ResetPasswordRequest(
            @NotBlank String token,
            @NotBlank String password
    ) {}

    public record TwoFactorVerificationRequest(
            @NotNull UUID challengeId,
            @NotBlank @Pattern(regexp = "\\d{6}") String code
    ) {}

    public record TwoFactorSettingRequest(
            @NotBlank @Pattern(regexp = "ENABLE|DISABLE") String action
    ) {}

    public record TwoFactorSettingConfirmation(
            @NotBlank @Pattern(regexp = "ENABLE|DISABLE") String action,
            @NotBlank @Pattern(regexp = "\\d{6}") String code
    ) {}
}

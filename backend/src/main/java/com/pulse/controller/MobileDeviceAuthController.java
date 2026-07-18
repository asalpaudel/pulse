package com.pulse.controller;

import com.pulse.dto.AuthDtos.LoginRequest;
import com.pulse.dto.AuthDtos.TwoFactorVerificationRequest;
import com.pulse.entity.Role;
import com.pulse.security.JwtService;
import com.pulse.security.UserPrincipal;
import com.pulse.service.TrustedDeviceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/mobile")
public class MobileDeviceAuthController {
    public record MobileLoginRequest(
            @Valid @NotNull LoginRequest credentials,
            @Size(max = 100) String deviceToken
    ) {}

    private final AuthenticationManager authenticationManager;
    private final TrustedDeviceService devices;
    private final JwtService jwtService;

    public MobileDeviceAuthController(AuthenticationManager authenticationManager,
                                      TrustedDeviceService devices, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.devices = devices;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody MobileLoginRequest request) {
        var authentication = authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
                request.credentials().email(), request.credentials().password()));
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        if (principal.getRole() != Role.DONOR) {
            throw com.pulse.exception.ApiException.forbidden("Institution accounts must use the web dashboard");
        }
        if (devices.isTrusted(principal.getId(), request.deviceToken())) {
            return authenticated(principal, null);
        }
        var challenge = devices.issue(com.pulse.entity.User.builder().id(principal.getId())
                .email(principal.getUsername()).passwordHash(principal.getPassword()).role(principal.getRole())
                .verified(true).build());
        return Map.of("deviceVerificationRequired", true, "challengeId", challenge.challengeId(),
                "expiresInSeconds", challenge.expiresInSeconds());
    }

    @PostMapping("/verify-device")
    public Map<String, Object> verify(@Valid @RequestBody TwoFactorVerificationRequest request) {
        var verified = devices.verify(request.challengeId(), request.code(), "Pulse Android App");
        if (verified.user().getRole() != Role.DONOR) {
            throw com.pulse.exception.ApiException.forbidden("Institution accounts must use the web dashboard");
        }
        return authenticated(UserPrincipal.from(verified.user()), verified.token());
    }

    private Map<String, Object> authenticated(UserPrincipal principal, String deviceToken) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", jwtService.generateToken(principal.getId(), principal.getUsername(), principal.getRole().name()));
        response.put("userId", principal.getId());
        response.put("role", principal.getRole());
        response.put("deviceVerificationRequired", false);
        if (deviceToken != null) response.put("deviceToken", deviceToken);
        return response;
    }
}

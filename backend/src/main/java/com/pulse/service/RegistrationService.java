package com.pulse.service;

import com.pulse.dto.AuthDtos.AuthResponse;
import com.pulse.dto.AuthDtos.RegisterRequest;
import com.pulse.dto.AuthDtos.RegistrationResponse;
import com.pulse.entity.Role;
import com.pulse.entity.User;
import com.pulse.exception.ApiException;
import com.pulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistrationService {

    private final AuthService authService;
    private final UserRepository users;
    private final EmailVerificationService verification;

    public RegistrationService(AuthService authService, UserRepository users, EmailVerificationService verification) {
        this.authService = authService;
        this.users = users;
        this.verification = verification;
    }

    @Transactional
    public RegistrationResponse register(RegisterRequest request) {
        if (request.role() != Role.DONOR) {
            throw ApiException.badRequest("Only donors can self-register");
        }
        AuthResponse created = authService.register(request);
        User user = users.findById(created.userId())
                .orElseThrow(() -> new IllegalStateException("Registered user was not persisted"));
        user.setVerified(false);
        users.save(user);
        verification.issueFor(user);
        return new RegistrationResponse(user.getId(), user.getRole(), true,
                EmailVerificationService.EXPIRY_SECONDS);
    }
}

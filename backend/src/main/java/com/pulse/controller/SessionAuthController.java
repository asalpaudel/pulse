package com.pulse.controller;

import com.pulse.dto.AuthDtos.LoginRequest;
import com.pulse.dto.AuthDtos.TwoFactorVerificationRequest;
import com.pulse.entity.Role;
import com.pulse.entity.User;
import com.pulse.security.UserPrincipal;
import com.pulse.service.TwoFactorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/session")
public class SessionAuthController {

    private static final int SESSION_TIMEOUT_SECONDS = 30 * 60;

    private final AuthenticationManager authenticationManager;
    private final TwoFactorService twoFactorService;
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    @Autowired
    public SessionAuthController(AuthenticationManager authenticationManager,
                                 TwoFactorService twoFactorService) {
        this.authenticationManager = authenticationManager;
        this.twoFactorService = twoFactorService;
    }

    SessionAuthController(AuthenticationManager authenticationManager) {
        this(authenticationManager, null);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request,
                                     HttpServletRequest servletRequest,
                                     HttpServletResponse servletResponse) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password()));
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        if (principal.getRole() == Role.SUPER_ADMIN && principal.isTwoFactorEnabled()) {
            TwoFactorService.ChallengeInfo challenge = twoFactorService.issueLogin(User.builder()
                    .id(principal.getId())
                    .email(principal.getUsername())
                    .passwordHash(principal.getPassword())
                    .role(principal.getRole())
                    .verified(true)
                    .twoFactorEnabled(true)
                    .build());
            return Map.of(
                    "twoFactorRequired", true,
                    "challengeId", challenge.challengeId(),
                    "expiresInSeconds", challenge.expiresInSeconds(),
                    "role", principal.getRole());
        }
        return establishSession(authentication, servletRequest, servletResponse);
    }

    @PostMapping("/verify-2fa")
    public Map<String, Object> verifyTwoFactor(@Valid @RequestBody TwoFactorVerificationRequest request,
                                               HttpServletRequest servletRequest,
                                               HttpServletResponse servletResponse) {
        User user = twoFactorService.verifyLogin(request.challengeId(), request.code());
        UserPrincipal principal = UserPrincipal.from(user);
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.getAuthorities());
        return establishSession(authentication, servletRequest, servletResponse);
    }

    private Map<String, Object> establishSession(Authentication authentication,
                                                  HttpServletRequest servletRequest,
                                                  HttpServletResponse servletResponse) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, servletRequest, servletResponse);

        HttpSession session = servletRequest.getSession(false);
        if (session != null) session.setMaxInactiveInterval(SESSION_TIMEOUT_SECONDS);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return Map.of("userId", principal.getId(), "role", principal.getRole(), "twoFactorRequired", false);
    }

    @PostMapping("/touch")
    public ResponseEntity<Void> touch(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return ResponseEntity.status(401).build();
        session.setAttribute("pulse.lastActivity", System.currentTimeMillis());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }
}

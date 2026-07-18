package com.pulse.controller;

import com.pulse.dto.AuthDtos.TwoFactorSettingConfirmation;
import com.pulse.dto.AuthDtos.TwoFactorSettingRequest;
import com.pulse.security.SecurityUtil;
import com.pulse.service.TwoFactorService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/superadmin/security")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminSecurityController {

    private final TwoFactorService twoFactorService;

    public SuperAdminSecurityController(TwoFactorService twoFactorService) {
        this.twoFactorService = twoFactorService;
    }

    @GetMapping
    public TwoFactorService.SecurityStatus status() {
        return twoFactorService.status(SecurityUtil.currentUserId());
    }

    @PostMapping("/2fa/code")
    public TwoFactorService.ChallengeInfo requestCode(@Valid @RequestBody TwoFactorSettingRequest request) {
        return twoFactorService.requestSetting(SecurityUtil.currentUserId(), request.action());
    }

    @PostMapping("/2fa/confirm")
    public TwoFactorService.SecurityStatus confirm(@Valid @RequestBody TwoFactorSettingConfirmation request) {
        return twoFactorService.confirmSetting(SecurityUtil.currentUserId(), request.action(), request.code());
    }
}

package com.pulse.controller;

import com.pulse.dto.HospitalDtos.*;
import com.pulse.security.SecurityUtil;
import com.pulse.service.HospitalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('HOSPITAL')")
    public HospitalDto me() {
        return hospitalService.getByUserId(SecurityUtil.currentUserId());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('HOSPITAL')")
    public HospitalDto updateMe(@RequestBody HospitalUpdateRequest req) {
        return hospitalService.updateOwn(SecurityUtil.currentUserId(), req);
    }
}

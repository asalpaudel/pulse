package com.pulse.controller;

import com.pulse.dto.DonorDtos.*;
import com.pulse.entity.BloodGroup;
import com.pulse.security.SecurityUtil;
import com.pulse.service.DonorService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/donors")
public class DonorController {

    private final DonorService donorService;

    public DonorController(DonorService donorService) {
        this.donorService = donorService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DONOR')")
    public DonorDto me() {
        return donorService.getByUserId(SecurityUtil.currentUserId());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('DONOR')")
    public DonorDto updateMe(@Valid @RequestBody DonorUpdateRequest req) {
        return donorService.updateOwn(SecurityUtil.currentUserId(), req);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('HOSPITAL','BLOOD_BANK','ADMIN')")
    public List<DonorDto> search(@RequestParam(required = false) BloodGroup bloodGroup,
                                 @RequestParam(required = false) Double lat,
                                 @RequestParam(required = false) Double lng,
                                 @RequestParam(required = false) Double radiusKm) {
        return donorService.search(bloodGroup, lat, lng, radiusKm);
    }

    @GetMapping("/{id}")
    public DonorDto getById(@PathVariable Long id) {
        return donorService.getById(id);
    }
}

package com.pulse.controller;

import com.pulse.dto.BloodBankDtos.*;
import com.pulse.security.SecurityUtil;
import com.pulse.service.BloodBankService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/bloodbanks")
public class BloodBankController {

    private final BloodBankService bloodBankService;

    public BloodBankController(BloodBankService bloodBankService) {
        this.bloodBankService = bloodBankService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('BLOOD_BANK')")
    public BloodBankDto me() {
        return bloodBankService.getByUserId(SecurityUtil.currentUserId());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('BLOOD_BANK')")
    public BloodBankDto updateMe(@Valid @RequestBody BloodBankUpdateRequest req) {
        return bloodBankService.updateOwn(SecurityUtil.currentUserId(), req);
    }

    @GetMapping("/search")
    public List<BloodBankDto> search(@RequestParam(required = false) Double lat,
                                     @RequestParam(required = false) Double lng,
                                     @RequestParam(required = false) Double radiusKm) {
        return bloodBankService.search(lat, lng, radiusKm);
    }

    @GetMapping("/{id}/stock")
    public List<BloodStockDto> stock(@PathVariable Long id) {
        return bloodBankService.getStock(id);
    }

    @PutMapping("/me/stock")
    @PreAuthorize("hasRole('BLOOD_BANK')")
    public List<BloodStockDto> upsertStock(@Valid @RequestBody List<@Valid StockUpsertItem> items) {
        return bloodBankService.upsertOwnStock(SecurityUtil.currentUserId(), items);
    }
}

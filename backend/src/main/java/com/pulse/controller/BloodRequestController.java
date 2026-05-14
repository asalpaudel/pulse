package com.pulse.controller;

import com.pulse.dto.RequestDtos.*;
import com.pulse.entity.RequestStatus;
import com.pulse.security.SecurityUtil;
import com.pulse.security.UserPrincipal;
import com.pulse.service.BloodRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class BloodRequestController {

    private final BloodRequestService requestService;

    public BloodRequestController(BloodRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<BloodRequestDto> create(@Valid @RequestBody CreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(requestService.create(SecurityUtil.currentUserId(), req));
    }

    @GetMapping
    public List<BloodRequestDto> list(@RequestParam(required = false) RequestStatus status,
                                      @RequestParam(required = false, defaultValue = "false") boolean mine) {
        return requestService.list(SecurityUtil.currentUserId(), status, mine);
    }

    @GetMapping("/{id}")
    public BloodRequestDto get(@PathVariable Long id) {
        return requestService.get(id);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('HOSPITAL','ADMIN')")
    public BloodRequestDto updateStatus(@PathVariable Long id,
                                        @Valid @RequestBody StatusUpdateRequest req) {
        UserPrincipal me = SecurityUtil.currentUser();
        boolean isAdmin = me.getRole().name().equals("ADMIN");
        return requestService.updateStatus(id, me.getId(), isAdmin, req.status());
    }

    @PostMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('DONOR','BLOOD_BANK')")
    public ResponseEntity<RequestResponseDto> respond(@PathVariable Long id) {
        UserPrincipal me = SecurityUtil.currentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(requestService.respond(id, me.getId(), me.getRole()));
    }

    @GetMapping("/{id}/responses")
    @PreAuthorize("hasAnyRole('HOSPITAL','ADMIN')")
    public List<RequestResponseDto> responses(@PathVariable Long id) {
        UserPrincipal me = SecurityUtil.currentUser();
        boolean isAdmin = me.getRole().name().equals("ADMIN");
        return requestService.listResponses(id, me.getId(), isAdmin);
    }
}

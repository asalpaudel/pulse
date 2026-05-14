package com.pulse.controller;

import com.pulse.dto.EventDtos.*;
import com.pulse.security.SecurityUtil;
import com.pulse.security.UserPrincipal;
import com.pulse.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    @PreAuthorize("hasRole('BLOOD_BANK')")
    public ResponseEntity<DonationEventDto> create(@Valid @RequestBody CreateEventRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.create(SecurityUtil.currentUserId(), req));
    }

    @GetMapping
    public List<DonationEventDto> list() {
        return eventService.list();
    }

    @GetMapping("/{id}")
    public DonationEventDto get(@PathVariable Long id) {
        return eventService.get(id);
    }

    @PostMapping("/{id}/join")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<EventEnrollmentDto> join(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.join(id, SecurityUtil.currentUserId()));
    }

    @GetMapping("/{id}/enrollments")
    @PreAuthorize("hasAnyRole('BLOOD_BANK','ADMIN')")
    public List<EventEnrollmentDto> enrollments(@PathVariable Long id) {
        UserPrincipal me = SecurityUtil.currentUser();
        boolean isAdmin = me.getRole().name().equals("ADMIN");
        return eventService.listEnrollments(id, me.getId(), isAdmin);
    }
}

package com.pulse.service;

import com.pulse.dto.EventDtos.*;
import com.pulse.entity.BloodBank;
import com.pulse.entity.DonationEvent;
import com.pulse.entity.Donor;
import com.pulse.entity.EventEnrollment;
import com.pulse.exception.ApiException;
import com.pulse.repository.DonationEventRepository;
import com.pulse.repository.EventEnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventService {

    private final DonationEventRepository eventRepository;
    private final EventEnrollmentRepository enrollmentRepository;
    private final BloodBankService bloodBankService;
    private final DonorService donorService;

    public EventService(DonationEventRepository eventRepository,
                        EventEnrollmentRepository enrollmentRepository,
                        BloodBankService bloodBankService,
                        DonorService donorService) {
        this.eventRepository = eventRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.bloodBankService = bloodBankService;
        this.donorService = donorService;
    }

    @Transactional
    public DonationEventDto create(Long bloodBankUserId, CreateEventRequest req) {
        BloodBank bank = bloodBankService.requireByUserId(bloodBankUserId);
        DonationEvent event = DonationEvent.builder()
                .bloodBankId(bank.getId())
                .title(req.title())
                .description(req.description())
                .eventDate(req.eventDate())
                .latitude(req.latitude())
                .longitude(req.longitude())
                .address(req.address())
                .build();
        return DonationEventDto.from(eventRepository.save(event));
    }

    @Transactional(readOnly = true)
    public List<DonationEventDto> list() {
        return eventRepository.findAll().stream().map(DonationEventDto::from).toList();
    }

    @Transactional(readOnly = true)
    public DonationEventDto get(Long id) {
        return DonationEventDto.from(require(id));
    }

    private DonationEvent require(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Donation event not found"));
    }

    @Transactional
    public EventEnrollmentDto join(Long eventId, Long donorUserId) {
        DonationEvent event = require(eventId);
        Donor donor = donorService.requireByUserId(donorUserId);
        if (enrollmentRepository.existsByDonationEventIdAndDonorId(event.getId(), donor.getId())) {
            throw ApiException.conflict("Already enrolled in this event");
        }
        EventEnrollment enrollment = EventEnrollment.builder()
                .donationEventId(event.getId())
                .donorId(donor.getId())
                .build();
        return EventEnrollmentDto.from(enrollmentRepository.save(enrollment));
    }

    @Transactional(readOnly = true)
    public List<EventEnrollmentDto> listEnrollments(Long eventId, Long currentUserId, boolean isAdmin) {
        DonationEvent event = require(eventId);
        if (!isAdmin) {
            BloodBank bank = bloodBankService.requireByUserId(currentUserId);
            if (!event.getBloodBankId().equals(bank.getId())) {
                throw ApiException.forbidden("Only the owning blood bank or an admin can view enrollments");
            }
        }
        return enrollmentRepository.findByDonationEventId(eventId)
                .stream().map(EventEnrollmentDto::from).toList();
    }
}

package com.pulse.dto;

import com.pulse.entity.DonationEvent;
import com.pulse.entity.EventEnrollment;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.time.LocalDate;

public class EventDtos {

    public record CreateEventRequest(
            @NotBlank String title, String description, LocalDate eventDate,
            Double latitude, Double longitude, String address
    ) {}

    public record DonationEventDto(
            Long id, Long bloodBankId, String title, String description,
            LocalDate eventDate, Double latitude, Double longitude, String address
    ) {
        public static DonationEventDto from(DonationEvent e) {
            return new DonationEventDto(e.getId(), e.getBloodBankId(), e.getTitle(), e.getDescription(),
                    e.getEventDate(), e.getLatitude(), e.getLongitude(), e.getAddress());
        }
    }

    public record EventEnrollmentDto(Long id, Long donationEventId, Long donorId, Instant createdAt) {
        public static EventEnrollmentDto from(EventEnrollment e) {
            return new EventEnrollmentDto(e.getId(), e.getDonationEventId(), e.getDonorId(), e.getCreatedAt());
        }
    }
}

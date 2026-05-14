package com.pulse.dto;

import com.pulse.entity.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class RequestDtos {

    public record CreateRequest(
            @NotNull BloodGroup bloodGroup,
            @Min(1) int units,
            @NotNull Urgency urgency,
            Double latitude,
            Double longitude,
            String note,
            Double radiusKm
    ) {}

    public record BloodRequestDto(
            Long id, Long requesterUserId, BloodGroup bloodGroup, int units, Urgency urgency,
            RequestStatus status, Double latitude, Double longitude, String note, Instant createdAt
    ) {
        public static BloodRequestDto from(BloodRequest r) {
            return new BloodRequestDto(r.getId(), r.getRequesterUserId(), r.getBloodGroup(), r.getUnits(),
                    r.getUrgency(), r.getStatus(), r.getLatitude(), r.getLongitude(), r.getNote(), r.getCreatedAt());
        }
    }

    public record StatusUpdateRequest(@NotNull RequestStatus status) {}

    public record RequestResponseDto(
            Long id, Long bloodRequestId, Long responderUserId, Role responderRole,
            String status, Instant createdAt
    ) {
        public static RequestResponseDto from(RequestResponse r) {
            return new RequestResponseDto(r.getId(), r.getBloodRequestId(), r.getResponderUserId(),
                    r.getResponderRole(), r.getStatus(), r.getCreatedAt());
        }
    }
}

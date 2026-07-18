package com.pulse.dto;

import com.pulse.entity.BloodGroup;
import com.pulse.entity.Donor;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class DonorDtos {

    public record DonorDto(
            Long id, Long userId, String fullName, BloodGroup bloodGroup, String phone,
            Double latitude, Double longitude, String address, boolean available,
            LocalDate lastDonationDate, Double distanceKm
    ) {
        public static DonorDto from(Donor d) {
            return from(d, null);
        }
        public static DonorDto from(Donor d, Double distanceKm) {
            return new DonorDto(d.getId(), d.getUserId(), d.getFullName(), d.getBloodGroup(), d.getPhone(),
                    d.getLatitude(), d.getLongitude(), d.getAddress(), d.isAvailable(),
                    d.getLastDonationDate(), distanceKm);
        }
    }

    public record DonorUpdateRequest(
            @Size(min = 2, max = 120) String fullName,
            BloodGroup bloodGroup,
            @Pattern(regexp = "[+0-9() \\-]{7,25}") String phone,
            @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @Size(max = 500) String address,
            Boolean available,
            @PastOrPresent LocalDate lastDonationDate
    ) {}
}

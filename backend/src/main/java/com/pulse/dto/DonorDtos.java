package com.pulse.dto;

import com.pulse.entity.BloodGroup;
import com.pulse.entity.Donor;

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
            String fullName, BloodGroup bloodGroup, String phone,
            Double latitude, Double longitude, String address,
            Boolean available, LocalDate lastDonationDate
    ) {}
}

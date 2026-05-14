package com.pulse.dto;

import com.pulse.entity.BloodBank;
import com.pulse.entity.BloodGroup;
import com.pulse.entity.BloodStock;

import java.time.Instant;

public class BloodBankDtos {

    public record BloodBankDto(
            Long id, Long userId, String name, String phone,
            Double latitude, Double longitude, String address, boolean verified, Double distanceKm
    ) {
        public static BloodBankDto from(BloodBank b) {
            return from(b, null);
        }
        public static BloodBankDto from(BloodBank b, Double distanceKm) {
            return new BloodBankDto(b.getId(), b.getUserId(), b.getName(), b.getPhone(),
                    b.getLatitude(), b.getLongitude(), b.getAddress(), b.isVerified(), distanceKm);
        }
    }

    public record BloodBankUpdateRequest(
            String name, String phone, Double latitude, Double longitude, String address
    ) {}

    public record BloodStockDto(Long id, Long bloodBankId, BloodGroup bloodGroup, int units, Instant updatedAt) {
        public static BloodStockDto from(BloodStock s) {
            return new BloodStockDto(s.getId(), s.getBloodBankId(), s.getBloodGroup(), s.getUnits(), s.getUpdatedAt());
        }
    }

    public record StockUpsertItem(BloodGroup bloodGroup, int units) {}
}

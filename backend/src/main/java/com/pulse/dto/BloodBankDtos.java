package com.pulse.dto;

import com.pulse.entity.BloodBank;
import com.pulse.entity.BloodGroup;
import com.pulse.entity.BloodStock;
import jakarta.validation.constraints.*;

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
            @Size(min = 2, max = 160) String name,
            @Pattern(regexp = "[+0-9() \\-]{7,25}") String phone,
            @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @Size(max = 500) String address
    ) {}

    public record BloodStockDto(Long id, Long bloodBankId, BloodGroup bloodGroup, int units, Instant updatedAt) {
        public static BloodStockDto from(BloodStock s) {
            return new BloodStockDto(s.getId(), s.getBloodBankId(), s.getBloodGroup(), s.getUnits(), s.getUpdatedAt());
        }
    }

    public record StockUpsertItem(@NotNull BloodGroup bloodGroup, @Min(0) @Max(100000) int units) {}
}

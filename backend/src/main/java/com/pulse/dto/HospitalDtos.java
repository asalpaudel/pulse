package com.pulse.dto;

import com.pulse.entity.Hospital;
import jakarta.validation.constraints.*;

public class HospitalDtos {

    public record HospitalDto(
            Long id, Long userId, String name, String phone,
            Double latitude, Double longitude, String address, boolean verified
    ) {
        public static HospitalDto from(Hospital h) {
            return new HospitalDto(h.getId(), h.getUserId(), h.getName(), h.getPhone(),
                    h.getLatitude(), h.getLongitude(), h.getAddress(), h.isVerified());
        }
    }

    public record HospitalUpdateRequest(
            @Size(min = 2, max = 160) String name,
            @Pattern(regexp = "[+0-9() \\-]{7,25}") String phone,
            @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
            @Size(max = 500) String address
    ) {}
}

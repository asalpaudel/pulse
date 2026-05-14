package com.pulse.dto;

import com.pulse.entity.Hospital;

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
            String name, String phone, Double latitude, Double longitude, String address
    ) {}
}

package com.pulse.service;

import com.pulse.dto.HospitalDtos.*;
import com.pulse.entity.Hospital;
import com.pulse.exception.ApiException;
import com.pulse.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public Hospital requireByUserId(Long userId) {
        return hospitalRepository.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("Hospital profile not found"));
    }

    @Transactional(readOnly = true)
    public HospitalDto getByUserId(Long userId) {
        return HospitalDto.from(requireByUserId(userId));
    }

    @Transactional
    public HospitalDto updateOwn(Long userId, HospitalUpdateRequest req) {
        Hospital h = requireByUserId(userId);
        if (req.name() != null) h.setName(req.name());
        if (req.phone() != null) h.setPhone(req.phone());
        if (req.latitude() != null) h.setLatitude(req.latitude());
        if (req.longitude() != null) h.setLongitude(req.longitude());
        if (req.address() != null) h.setAddress(req.address());
        return HospitalDto.from(hospitalRepository.save(h));
    }
}

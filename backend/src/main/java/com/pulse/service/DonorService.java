package com.pulse.service;

import com.pulse.dto.DonorDtos.*;
import com.pulse.entity.BloodGroup;
import com.pulse.entity.Donor;
import com.pulse.exception.ApiException;
import com.pulse.repository.DonorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class DonorService {

    private final DonorRepository donorRepository;

    public DonorService(DonorRepository donorRepository) {
        this.donorRepository = donorRepository;
    }

    @Transactional(readOnly = true)
    public DonorDto getByUserId(Long userId) {
        return DonorDto.from(requireByUserId(userId));
    }

    @Transactional(readOnly = true)
    public DonorDto getById(Long id) {
        return DonorDto.from(donorRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Donor not found")));
    }

    public Donor requireByUserId(Long userId) {
        return donorRepository.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("Donor profile not found"));
    }

    @Transactional
    public DonorDto updateOwn(Long userId, DonorUpdateRequest req) {
        Donor d = requireByUserId(userId);
        if (req.fullName() != null) d.setFullName(req.fullName());
        if (req.bloodGroup() != null) d.setBloodGroup(req.bloodGroup());
        if (req.phone() != null) d.setPhone(req.phone());
        if (req.latitude() != null) d.setLatitude(req.latitude());
        if (req.longitude() != null) d.setLongitude(req.longitude());
        if (req.address() != null) d.setAddress(req.address());
        if (req.available() != null) d.setAvailable(req.available());
        if (req.lastDonationDate() != null) d.setLastDonationDate(req.lastDonationDate());
        return DonorDto.from(donorRepository.save(d));
    }

    @Transactional(readOnly = true)
    public List<DonorDto> search(BloodGroup bloodGroup, Double lat, Double lng, Double radiusKm) {
        List<Donor> candidates = bloodGroup != null
                ? donorRepository.findByBloodGroupAndAvailableTrue(bloodGroup)
                : donorRepository.findAll().stream().filter(Donor::isAvailable).toList();

        if (lat == null || lng == null) {
            return candidates.stream().map(DonorDto::from).toList();
        }
        double radius = radiusKm == null ? Double.MAX_VALUE : radiusKm;
        return candidates.stream()
                .map(d -> {
                    Double dist = GeoUtil.distanceKmOrNull(lat, lng, d.getLatitude(), d.getLongitude());
                    return DonorDto.from(d, dist);
                })
                .filter(dto -> dto.distanceKm() != null && dto.distanceKm() <= radius)
                .sorted(Comparator.comparingDouble(DonorDto::distanceKm))
                .toList();
    }
}

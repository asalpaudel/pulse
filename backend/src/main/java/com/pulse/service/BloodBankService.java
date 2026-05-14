package com.pulse.service;

import com.pulse.dto.BloodBankDtos.*;
import com.pulse.entity.BloodBank;
import com.pulse.entity.BloodStock;
import com.pulse.exception.ApiException;
import com.pulse.repository.BloodBankRepository;
import com.pulse.repository.BloodStockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class BloodBankService {

    private final BloodBankRepository bloodBankRepository;
    private final BloodStockRepository bloodStockRepository;

    public BloodBankService(BloodBankRepository bloodBankRepository,
                            BloodStockRepository bloodStockRepository) {
        this.bloodBankRepository = bloodBankRepository;
        this.bloodStockRepository = bloodStockRepository;
    }

    public BloodBank requireByUserId(Long userId) {
        return bloodBankRepository.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("Blood bank profile not found"));
    }

    public BloodBank requireById(Long id) {
        return bloodBankRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Blood bank not found"));
    }

    @Transactional(readOnly = true)
    public BloodBankDto getByUserId(Long userId) {
        return BloodBankDto.from(requireByUserId(userId));
    }

    @Transactional
    public BloodBankDto updateOwn(Long userId, BloodBankUpdateRequest req) {
        BloodBank b = requireByUserId(userId);
        if (req.name() != null) b.setName(req.name());
        if (req.phone() != null) b.setPhone(req.phone());
        if (req.latitude() != null) b.setLatitude(req.latitude());
        if (req.longitude() != null) b.setLongitude(req.longitude());
        if (req.address() != null) b.setAddress(req.address());
        return BloodBankDto.from(bloodBankRepository.save(b));
    }

    @Transactional(readOnly = true)
    public List<BloodBankDto> search(Double lat, Double lng, Double radiusKm) {
        List<BloodBank> all = bloodBankRepository.findAll();
        if (lat == null || lng == null) {
            return all.stream().map(BloodBankDto::from).toList();
        }
        double radius = radiusKm == null ? Double.MAX_VALUE : radiusKm;
        return all.stream()
                .map(b -> BloodBankDto.from(b, GeoUtil.distanceKmOrNull(lat, lng, b.getLatitude(), b.getLongitude())))
                .filter(dto -> dto.distanceKm() != null && dto.distanceKm() <= radius)
                .sorted(Comparator.comparingDouble(BloodBankDto::distanceKm))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BloodStockDto> getStock(Long bloodBankId) {
        requireById(bloodBankId);
        return bloodStockRepository.findByBloodBankId(bloodBankId)
                .stream().map(BloodStockDto::from).toList();
    }

    @Transactional
    public List<BloodStockDto> upsertOwnStock(Long userId, List<StockUpsertItem> items) {
        BloodBank bank = requireByUserId(userId);
        for (StockUpsertItem item : items) {
            BloodStock stock = bloodStockRepository
                    .findByBloodBankIdAndBloodGroup(bank.getId(), item.bloodGroup())
                    .orElseGet(() -> BloodStock.builder()
                            .bloodBankId(bank.getId())
                            .bloodGroup(item.bloodGroup())
                            .build());
            stock.setUnits(item.units());
            bloodStockRepository.save(stock);
        }
        return bloodStockRepository.findByBloodBankId(bank.getId())
                .stream().map(BloodStockDto::from).toList();
    }
}

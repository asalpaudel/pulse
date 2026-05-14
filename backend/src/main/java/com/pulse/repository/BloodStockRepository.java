package com.pulse.repository;

import com.pulse.entity.BloodGroup;
import com.pulse.entity.BloodStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BloodStockRepository extends JpaRepository<BloodStock, Long> {
    List<BloodStock> findByBloodBankId(Long bloodBankId);
    Optional<BloodStock> findByBloodBankIdAndBloodGroup(Long bloodBankId, BloodGroup bloodGroup);
}

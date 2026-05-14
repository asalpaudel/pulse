package com.pulse.repository;

import com.pulse.entity.BloodGroup;
import com.pulse.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DonorRepository extends JpaRepository<Donor, Long> {
    Optional<Donor> findByUserId(Long userId);
    List<Donor> findByBloodGroupAndAvailableTrue(BloodGroup bloodGroup);
}

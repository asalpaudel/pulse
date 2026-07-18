package com.pulse.repository;

import com.pulse.entity.BloodBank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BloodBankRepository extends JpaRepository<BloodBank, Long> {
    Optional<BloodBank> findByUserId(Long userId);
    List<BloodBank> findByUserIdIn(Collection<Long> userIds);
}

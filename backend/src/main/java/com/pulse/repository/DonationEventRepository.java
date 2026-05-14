package com.pulse.repository;

import com.pulse.entity.DonationEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationEventRepository extends JpaRepository<DonationEvent, Long> {
}

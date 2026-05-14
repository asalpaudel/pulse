package com.pulse.repository;

import com.pulse.entity.EventEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventEnrollmentRepository extends JpaRepository<EventEnrollment, Long> {
    List<EventEnrollment> findByDonationEventId(Long donationEventId);
    boolean existsByDonationEventIdAndDonorId(Long donationEventId, Long donorId);
}

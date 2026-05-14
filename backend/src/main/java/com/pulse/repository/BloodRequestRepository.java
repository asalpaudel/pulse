package com.pulse.repository;

import com.pulse.entity.BloodRequest;
import com.pulse.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findByStatus(RequestStatus status);
    List<BloodRequest> findByRequesterUserId(Long requesterUserId);
    List<BloodRequest> findByRequesterUserIdAndStatus(Long requesterUserId, RequestStatus status);
    long countByStatus(RequestStatus status);
}

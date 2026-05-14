package com.pulse.repository;

import com.pulse.entity.RequestResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestResponseRepository extends JpaRepository<RequestResponse, Long> {
    List<RequestResponse> findByBloodRequestId(Long bloodRequestId);
    boolean existsByBloodRequestIdAndResponderUserId(Long bloodRequestId, Long responderUserId);
}

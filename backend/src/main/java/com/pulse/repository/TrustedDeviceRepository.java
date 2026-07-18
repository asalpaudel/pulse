package com.pulse.repository;

import com.pulse.entity.TrustedDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrustedDeviceRepository extends JpaRepository<TrustedDevice, Long> {
    Optional<TrustedDevice> findByUserIdAndTokenHash(Long userId, String tokenHash);
}

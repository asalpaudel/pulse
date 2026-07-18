package com.pulse.repository;

import com.pulse.entity.TwoFactorChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TwoFactorChallengeRepository extends JpaRepository<TwoFactorChallenge, UUID> {
    Optional<TwoFactorChallenge> findByUserIdAndPurpose(Long userId, TwoFactorChallenge.Purpose purpose);
    void deleteByUserIdAndPurpose(Long userId, TwoFactorChallenge.Purpose purpose);
}

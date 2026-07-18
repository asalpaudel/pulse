package com.pulse.repository;

import com.pulse.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionUuid(String transactionUuid);
    List<Payment> findByStatusOrderByCreatedAtDesc(Payment.Status status);
    long countByStatus(Payment.Status status);
}

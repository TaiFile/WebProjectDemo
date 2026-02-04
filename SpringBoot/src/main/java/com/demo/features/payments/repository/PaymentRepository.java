package com.demo.features.payments.repository;

import com.demo.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    List<Payment> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Payment> findByIdAndUserId(String id, String userId);

    Optional<Payment> findByExternalId(String externalId);

    Optional<Payment> findByPreferenceId(String preferenceId);
}

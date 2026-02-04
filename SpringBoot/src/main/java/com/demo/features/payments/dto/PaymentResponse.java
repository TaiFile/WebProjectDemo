package com.demo.features.payments.dto;

import com.demo.domain.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        String id,
        String externalId,
        String preferenceId,
        String title,
        String description,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal totalAmount,
        Payment.PaymentStatus status,
        String paymentType,
        String initPoint,
        String sandboxInitPoint,
        String userId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

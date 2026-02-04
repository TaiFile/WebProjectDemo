package com.demo.features.products.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        String id,
        String name,
        String description,
        BigDecimal price,
        Integer stock,
        String imageUrl,
        String createdById,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

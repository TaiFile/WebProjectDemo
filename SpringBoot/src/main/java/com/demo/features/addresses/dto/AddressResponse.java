package com.demo.features.addresses.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AddressResponse(
        String id,
        String street,
        String number,
        String complement,
        String neighborhood,
        String city,
        String state,
        String zipCode,
        String country,
        BigDecimal latitude,
        BigDecimal longitude,
        String placeId,
        String formattedAddress,
        Boolean isDefault,
        String label,
        String userId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

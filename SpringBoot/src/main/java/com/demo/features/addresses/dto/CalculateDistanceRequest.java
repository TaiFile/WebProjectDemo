package com.demo.features.addresses.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CalculateDistanceRequest(
        @NotNull(message = "Latitude de origem é obrigatória")
        BigDecimal originLatitude,

        @NotNull(message = "Longitude de origem é obrigatória")
        BigDecimal originLongitude,

        @NotNull(message = "Latitude de destino é obrigatória")
        BigDecimal destinationLatitude,

        @NotNull(message = "Longitude de destino é obrigatória")
        BigDecimal destinationLongitude
) {
}

package com.demo.features.addresses.dto;

public record DistanceResponse(
        double distanceKm,
        String distanceText,
        int durationSeconds,
        String durationText,
        double straightLineDistanceKm
) {
}

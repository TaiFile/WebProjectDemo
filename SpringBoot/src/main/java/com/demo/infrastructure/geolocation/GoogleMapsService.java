package com.demo.infrastructure.geolocation;

import com.google.maps.DistanceMatrixApi;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.DistanceMatrix;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import com.google.maps.model.TravelMode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class GoogleMapsService {

    private final GeoApiContext geoApiContext;
    private final boolean isConfigured;

    public GoogleMapsService(@Value("${app.google-maps.api-key:}") String apiKey) {
        if (apiKey != null && !apiKey.isBlank()) {
            this.geoApiContext = new GeoApiContext.Builder()
                    .apiKey(apiKey)
                    .build();
            this.isConfigured = true;
            log.info("Google Maps API configured successfully");
        } else {
            this.geoApiContext = null;
            this.isConfigured = false;
            log.warn("Google Maps API key not configured. Geolocation features will be limited.");
        }
    }

    public GeocodingResult geocode(String address) {
        if (!isConfigured) {
            log.warn("Google Maps not configured, returning null for geocode");
            return null;
        }

        try {
            com.google.maps.model.GeocodingResult[] results = GeocodingApi.geocode(geoApiContext, address).await();

            if (results != null && results.length > 0) {
                var result = results[0];
                return new GeocodingResult(
                        result.geometry.location.lat,
                        result.geometry.location.lng,
                        result.placeId,
                        result.formattedAddress
                );
            }
        } catch (Exception e) {
            log.error("Error geocoding address: {}", e.getMessage());
        }

        return null;
    }

    public DistanceResult calculateDistance(double originLat, double originLng, double destLat, double destLng) {
        if (!isConfigured) {
            double straightLine = calculateStraightLineDistance(originLat, originLng, destLat, destLng);
            return new DistanceResult(
                    straightLine,
                    String.format("%.1f km", straightLine),
                    0,
                    "N/A"
            );
        }

        try {
            LatLng origin = new LatLng(originLat, originLng);
            LatLng destination = new LatLng(destLat, destLng);

            DistanceMatrix result = DistanceMatrixApi.newRequest(geoApiContext)
                    .origins(origin)
                    .destinations(destination)
                    .mode(TravelMode.DRIVING)
                    .await();

            if (result.rows.length > 0 && result.rows[0].elements.length > 0) {
                var element = result.rows[0].elements[0];
                return new DistanceResult(
                        element.distance.inMeters / 1000.0,
                        element.distance.humanReadable,
                        (int) element.duration.inSeconds,
                        element.duration.humanReadable
                );
            }
        } catch (Exception e) {
            log.error("Error calculating distance: {}", e.getMessage());
        }

        double straightLine = calculateStraightLineDistance(originLat, originLng, destLat, destLng);
        return new DistanceResult(straightLine, String.format("%.1f km", straightLine), 0, "N/A");
    }

    public double calculateStraightLineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    public record GeocodingResult(double latitude, double longitude, String placeId, String formattedAddress) {}

    public record DistanceResult(double distanceKm, String distanceText, int durationSeconds, String durationText) {}
}

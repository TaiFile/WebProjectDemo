package com.demo.features.addresses.service;

import com.demo.features.addresses.repository.AddressRepository;

import com.demo.common.exception.ResourceNotFoundException;
import com.demo.features.addresses.dto.AddressResponse;
import com.demo.features.addresses.dto.CalculateDistanceRequest;
import com.demo.features.addresses.dto.CreateAddressRequest;
import com.demo.features.addresses.dto.DistanceResponse;
import com.demo.features.addresses.dto.UpdateAddressRequest;
import com.demo.domain.User;
import com.demo.domain.Address;
import com.demo.features.users.repository.UserRepository;
import com.demo.infrastructure.geolocation.GoogleMapsService;
import com.demo.infrastructure.geolocation.GoogleMapsService.GeocodingResult;
import com.demo.infrastructure.geolocation.GoogleMapsService.DistanceResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final GoogleMapsService googleMapsService;

    @Transactional
    public AddressResponse create(String userId, CreateAddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½rio nÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½o encontrado"));

        String fullAddress = buildFullAddress(request);
        GeocodingResult geocoding = googleMapsService.geocode(fullAddress);

        if (Boolean.TRUE.equals(request.isDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(defaultAddress -> {
                        defaultAddress.setIsDefault(false);
                        addressRepository.save(defaultAddress);
                    });
        }

        Address address = Address.builder()
                .street(request.street())
                .number(request.number())
                .complement(request.complement())
                .neighborhood(request.neighborhood())
                .city(request.city())
                .state(request.state())
                .zipCode(request.zipCode())
                .country(request.country() != null ? request.country() : "Brasil")
                .label(request.label())
                .isDefault(request.isDefault() != null ? request.isDefault() : false)
                .user(user)
                .build();

        if (geocoding != null) {
            address.setLatitude(geocoding.latitude());
            address.setLongitude(geocoding.longitude());
            address.setPlaceId(geocoding.placeId());
            address.setFormattedAddress(geocoding.formattedAddress());
        }

        address = addressRepository.save(address);

        log.info("Address created: {} for user {}", address.getId(), userId);

        return mapToResponse(address);
    }

    public List<AddressResponse> getUserAddresses(String userId) {
        return addressRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public AddressResponse getById(String id, String userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("EndereÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½o nÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½o encontrado"));

        return mapToResponse(address);
    }

    @Transactional
    public AddressResponse update(String id, String userId, UpdateAddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("EndereÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½o nÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½o encontrado"));

        boolean addressChanged = false;

        if (request.street() != null) {
            address.setStreet(request.street());
            addressChanged = true;
        }
        if (request.number() != null) {
            address.setNumber(request.number());
            addressChanged = true;
        }
        if (request.complement() != null) {
            address.setComplement(request.complement());
        }
        if (request.neighborhood() != null) {
            address.setNeighborhood(request.neighborhood());
            addressChanged = true;
        }
        if (request.city() != null) {
            address.setCity(request.city());
            addressChanged = true;
        }
        if (request.state() != null) {
            address.setState(request.state());
            addressChanged = true;
        }
        if (request.zipCode() != null) {
            address.setZipCode(request.zipCode());
            addressChanged = true;
        }
        if (request.country() != null) {
            address.setCountry(request.country());
        }
        if (request.label() != null) {
            address.setLabel(request.label());
        }

        if (Boolean.TRUE.equals(request.isDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(defaultAddress -> {
                        if (!defaultAddress.getId().equals(id)) {
                            defaultAddress.setIsDefault(false);
                            addressRepository.save(defaultAddress);
                        }
                    });
            address.setIsDefault(true);
        } else if (request.isDefault() != null) {
            address.setIsDefault(false);
        }

        if (addressChanged) {
            String fullAddress = buildFullAddressFromEntity(address);
            GeocodingResult geocoding = googleMapsService.geocode(fullAddress);

            if (geocoding != null) {
                address.setLatitude(geocoding.latitude());
                address.setLongitude(geocoding.longitude());
                address.setPlaceId(geocoding.placeId());
                address.setFormattedAddress(geocoding.formattedAddress());
            }
        }

        address = addressRepository.save(address);

        log.info("Address updated: {}", address.getId());

        return mapToResponse(address);
    }

    @Transactional
    public void delete(String id, String userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("EndereÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½o nÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½o encontrado"));

        addressRepository.delete(address);

        log.info("Address deleted: {}", id);
    }

    public DistanceResponse calculateDistance(CalculateDistanceRequest request) {
        DistanceResult result = googleMapsService.calculateDistance(
                request.originLatitude().doubleValue(),
                request.originLongitude().doubleValue(),
                request.destinationLatitude().doubleValue(),
                request.destinationLongitude().doubleValue()
        );

        double straightLine = googleMapsService.calculateStraightLineDistance(
                request.originLatitude().doubleValue(),
                request.originLongitude().doubleValue(),
                request.destinationLatitude().doubleValue(),
                request.destinationLongitude().doubleValue()
        );

        return new DistanceResponse(
                result.distanceKm(),
                result.distanceText(),
                result.durationSeconds(),
                result.durationText(),
                straightLine
        );
    }

    private String buildFullAddress(CreateAddressRequest request) {
        return String.format("%s, %s - %s, %s - %s, %s",
                request.street(),
                request.number(),
                request.neighborhood(),
                request.city(),
                request.state(),
                request.zipCode());
    }

    private String buildFullAddressFromEntity(Address address) {
        return String.format("%s, %s - %s, %s - %s, %s",
                address.getStreet(),
                address.getNumber(),
                address.getNeighborhood(),
                address.getCity(),
                address.getState(),
                address.getZipCode());
    }

    private AddressResponse mapToResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getStreet(),
                address.getNumber(),
                address.getComplement(),
                address.getNeighborhood(),
                address.getCity(),
                address.getState(),
                address.getZipCode(),
                address.getCountry() != null ? address.getCountry() : "Brasil",
                address.getLatitude() != null ? BigDecimal.valueOf(address.getLatitude()) : null,
                address.getLongitude() != null ? BigDecimal.valueOf(address.getLongitude()) : null,
                null, // placeId nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o existe no domain
                null, // formattedAddress nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o existe no domain
                address.getIsDefault(),
                null, // label nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o existe no domain
                address.getUser().getId(),
                address.getCreatedAt(),
                address.getUpdatedAt()
        );
    }
}

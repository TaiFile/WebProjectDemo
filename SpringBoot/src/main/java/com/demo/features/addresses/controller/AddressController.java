package com.demo.features.addresses.controller;

import com.demo.features.addresses.service.AddressService;

import com.demo.features.addresses.dto.AddressResponse;
import com.demo.features.addresses.dto.CalculateDistanceRequest;
import com.demo.features.addresses.dto.CreateAddressRequest;
import com.demo.features.addresses.dto.DistanceResponse;
import com.demo.features.addresses.dto.UpdateAddressRequest;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<AddressResponse> create(
            Authentication auth,
            @Valid @RequestBody CreateAddressRequest request
    ) {
        String userId = auth.getName();
        AddressResponse response = addressService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getUserAddresses(Authentication auth) {
        String userId = auth.getName();
        List<AddressResponse> response = addressService.getUserAddresses(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressResponse> getById(
            @PathVariable String id,
            Authentication auth
    ) {
        String userId = auth.getName();
        AddressResponse response = addressService.getById(id, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AddressResponse> update(
            @PathVariable String id,
            Authentication auth,
            @Valid @RequestBody UpdateAddressRequest request
    ) {
        String userId = auth.getName();
        AddressResponse response = addressService.update(id, userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            Authentication auth
    ) {
        String userId = auth.getName();
        addressService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/calculate-distance")
    public ResponseEntity<DistanceResponse> calculateDistance(
            @Valid @RequestBody CalculateDistanceRequest request
    ) {
        DistanceResponse response = addressService.calculateDistance(request);
        return ResponseEntity.ok(response);
    }
}

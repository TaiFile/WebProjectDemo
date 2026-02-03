package com.demo.features.addresses.controller;

import com.demo.features.addresses.service.AddressService;

import com.demo.common.security.CurrentUser;
import com.demo.common.security.UserPrincipal;
import com.demo.features.addresses.dto.AddressResponse;
import com.demo.features.addresses.dto.CalculateDistanceRequest;
import com.demo.features.addresses.dto.CreateAddressRequest;
import com.demo.features.addresses.dto.DistanceResponse;
import com.demo.features.addresses.dto.UpdateAddressRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@Tag(name = "Addresses", description = "Gerenciamento de endereÃƒÆ’Ã‚Â§os")
@SecurityRequirement(name = "bearerAuth")
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    @Operation(summary = "Criar endereÃƒÆ’Ã‚Â§o")
    public ResponseEntity<AddressResponse> create(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateAddressRequest request
    ) {
        AddressResponse response = addressService.create(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar endereÃƒÆ’Ã‚Â§os do usuÃƒÆ’Ã‚Â¡rio")
    public ResponseEntity<List<AddressResponse>> getUserAddresses(@CurrentUser UserPrincipal currentUser) {
        List<AddressResponse> response = addressService.getUserAddresses(currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter endereÃƒÆ’Ã‚Â§o por ID")
    public ResponseEntity<AddressResponse> getById(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser
    ) {
        AddressResponse response = addressService.getById(id, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualizar endereÃƒÆ’Ã‚Â§o")
    public ResponseEntity<AddressResponse> update(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody UpdateAddressRequest request
    ) {
        AddressResponse response = addressService.update(id, currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar endereÃƒÆ’Ã‚Â§o")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser
    ) {
        addressService.delete(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/calculate-distance")
    @Operation(summary = "Calcular distÃƒÆ’Ã‚Â¢ncia entre dois pontos")
    public ResponseEntity<DistanceResponse> calculateDistance(
            @Valid @RequestBody CalculateDistanceRequest request
    ) {
        DistanceResponse response = addressService.calculateDistance(request);
        return ResponseEntity.ok(response);
    }
}

package com.demo.features.addresses.dto;

import jakarta.validation.constraints.Size;

public record UpdateAddressRequest(
        String street,
        String number,
        String complement,
        String neighborhood,
        String city,

        @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres")
        String state,

        String zipCode,
        String country,
        String label,
        Boolean isDefault
) {
}

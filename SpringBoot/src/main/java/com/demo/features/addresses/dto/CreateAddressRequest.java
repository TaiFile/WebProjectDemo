package com.demo.features.addresses.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAddressRequest(
        @NotBlank(message = "Rua é obrigatória")
        String street,

        @NotBlank(message = "Número é obrigatório")
        String number,

        String complement,

        @NotBlank(message = "Bairro é obrigatório")
        String neighborhood,

        @NotBlank(message = "Cidade é obrigatória")
        String city,

        @NotBlank(message = "Estado é obrigatório")
        @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres")
        String state,

        @NotBlank(message = "CEP é obrigatório")
        String zipCode,

        String country,
        String label,
        Boolean isDefault
) {
}

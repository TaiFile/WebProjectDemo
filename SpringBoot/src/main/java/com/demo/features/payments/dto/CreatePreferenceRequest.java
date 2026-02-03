package com.demo.features.payments.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreatePreferenceRequest(
        @NotBlank(message = "Título é obrigatório")
        String title,

        String description,

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade deve ser pelo menos 1")
        Integer quantity,

        @NotNull(message = "Preço unitário é obrigatório")
        @Positive(message = "Preço unitário deve ser positivo")
        BigDecimal unitPrice,

        String externalReference,
        String payerEmail
) {
}

package com.demo.features.products.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record UpdateProductRequest(
        String name,

        String description,

        @Positive(message = "Preço deve ser positivo")
        BigDecimal price,

        @Min(value = 0, message = "Estoque não pode ser negativo")
        Integer stock,

        String imageUrl
) {
}

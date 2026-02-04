package com.demo.features.products.dto;

import java.util.List;

public record ProductListResponse(
        List<ProductResponse> products,
        long total,
        int page,
        int limit
) {
}

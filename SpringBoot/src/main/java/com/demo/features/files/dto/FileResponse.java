package com.demo.features.files.dto;

import java.time.LocalDateTime;

public record FileResponse(
        String id,
        String originalName,
        String storedName,
        String mimeType,
        Long size,
        String url,
        String storageType,
        String uploadedById,
        LocalDateTime createdAt
) {
}

package com.demo.features.files.dto;

public record UploadResponse(
        String message,
        FileResponse file
) {
}

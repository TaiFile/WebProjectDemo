package com.demo.features.users.dto;

import java.time.LocalDateTime;

public record UserResponse(
        String id,
        String name,
        String email,
        String role,
        Boolean emailConfirmed,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

package com.demo.features.auth.dto;

public record RegisterResponse(
        String message,
        UserInfo user
) {
    public record UserInfo(
            String id,
            String email,
            String name
    ) {
    }
}

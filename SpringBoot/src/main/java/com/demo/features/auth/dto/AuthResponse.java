package com.demo.features.auth.dto;

public record AuthResponse(
        String accessToken,
        UserInfo user
) {
    public record UserInfo(
            String id,
            String email,
            String name
    ) {
    }
}

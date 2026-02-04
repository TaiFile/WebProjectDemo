package com.demo.features.users.controller;

import com.demo.features.users.service.UserService;

import com.demo.features.users.dto.UpdateUserRequest;
import com.demo.features.users.dto.UserResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication auth) {
        String userId = auth.getName();
        UserResponse response = userService.getById(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable String id) {
        UserResponse response = userService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            Authentication auth,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        String userId = auth.getName();
        UserResponse response = userService.update(userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(Authentication auth) {
        String userId = auth.getName();
        userService.delete(userId);
        return ResponseEntity.noContent().build();
    }
}

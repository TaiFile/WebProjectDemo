package com.demo.features.auth.controller;

import com.demo.features.auth.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.security.core.Authentication;
import com.demo.features.auth.dto.AuthResponse;
import com.demo.features.auth.dto.LoginRequest;
import com.demo.features.auth.dto.MessageResponse;
import com.demo.features.auth.dto.RegisterRequest;
import com.demo.features.auth.dto.RegisterResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Registrar novo usuÃƒÂ¡rio")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/confirm-email")
    @Operation(summary = "Confirmar email do usuÃƒÂ¡rio")
    public ResponseEntity<MessageResponse> confirmEmail(@RequestParam String token) {
        MessageResponse response = authService.confirmEmail(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}

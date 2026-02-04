package com.demo.features.auth.service;

import com.demo.common.exception.BusinessException;
import com.demo.domain.User;
import com.demo.features.auth.dto.AuthResponse;
import com.demo.features.auth.dto.LoginRequest;
import com.demo.features.auth.dto.MessageResponse;
import com.demo.features.auth.dto.RegisterRequest;
import com.demo.features.auth.dto.RegisterResponse;
import com.demo.features.users.repository.UserRepository;
import com.demo.infrastructure.mail.IMailService;
import com.demo.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final IMailService mailService;
    private final ApplicationEventPublisher eventPublisher;

    @org.springframework.beans.factory.annotation.Value("${app.auth.require-email-confirmation:true}")
    private boolean requireEmailConfirmation;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.email());

        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email já está em uso");
        }

        String emailConfirmationToken = UUID.randomUUID().toString();
        LocalDateTime tokenExpires = LocalDateTime.now().plusHours(24);

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role("USER")
                .emailConfirmed(false)
                .emailConfirmationToken(emailConfirmationToken)
                .emailConfirmationExpires(tokenExpires)
                .build();

        user = userRepository.save(user);

        // Enviar email de forma assíncrona após o commit
        String userEmail = user.getEmail();
        String token = emailConfirmationToken;

        // Usando TransactionSynchronization para garantir que o email é enviado após o commit
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
            new org.springframework.transaction.support.TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        mailService.sendConfirmationEmail(userEmail, token);
                        log.info("✅ Confirmation email queued for: {}", userEmail);
                    } catch (Exception e) {
                        log.error("❌ Failed to queue confirmation email: {}", e.getMessage());
                    }
                }
            }
        );

        log.info("User registered successfully: {}", user.getId());

        return new RegisterResponse(
                "Usuário registrado com sucesso! Verifique seu email para confirmar a conta.",
                new RegisterResponse.UserInfo(user.getId(), user.getEmail(), user.getName())
        );
    }

    @Transactional
    public MessageResponse confirmEmail(String token) {
        log.info("Confirming email with token: {}", token);

        User user = userRepository.findByEmailConfirmationToken(token)
                .orElseThrow(() -> new BusinessException("Token de confirmação inválido"));

        if (user.getEmailConfirmed()) {
            return new MessageResponse("Email já foi confirmado anteriormente");
        }

        if (user.getEmailConfirmationExpires().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Token de confirmação expirado");
        }

        user.setEmailConfirmed(true);
        user.setEmailConfirmationToken(null);
        user.setEmailConfirmationExpires(null);
        userRepository.save(user);

        log.info("Email confirmed for user: {}", user.getId());

        return new MessageResponse("Email confirmado com sucesso! Agora você pode fazer login.");
    }

    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.email());

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Email ou senha inválidos"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException("Email ou senha inválidos");
        }

        if (requireEmailConfirmation && !user.getEmailConfirmed()) {
            throw new BusinessException("Email não confirmado. Verifique sua caixa de entrada.");
        }

        List<String> roles = List.of(user.getRole());
        String token = jwtService.generateToken(user.getId(), user.getEmail(), roles);

        log.info("User logged in successfully: {}", user.getId());

        return new AuthResponse(
                token,
                new AuthResponse.UserInfo(user.getId(), user.getEmail(), user.getName())
        );
    }
}

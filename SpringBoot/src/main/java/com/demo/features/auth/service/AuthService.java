package com.demo.features.auth.service;

import com.demo.common.security.JwtService;
import com.demo.common.security.UserPrincipal;
import com.demo.features.auth.dto.AuthResponse;
import com.demo.features.auth.dto.LoginRequest;
import com.demo.features.auth.dto.MessageResponse;
import com.demo.features.auth.dto.RegisterRequest;
import com.demo.features.auth.dto.RegisterResponse;
import com.demo.domain.User;
import com.demo.features.users.repository.UserRepository;
import com.demo.infrastructure.mail.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email jÃƒÂ¡ cadastrado");
        }

        String emailConfirmationToken = UUID.randomUUID().toString();
        LocalDateTime emailConfirmationExpires = LocalDateTime.now().plusHours(24);

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .emailConfirmationToken(emailConfirmationToken)
                .emailConfirmationExpires(emailConfirmationExpires)
                .emailConfirmed(false)
                .role("USER")
                .build();

        user = userRepository.save(user);

        mailService.sendConfirmationEmail(user.getEmail(), emailConfirmationToken);

        log.info("User registered: {}", user.getEmail());

        return new RegisterResponse(
                "UsuÃƒÂ¡rio criado com sucesso. Verifique seu email para confirmar a conta.",
                new RegisterResponse.UserInfo(
                        user.getId(),
                        user.getEmail(),
                        user.getName()
                )
        );
    }

    @Transactional
    public MessageResponse confirmEmail(String token) {
        User user = userRepository.findByEmailConfirmationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de confirmaÃƒÂ§ÃƒÂ£o invÃƒÂ¡lido ou expirado"));

        if (user.getEmailConfirmationExpires().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token de confirmaÃƒÂ§ÃƒÂ£o expirado");
        }

        user.setEmailConfirmed(true);
        user.setEmailConfirmationToken(null);
        user.setEmailConfirmationExpires(null);
        userRepository.save(user);

        log.info("Email confirmed for user: {}", user.getEmail());

        return new MessageResponse("Email confirmado com sucesso!");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Email ou senha incorretos"));

        if (!user.getEmailConfirmed()) {
            throw new IllegalArgumentException("Por favor, confirme seu email para fazer login");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Email ou senha incorretos");
        }

        String accessToken = jwtService.generateToken(user.getId(), user.getEmail());

        log.info("User logged in: {}", user.getEmail());

        return new AuthResponse(
                accessToken,
                new AuthResponse.UserInfo(
                        user.getId(),
                        user.getEmail(),
                        user.getName()
                )
        );
    }

    public UserPrincipal validateUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("UsuÃƒÂ¡rio nÃƒÂ£o encontrado"));

        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .password(user.getPassword())
                .emailConfirmed(user.getEmailConfirmed())
                .role(user.getRole())
                .build();
    }
}

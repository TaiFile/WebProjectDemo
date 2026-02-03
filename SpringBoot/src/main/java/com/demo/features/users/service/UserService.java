package com.demo.features.users.service;

import com.demo.features.users.repository.UserRepository;

import com.demo.common.exception.ResourceNotFoundException;
import com.demo.features.users.dto.UpdateUserRequest;
import com.demo.features.users.dto.UserResponse;
import com.demo.domain.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃƒÆ’Ã‚Â¡rio nÃƒÆ’Ã‚Â£o encontrado"));

        return mapToResponse(user);
    }

    public UserResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃƒÆ’Ã‚Â¡rio nÃƒÆ’Ã‚Â£o encontrado"));

        return mapToResponse(user);
    }

    @Transactional
    public UserResponse update(String id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃƒÆ’Ã‚Â¡rio nÃƒÆ’Ã‚Â£o encontrado"));

        if (request.name() != null) {
            user.setName(request.name());
        }

        if (request.password() != null) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        user = userRepository.save(user);

        log.info("User updated: {}", user.getEmail());

        return mapToResponse(user);
    }

    @Transactional
    public void delete(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃƒÆ’Ã‚Â¡rio nÃƒÆ’Ã‚Â£o encontrado"));

        userRepository.delete(user);

        log.info("User deleted: {}", user.getEmail());
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getEmailConfirmed(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}

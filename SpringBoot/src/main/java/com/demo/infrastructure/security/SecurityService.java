package com.demo.infrastructure.security;

import com.demo.domain.User;
import com.demo.features.users.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service para verificar permissões customizadas usando @PreAuthorize
 */
@Service
public class SecurityService {

    private final UserRepository userRepository;

    public SecurityService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Verifica se o usuário autenticado é o dono do recurso
     * Uso: @PreAuthorize("@securityService.isOwner(authentication, #userId)")
     */
    public boolean isOwner(Authentication authentication, String userId) {
        if (authentication == null || userId == null) {
            return false;
        }
        return authentication.getName().equals(userId);
    }

    /**
     * Verifica se o usuário autenticado é ADMIN ou dono do recurso
     * Uso: @PreAuthorize("@securityService.isAdminOrOwner(authentication, #userId)")
     */
    public boolean isAdminOrOwner(Authentication authentication, String userId) {
        if (authentication == null) {
            return false;
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        return isAdmin || authentication.getName().equals(userId);
    }

    /**
     * Verifica se o usuário autenticado pode acessar um produto
     * (é o criador ou é ADMIN)
     */
    public boolean canAccessProduct(Authentication authentication, String productCreatorId) {
        return isAdminOrOwner(authentication, productCreatorId);
    }

    /**
     * Verifica se o usuário autenticado pode acessar um endereço
     * (é o dono ou é ADMIN)
     */
    public boolean canAccessAddress(Authentication authentication, String addressUserId) {
        return isAdminOrOwner(authentication, addressUserId);
    }

    /**
     * Verifica se o usuário autenticado pode acessar um pagamento
     * (é o dono ou é ADMIN)
     */
    public boolean canAccessPayment(Authentication authentication, String paymentUserId) {
        return isAdminOrOwner(authentication, paymentUserId);
    }

    /**
     * Verifica se o usuário tem email confirmado
     */
    public boolean hasEmailConfirmed(Authentication authentication) {
        if (authentication == null) {
            return false;
        }

        String userId = authentication.getName();
        Optional<User> user = userRepository.findById(userId);

        return user.map(User::getEmailConfirmed).orElse(false);
    }
}

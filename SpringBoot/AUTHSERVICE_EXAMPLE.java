// EXEMPLO: Como atualizar o AuthService para usar o novo JwtService

// ❌ ANTES (código antigo):
@Service
public class AuthService {
    private final JwtService jwtService; // Antigo JJWT

    public AuthResponse login(LoginRequest request) {
        // ...autenticação...

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName());
    }
}

// ✅ DEPOIS (código novo):
@Service
public class AuthService {
    private final JwtService jwtService; // Novo (infrastructure/security)

    public AuthResponse login(LoginRequest request) {
        // ...autenticação...

        // Determinar roles do usuário
        List<String> roles = List.of(user.getRole()); // Ex: ["USER"] ou ["ADMIN"]

        // Gerar token com roles
        String token = jwtService.generateToken(user.getId(), user.getEmail(), roles);

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName());
    }
}

// 📝 NOTA: Se o User tiver múltiplas roles, ajuste conforme necessário:
// List<String> roles = user.getRoles().stream()
//         .map(Role::getName)
//         .collect(Collectors.toList());

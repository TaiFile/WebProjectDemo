package com.demo.example;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 📚 EXEMPLO COMPLETO: Uso de @PreAuthorize em Controllers
 *
 * Este arquivo demonstra como usar autorização declarativa com @PreAuthorize
 */
@RestController
@RequestMapping("/products")
public class ProductControllerExample {

    // ✅ EXEMPLO 1: Endpoint Público (sem autenticação)
    @GetMapping
    public ResponseEntity<List<ProductResponse>> list() {
        // Qualquer pessoa pode listar produtos (mesmo não autenticada)
        return ResponseEntity.ok(productService.list());
    }

    // ✅ EXEMPLO 2: Apenas Usuários Autenticados
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProductResponse> create(
            Authentication auth,
            @RequestBody CreateProductRequest request
    ) {
        String userId = auth.getName(); // Obtém o ID do usuário do token
        return ResponseEntity.ok(productService.create(userId, request));
    }

    // ✅ EXEMPLO 3: Apenas Admin
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        // Apenas usuários com role ADMIN podem acessar
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // ✅ EXEMPLO 4: Admin OU Dono do Recurso
    @PatchMapping("/{id}")
    @PreAuthorize("@securityService.canAccessProduct(authentication, #id) or hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> update(
            @PathVariable String id,
            @RequestBody UpdateProductRequest request
    ) {
        // Admin ou criador do produto pode editar
        return ResponseEntity.ok(productService.update(id, request));
    }

    // ✅ EXEMPLO 5: Verificar Propriedade Antes de Deletar
    @DeleteMapping("/{id}")
    @PreAuthorize("@securityService.canAccessProduct(authentication, #id)")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        // Apenas o criador pode deletar
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ EXEMPLO 6: Múltiplas Condições (AND/OR)
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') and @securityService.hasEmailConfirmed(authentication)")
    public ResponseEntity<Void> approve(@PathVariable String id) {
        // Precisa ser ADMIN E ter email confirmado
        productService.approve(id);
        return ResponseEntity.ok().build();
    }

    // ✅ EXEMPLO 7: Usar Variável do RequestBody
    @PostMapping("/for-user")
    @PreAuthorize("@securityService.isOwner(authentication, #request.userId) or hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createForUser(
            @RequestBody CreateProductForUserRequest request
    ) {
        // Apenas o próprio usuário ou admin pode criar produto para um usuário
        return ResponseEntity.ok(productService.createForUser(request));
    }

    // ✅ EXEMPLO 8: Email Confirmado Obrigatório
    @PostMapping("/premium")
    @PreAuthorize("isAuthenticated() and @securityService.hasEmailConfirmed(authentication)")
    public ResponseEntity<ProductResponse> createPremium(
            Authentication auth,
            @RequestBody CreateProductRequest request
    ) {
        // Precisa estar autenticado E ter email confirmado
        String userId = auth.getName();
        return ResponseEntity.ok(productService.createPremium(userId, request));
    }

    // ✅ EXEMPLO 9: Negar Acesso (ROLE_USER não pode)
    @DeleteMapping("/all")
    @PreAuthorize("hasRole('ADMIN') and !hasRole('USER')")
    public ResponseEntity<Void> deleteAll() {
        // Apenas ADMIN (e não USER) pode deletar tudo
        productService.deleteAll();
        return ResponseEntity.noContent().build();
    }

    // ✅ EXEMPLO 10: Expressão Complexa
    @PatchMapping("/{id}/transfer")
    @PreAuthorize(
        "@securityService.isOwner(authentication, #currentOwnerId) and " +
        "@securityService.isAdminOrOwner(authentication, #newOwnerId)"
    )
    public ResponseEntity<Void> transferOwnership(
            @PathVariable String id,
            @RequestParam String currentOwnerId,
            @RequestParam String newOwnerId
    ) {
        // Apenas o dono atual pode transferir, e só para outro admin/owner
        productService.transferOwnership(id, newOwnerId);
        return ResponseEntity.ok().build();
    }
}

/**
 * 📖 RESUMO DAS EXPRESSÕES SpEL MAIS COMUNS:
 *
 * ✅ isAuthenticated()                        → Qualquer usuário autenticado
 * ✅ isAnonymous()                             → Não autenticado
 * ✅ hasRole('ADMIN')                          → Tem role ADMIN
 * ✅ hasAnyRole('ADMIN', 'USER')               → Tem ADMIN OU USER
 * ✅ hasAuthority('WRITE')                     → Tem autoridade WRITE
 * ✅ principal.username == 'admin'             → Username específico
 * ✅ authentication.name == #userId            → Compara com parâmetro
 * ✅ @securityService.isOwner(...)             → Método customizado
 * ✅ #id == authentication.name                → Compara parâmetro com userId
 *
 * ⚠️ OPERADORES LÓGICOS:
 * - and    → E lógico
 * - or     → OU lógico
 * - !      → NÃO lógico
 *
 * 🎯 ACESSAR PARÂMETROS:
 * - #variavel          → Parâmetro do método (@PathVariable, @RequestParam, @RequestBody)
 * - #request.userId    → Propriedade do objeto request
 * - authentication     → Objeto Authentication atual
 */

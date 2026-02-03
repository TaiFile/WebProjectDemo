package com.demo.features.products.controller;

import com.demo.features.products.service.ProductService;

import com.demo.common.security.CurrentUser;
import com.demo.common.security.UserPrincipal;
import com.demo.features.products.dto.CreateProductRequest;
import com.demo.features.products.dto.ProductListResponse;
import com.demo.features.products.dto.ProductResponse;
import com.demo.features.products.dto.UpdateProductRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Gerenciamento de produtos")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Criar produto")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ProductResponse> create(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateProductRequest request
    ) {
        ProductResponse response = productService.create(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar produtos")
    public ResponseEntity<ProductListResponse> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search
    ) {
        ProductListResponse response = productService.list(page, limit, search);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter produto por ID")
    public ResponseEntity<ProductResponse> getById(@PathVariable String id) {
        ProductResponse response = productService.getById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualizar produto")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ProductResponse> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        ProductResponse response = productService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar produto (soft delete)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

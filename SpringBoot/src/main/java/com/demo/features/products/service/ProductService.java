package com.demo.features.products.service;

import com.demo.features.products.repository.ProductRepository;

import com.demo.common.exception.BusinessException;
import com.demo.common.exception.ResourceNotFoundException;
import com.demo.features.products.dto.CreateProductRequest;
import com.demo.features.products.dto.ProductListResponse;
import com.demo.features.products.dto.ProductResponse;
import com.demo.features.products.dto.UpdateProductRequest;
import com.demo.domain.User;
import com.demo.domain.Product;
import com.demo.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProductResponse create(String userId, CreateProductRequest request) {
        if (request.price().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("PreÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o deve ser maior que zero");
        }

        if (request.stock() < 0) {
            throw new BusinessException("Estoque nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o pode ser negativo");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UsuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrado"));

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .stock(request.stock())
                .imageUrl(request.imageUrl())
                .createdBy(user)
                .build();

        product = productRepository.save(product);

        log.info("Product created: {} by user {}", product.getId(), userId);

        return mapToResponse(product);
    }

    public ProductListResponse list(int page, int limit, String search) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Product> productPage = productRepository.findAllWithSearch(search, pageable);

        List<ProductResponse> products = productPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .toList();

        return new ProductListResponse(
                products,
                productPage.getTotalElements(),
                page,
                limit
        );
    }

    public ProductResponse getById(String id) {
        Product product = productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse update(String id, UpdateProductRequest request) {
        Product product = productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));

        if (request.price() != null && request.price().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Preço deve ser maior que zero");
        }

        if (request.stock() != null && request.stock() < 0) {
            throw new BusinessException("Estoque não pode ser negativo");
        }

        if (request.name() != null) {
            product.setName(request.name());
        }
        if (request.description() != null) {
            product.setDescription(request.description());
        }
        if (request.price() != null) {
            product.setPrice(request.price());
        }
        if (request.stock() != null) {
            product.setStock(request.stock());
        }
        if (request.imageUrl() != null) {
            product.setImageUrl(request.imageUrl());
        }

        product = productRepository.save(product);

        log.info("Product updated: {}", product.getId());

        return mapToResponse(product);
    }

    @Transactional
    public void delete(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado"));

        product.setActive(false);
        productRepository.save(product);

        log.info("Product deactivated: {}", id);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getImageUrl(),
                product.getCreatedBy().getId(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}

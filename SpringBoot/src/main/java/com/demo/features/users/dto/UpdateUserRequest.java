package com.demo.features.users.dto;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
        String name,

        @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
        String password
) {
}

package com.demo.features.users.repository;

import com.demo.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailConfirmationToken(String token);

    boolean existsByEmail(String email);
}

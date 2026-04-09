package com.devtiro.tickets.repositories;

import com.devtiro.tickets.domain.entities.AuthUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthUserRepository extends JpaRepository<AuthUser, UUID> {
  Optional<AuthUser> findByUsername(String username);
}

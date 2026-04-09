package com.devtiro.tickets.config;

import com.devtiro.tickets.domain.auth.AuthRole;
import com.devtiro.tickets.domain.entities.AuthUser;
import com.devtiro.tickets.domain.entities.User;
import com.devtiro.tickets.repositories.AuthUserRepository;
import com.devtiro.tickets.repositories.UserRepository;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthDataSeeder implements CommandLineRunner {

  private final AuthUserRepository authUserRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  public void run(String... args) {
    seed("attendee.demo", "attendee.demo@example.com", "demo123", Set.of(AuthRole.ROLE_ATTENDEE));
    seed("organizer.demo", "organizer.demo@example.com", "demo123", Set.of(AuthRole.ROLE_ORGANIZER));
    seed("staff.demo", "staff.demo@example.com", "demo123", Set.of(AuthRole.ROLE_STAFF));
    seed("sameer", "sameer@example.com", "sameer123", Set.of(AuthRole.ROLE_ATTENDEE, AuthRole.ROLE_ORGANIZER));
  }

  private void seed(String username, String email, String rawPassword, Set<AuthRole> roles) {
    if (authUserRepository.findByUsername(username).isPresent()) {
      return;
    }

    UUID id = UUID.randomUUID();
    AuthUser authUser = new AuthUser();
    authUser.setId(id);
    authUser.setUsername(username);
    authUser.setEmail(email);
    authUser.setPasswordHash(passwordEncoder.encode(rawPassword));
    authUser.setRoles(roles);
    authUserRepository.save(authUser);

    User user = new User();
    user.setId(id);
    user.setName(username);
    user.setEmail(email);
    userRepository.save(user);
  }
}

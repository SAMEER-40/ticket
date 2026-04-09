package com.devtiro.tickets.config;

import com.devtiro.tickets.domain.auth.AppUserPrincipal;
import com.devtiro.tickets.domain.entities.AuthUser;
import com.devtiro.tickets.repositories.AuthUserRepository;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthUserDetailsService implements UserDetailsService {

  private final AuthUserRepository authUserRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    AuthUser authUser = authUserRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    return new AppUserPrincipal(
        authUser.getId(),
        authUser.getUsername(),
        authUser.getEmail(),
        authUser.getPasswordHash(),
        authUser.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority(role.name()))
            .collect(Collectors.toSet())
    );
  }
}

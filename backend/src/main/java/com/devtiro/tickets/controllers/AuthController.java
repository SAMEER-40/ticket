package com.devtiro.tickets.controllers;

import com.devtiro.tickets.config.JwtTokenService;
import com.devtiro.tickets.domain.auth.AppUserPrincipal;
import com.devtiro.tickets.domain.dtos.AuthLoginRequestDto;
import com.devtiro.tickets.domain.dtos.AuthLoginResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final JwtTokenService jwtTokenService;

  @PostMapping("/login")
  public ResponseEntity<AuthLoginResponseDto> login(@Valid @RequestBody AuthLoginRequestDto request) {
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
    );

    AppUserPrincipal principal = (AppUserPrincipal) authentication.getPrincipal();
    String token = jwtTokenService.generateToken(principal);

    return ResponseEntity.ok(new AuthLoginResponseDto(
        token,
        principal.getUsername(),
        principal.getEmail(),
        principal.getAuthorities().stream().map(a -> a.getAuthority()).toList()
    ));
  }
}

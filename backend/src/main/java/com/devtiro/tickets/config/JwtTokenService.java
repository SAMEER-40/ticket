package com.devtiro.tickets.config;

import com.devtiro.tickets.domain.auth.AppUserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

  private final Key signingKey;
  private final String issuer;
  private final long expiryHours;

  public JwtTokenService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.issuer}") String issuer,
      @Value("${app.jwt.expiry-hours}") long expiryHours) {
    byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
    if (keyBytes.length < 32) {
      throw new IllegalArgumentException("app.jwt.secret must be at least 32 characters");
    }
    this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    this.issuer = issuer;
    this.expiryHours = expiryHours;
  }

  public String generateToken(AppUserPrincipal principal) {
    Instant now = Instant.now();
    List<String> roles = principal.getAuthorities().stream()
        .map(authority -> authority.getAuthority())
        .toList();

    return Jwts.builder()
        .issuer(issuer)
        .subject(principal.getId().toString())
        .claim("username", principal.getUsername())
        .claim("email", principal.getEmail())
        .claim("roles", roles)
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusSeconds(3600 * expiryHours)))
        .signWith(signingKey)
        .compact();
  }

  public UsernamePasswordAuthenticationToken parseToken(String token) {
    Claims claims = Jwts.parser()
        .verifyWith((javax.crypto.SecretKey) signingKey)
        .build()
        .parseSignedClaims(token)
        .getPayload();

    if (!issuer.equals(claims.getIssuer())) {
      throw new JwtException("Invalid issuer");
    }

    UUID userId = UUID.fromString(claims.getSubject());
    String username = claims.get("username", String.class);
    String email = claims.get("email", String.class);
    @SuppressWarnings("unchecked")
    List<String> roles = claims.get("roles", List.class);

    AppUserPrincipal principal = new AppUserPrincipal(
        userId,
        username,
        email,
        "",
        roles.stream().map(SimpleGrantedAuthority::new).collect(java.util.stream.Collectors.toSet())
    );

    return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
  }
}

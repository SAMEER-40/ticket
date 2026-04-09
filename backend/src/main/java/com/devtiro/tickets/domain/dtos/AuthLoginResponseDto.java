package com.devtiro.tickets.domain.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AuthLoginResponseDto {
  private String accessToken;
  private String username;
  private String email;
  private List<String> roles;
}

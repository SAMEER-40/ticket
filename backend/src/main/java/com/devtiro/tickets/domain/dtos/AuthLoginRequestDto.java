package com.devtiro.tickets.domain.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthLoginRequestDto {
  @NotBlank
  private String username;
  @NotBlank
  private String password;
}

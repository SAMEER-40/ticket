package com.devtiro.tickets.util;

import com.devtiro.tickets.domain.auth.AppUserPrincipal;
import java.util.UUID;

public final class JwtUtil {
  private JwtUtil(){
  }

  public static UUID parseUserId(AppUserPrincipal principal) {
    return principal.getId();
  }


}

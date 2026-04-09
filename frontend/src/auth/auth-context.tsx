import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";

type AuthRole = "ROLE_ATTENDEE" | "ROLE_ORGANIZER" | "ROLE_STAFF";

interface AuthUser {
  username: string;
  email: string;
  roles: AuthRole[];
  access_token: string;
}

interface LoginResponse {
  accessToken: string;
  username: string;
  email: string;
  roles: AuthRole[];
}

interface JwtPayload {
  exp?: number;
}

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const apiPath = (path: string) => `${API_BASE_URL}${path}`;
const STORAGE_KEY = "app-auth";

export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      const payload = jwtDecode<JwtPayload>(parsed.access_token);
      if (!payload.exp || payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } else {
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch(apiPath("/api/v1/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid username or password");
    }

    const data = (await response.json()) as LoginResponse;
    const nextUser: AuthUser = {
      username: data.username,
      email: data.email,
      roles: data.roles,
      access_token: data.accessToken,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated: !!user,
      user,
      login,
      logout,
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

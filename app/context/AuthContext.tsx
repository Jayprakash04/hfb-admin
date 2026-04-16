"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { authService, User } from "../services/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const { data } = await authService.me();
      // Backend may return { success, data: { admin } } or { success, user }
      const resolvedUser =
        (data as unknown as { data?: { admin?: User; user?: User } }).data?.admin ||
        (data as unknown as { data?: { admin?: User; user?: User } }).data?.user ||
        data.user;
      if (data.success && resolvedUser) {
        setUser(resolvedUser);
      } else {
        setUser(null);
        Cookies.remove("accessToken");
      }
    } catch {
      setUser(null);
      Cookies.remove("accessToken");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authService.login({ email, password });
      // Backend returns { success, data: { accessToken, admin } }
      const token = data.data?.accessToken || data.accessToken;
      const adminUser = data.data?.admin || data.data?.user || data.user;
      if (token) {
        Cookies.set("accessToken", token, { expires: 1, sameSite: "lax" });
        if (adminUser) setUser(adminUser);
        else await refreshUser();
        return { success: true };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data } = await authService.register({ name, email, password });
      return { success: data.success, message: data.message };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout API errors
    } finally {
      Cookies.remove("accessToken");
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

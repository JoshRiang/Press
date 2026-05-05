"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api, { logout, getStoredUser, User } from "@/src/services/authService";

/**
 * useAuth — Dashboard authentication guard hook.
 *
 * On mount it verifies the current session by hitting the backend's
 * /auth/refresh endpoint.  If the access token or refresh cookie is
 * invalid / tampered, the user is immediately redirected to login.
 *
 * Returns { isAuthenticated, isLoading, user }.
 */
export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const forceLogout = useCallback((reason?: "expired" | "unauthorized") => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    const query = reason ? `?reason=${reason}` : "";
    router.replace(`/auth/login${query}`);
  }, [router]);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("accessToken");

      // No token at all → straight to login
      if (!token) {
        forceLogout();
        return;
      }

      try {
        // Validate the session by attempting a token refresh.
        // This hits the backend which will verify the httpOnly refreshToken cookie.
        // If the cookie was tampered with, the server returns 401.
        const res = await api.get("/auth/refresh");
        const newToken = res.data?.data?.accessToken;

        if (newToken) {
          localStorage.setItem("accessToken", newToken);
        }

        const storedUser = getStoredUser();
        setUser(storedUser);
        setIsAuthenticated(true);
      } catch {
        // Refresh failed → cookie is invalid / tampered
        forceLogout("expired");
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [forceLogout]);

  return { isAuthenticated, isLoading, user, forceLogout };
}

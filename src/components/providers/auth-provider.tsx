"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { meRequest, refreshRequest } from "@/lib/api/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function restoreSession() {
      try {
        const { accessToken } = await refreshRequest();
        useAuthStore.getState().setAccessToken(accessToken);

        const user = await meRequest();
        useAuthStore.getState().setUser(user);
      } catch {
        useAuthStore.getState().clearAuth();
      } finally {
        useAuthStore.getState().finishInitializing();
      }
    }

    restoreSession();
  }, []);

  return <>{children}</>;
}

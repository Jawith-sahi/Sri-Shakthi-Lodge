"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { getCurrentUser, logout as apiLogout, refreshSession } from "@/lib/api/auth.api";
import { clearAdminHint } from "@/lib/auth/session";
import { Spinner } from "@/components/ui/Spinner";

const AdminContext = createContext(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}

// Proactively rotate token pair every 10 minutes (before the 15-min AccessToken expires)
const PROACTIVE_REFRESH_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Guards the admin area for UX. A 401 from ANY admin API call sends the user to the login page.
 * Real protection is the backend; this only avoids showing screens that cannot work.
 */
export function AdminProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const refreshTimerRef = useRef(null);

  const toLogin = useCallback(() => {
    clearAdminHint();
    setUser(null);
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [router, pathname]);

  useEffect(() => {
    setUnauthorizedHandler(toLogin);
    return () => setUnauthorizedHandler(null);
  }, [toLogin]);

  // Load current user on mount
  useEffect(() => {
    let alive = true;
    getCurrentUser()
      .then((u) => {
        if (!alive) return;
        setUser(u);
        setReady(true);
      })
      .catch((error) => {
        if (!alive) return;
        if (error.code === "unauthorized") toLogin();
        else setReady(true); // backend unreachable: let screens show their own error states
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Proactive background token refresh every 60 minutes
  useEffect(() => {
    if (!ready || !user) return;
    refreshTimerRef.current = setInterval(async () => {
      try {
        await refreshSession();
      } catch {
        // Refresh failed silently — the 401 interceptor will handle it on next request
      }
    }, PROACTIVE_REFRESH_MS);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [ready, user]);

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    try {
      await apiLogout();
    } finally {
      clearAdminHint();
      router.replace("/admin/login");
    }
  }, [router]);

  const value = useMemo(() => ({ user, isOwner: user?.role === "owner", logout }), [user, logout]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface" role="status">
        <Spinner className="h-8 w-8 text-primary" label="Loading" />
      </div>
    );
  }
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

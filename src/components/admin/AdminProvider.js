"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { getCurrentUser, logout as apiLogout } from "@/lib/api/auth.api";
import { clearAdminHint } from "@/lib/auth/session";
import { Spinner } from "@/components/ui/Spinner";

const AdminContext = createContext(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}

/**
 * Guards the admin area for UX. A 401 from ANY admin API call sends the user to the login page.
 * Real protection is the backend; this only avoids showing screens that cannot work.
 */
export function AdminProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const toLogin = useCallback(() => {
    clearAdminHint();
    setUser(null);
    router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [router, pathname]);

  useEffect(() => {
    setUnauthorizedHandler(toLogin);
    return () => setUnauthorizedHandler(null);
  }, [toLogin]);

  useEffect(() => {
    const controller = new AbortController();
    getCurrentUser(controller.signal)
      .then((u) => {
        setUser(u);
        setReady(true);
      })
      .catch((error) => {
        if (error.isAborted) return;
        if (error.code === "unauthorized") toLogin();
        else setReady(true); // backend unreachable: let screens show their own error states
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
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

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgePercent,
  BarChart3,
  BedDouble,
  CalendarCheck,
  ChevronDown,
  FileText,
  Images,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Settings,
  Star,
  Users,
} from "lucide-react";
import { Drawer } from "@/components/ui/Modal";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ADMIN_NAV } from "@/constants/nav";
import { env } from "@/config/environment";
import { lodge } from "@/config/lodge";
import { cn } from "@/lib/utils/cn";

const ICONS = { LayoutDashboard, CalendarCheck, BedDouble, IndianRupee, Users, MessageSquare, BadgePercent, Images, Star, MapPin, FileText, BarChart3, Settings };

function NavList({ onNavigate }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5 p-3">
      {ADMIN_NAV.map((item) => {
        const Icon = ICONS[item.icon] || FileText;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active ? "bg-primary-800 text-white" : "text-primary-100 hover:bg-primary-800/60 hover:text-white"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Brand() {
  return (
    <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-4 text-white">
      <Image src="/logo-small.png" alt="" width={36} height={36} className="rounded-full" />
      <span className="leading-tight">
        <span className="block text-sm font-bold">{lodge.name}</span>
        <span className="block text-xs text-accent-300">Admin</span>
      </span>
    </Link>
  );
}

export function AdminShell({ children }) {
  const { user, logout } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  const current = ADMIN_NAV.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));

  return (
    <div className="min-h-dvh bg-surface">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 overflow-y-auto bg-primary-900 lg:block" aria-label="Admin navigation">
        <Brand />
        <nav>
          <NavList />
        </nav>
      </aside>

      {/* Mobile drawer */}
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="left" className="bg-primary-900 text-white">
        <Brand />
        <nav aria-label="Admin navigation">
          <NavList onNavigate={() => setMenuOpen(false)} />
        </nav>
      </Drawer>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-white px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-primary hover:bg-primary-50 lg:hidden"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <ol className="flex items-center gap-1.5">
                <li>Admin</li>
                {current ? (
                  <>
                    <li aria-hidden="true">/</li>
                    <li className="font-semibold text-primary-900" aria-current="page">
                      {current.label}
                    </li>
                  </>
                ) : null}
              </ol>
            </nav>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-primary-900 hover:bg-primary-50"
            >
              <span className="hidden sm:inline">{user?.name || "Account"}</span>
              {user?.role ? <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs capitalize text-primary-700">{user.role}</span> : null}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            {profileOpen ? (
              <div role="menu" className="absolute right-0 mt-1 w-48 rounded-lg border border-line bg-white py-1 shadow-[var(--shadow-pop)]">
                <Link role="menuitem" href="/admin/settings" onClick={() => setProfileOpen(false)} className="flex min-h-11 items-center gap-2 px-4 text-sm hover:bg-surface">
                  <Settings className="h-4 w-4" aria-hidden="true" /> Settings
                </Link>
                <Link role="menuitem" href="/en" target="_blank" className="flex min-h-11 items-center gap-2 px-4 text-sm hover:bg-surface">
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> View website
                </Link>
                <button role="menuitem" type="button" onClick={logout} className="flex min-h-11 w-full items-center gap-2 px-4 text-left text-sm text-danger-600 hover:bg-danger-50">
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {env.useMock ? (
          <div role="note" className="bg-warning-600 px-4 py-2 text-center text-xs font-semibold text-white">
            DEVELOPMENT MODE – sample data only. Any sign-in works. Nothing here is real.
          </div>
        ) : null}

        <main id="main" tabIndex={-1} className="mx-auto max-w-7xl p-4 outline-none sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

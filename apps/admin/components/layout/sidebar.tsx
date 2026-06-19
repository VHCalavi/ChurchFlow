"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Network,
  CalendarDays,
  ShieldCheck,
  ChevronLeft,
  Sun,
  Moon,
  LogOut,
  GraduationCap,
  Wallet,
  Settings,
  UserCircle,
} from "lucide-react";

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  isDisabled?: boolean;
  requiredPermission?: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname() || "";
  const [sidebarTheme, setSidebarTheme] = useState<"LIGHT" | "DARK">("LIGHT");
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("sidebar-theme");
      if (saved === "DARK" || saved === "LIGHT") {
        setSidebarTheme(saved);
      }
    } catch {
      // Avoid SSR errors
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = sidebarTheme === "LIGHT" ? "DARK" : "LIGHT";
    setSidebarTheme(nextTheme);
    try {
      localStorage.setItem("sidebar-theme", nextTheme);
      document.dispatchEvent(
        new CustomEvent("sidebar-theme-changed", { detail: nextTheme }),
      );
    } catch {
      // Avoid SSR errors
    }
  };

  const menuItems: SidebarItem[] = [
    {
      title: "Tableau de Bord",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/dashboard",
    },
    {
      title: "Membres",
      icon: <Users className="w-5 h-5" />,
      href: "/dashboard/members",
      requiredPermission: "read:members",
    },
    {
      title: "Groupes & GEM",
      icon: <Network className="w-5 h-5" />,
      href: "/dashboard/groups",
      requiredPermission: "read:groups",
    },
    {
      title: "Rencontres",
      icon: <CalendarDays className="w-5 h-5" />,
      href: "/dashboard/meetings",
      requiredPermission: "read:meetings",
    },
    {
      title: "Formations & Écoles",
      icon: <GraduationCap className="w-5 h-5" />,
      href: "/dashboard/formations",
    },
    {
      title: "Finances",
      icon: <Wallet className="w-5 h-5" />,
      href: "/dashboard/finances",
      requiredPermission: "read:finances",
    },
    {
      title: "Administration",
      icon: <Settings className="w-5 h-5" />,
      href: "/dashboard/administration",
      requiredPermission: "manage:roles",
    },
    {
      title: "Permissions",
      icon: <ShieldCheck className="w-5 h-5" />,
      href: "/dashboard/permissions",
      requiredPermission: "manage:roles",
    },
    {
      title: "Mon Profil",
      icon: <UserCircle className="w-5 h-5" />,
      href: "/dashboard/profile",
    },
  ];

  interface SessionUser {
    roles?: string[];
    permissions?: string[];
  }
  const userRoles: string[] = (session?.user as SessionUser)?.roles || [];
  const userPermissions: string[] =
    (session?.user as SessionUser)?.permissions || [];
  const isAdmin = userRoles.includes("ADMIN");

  const filteredMenuItems = mounted
    ? menuItems.filter((item) => {
        if (isAdmin) return true;
        if (!item.requiredPermission) return true;
        return userPermissions.includes(item.requiredPermission);
      })
    : [];

  const currentTheme = mounted ? sidebarTheme : "LIGHT";

  /* ─── Horizon UI Exact Color Values ─────────────────────────── */
  const isDark = currentTheme === "DARK";
  /* Sidebar container */
  const sidebarBg = isDark ? "#111c44" : "#ffffff"; /* navy.800 / white */
  const sidebarShadow = "14px 17px 40px 4px rgba(112,144,176,0.08)";
  /* Text colours matching secondaryGray tokens */
  const textActive = isDark ? "#ffffff" : "#1B2559"; /* gray.700 / white */
  const textInactive = "#A3AED0"; /* secondaryGray.600 */
  /* Icon colours */
  const iconActive = isDark ? "#ffffff" : "#422AFB"; /* brand.500 */
  /* Active bar */
  const barColor = isDark ? "#7551FF" : "#422AFB"; /* brand.400 / brand.500 */

  return (
    <aside
      suppressHydrationWarning={true}
      style={{ background: sidebarBg, boxShadow: sidebarShadow }}
      className={`fixed inset-y-0 left-0 z-35 flex flex-col my-5 ml-4 rounded-2xl transition-all duration-300 ease-in-out overflow-x-hidden ${
        isCollapsed ? "w-[90px]" : "w-[300px]"
      }`}
    >
      {/* ── Brand ──────────────────────────────────────────────── */}
      {/* Horizon: Flex column, logo centré, puis HSeparator */}
      <div className="flex flex-col items-center pt-8 pb-5 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-8">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #006C69 0%, #09B5AF 100%)",
            }}
          >
            <span className="font-extrabold text-sm text-white">CF</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span
                className="font-extrabold text-lg tracking-wide leading-none uppercase font-sans"
                style={{ color: textActive }}
              >
                Church<span style={{ color: iconActive }}>Flow</span>
              </span>
              <span
                className="text-[9px] font-bold uppercase tracking-widest mt-0.5"
                style={{ color: textInactive }}
              >
                Vase d&apos;Honneur
              </span>
            </div>
          )}
        </Link>

        {/* HSeparator — ligne horizontale fine */}
        <div
          className="w-full h-[1px] mb-5"
          style={{ background: isDark ? "rgba(255,255,255,0.1)" : "#E0E5F2" }}
        />
      </div>

      {/* ── Navigation Links ───────────────────────────────────── */}
      {/* Horizon: ps=20px, pe=16px, spacing 22/26px, py=5px, ps=10px par lien */}
      <nav className="flex-1 overflow-y-auto scrollbar-none px-5">
        <div className="flex flex-col gap-0.5">
          {filteredMenuItems.map((item, index) => {
            const isActive = pathname === item.href;

            if (item.isDisabled) {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    triggerToast(
                      `Le module ${item.title} est en cours de développement.`,
                    )
                  }
                  className="w-full flex items-center py-[5px] ps-[10px] cursor-not-allowed opacity-40"
                  style={{ gap: "26px" }}
                >
                  <span style={{ color: textInactive }}>{item.icon}</span>
                  {!isCollapsed && (
                    <span
                      className="text-sm flex-1 text-left"
                      style={{ color: textInactive }}
                    >
                      {item.title}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={index}
                href={item.href}
                className="flex items-center py-[5px] ps-[10px] w-full"
                style={{ gap: isActive ? "22px" : "26px" }}
              >
                {/* Icon */}
                <span
                  className="flex items-center justify-center transition-colors duration-150 flex-shrink-0"
                  style={{
                    color: isActive ? iconActive : textInactive,
                    marginRight: "18px",
                  }}
                >
                  {item.icon}
                </span>

                {/* Label */}
                {!isCollapsed && (
                  <span
                    className="text-sm flex-1 text-left transition-colors duration-150"
                    style={{
                      color: isActive ? textActive : textInactive,
                      fontWeight: isActive ? "700" : "400",
                    }}
                  >
                    {item.title}
                  </span>
                )}

                {/* Active Bar — Horizon right border indicator */}
                <div
                  className="rounded-l-md flex-shrink-0 transition-all duration-200"
                  style={{
                    height: "36px",
                    width: "4px",
                    background: isActive ? barColor : "transparent",
                    borderRadius: "5px",
                  }}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="mt-auto">
        {/* HSeparator */}
        <div
          className="mx-4 h-[1px] mb-4"
          style={{ background: isDark ? "rgba(255,255,255,0.1)" : "#E0E5F2" }}
        />

        {/* Theme Toggle Row */}
        {
          false &&
        <div
          className={`flex items-center py-3 transition-all duration-300 ${
            isCollapsed ? "px-4 justify-center" : "px-8 justify-between"
          }`}
        >
          {!isCollapsed && (
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: textInactive }}
            >
              Mode Sombre
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-all duration-200 cursor-pointer"
            style={{
              background: isDark ? "#0b1437" : "#F4F7FE",
              color: isDark ? "#FFB547" : textInactive,
            }}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>

        }

        {/* User Info / Logout */}
        <div className="p-4 pb-6">
          <div
            className={`flex items-center gap-3 rounded-2xl p-2 ${
              isCollapsed ? "justify-center" : ""
            }`}
            style={{ background: isDark ? "#0b1437" : "#F4F7FE" }}
          >
            {/* Collapse toggle */}
            <button
              onClick={onToggle}
              className="p-1.5 rounded-xl transition-all duration-200 flex-shrink-0 cursor-pointer"
              style={{ color: textInactive }}
              title={isCollapsed ? "Développer" : "Réduire"}
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
              />
            </button>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-bold truncate leading-tight"
                  style={{ color: textActive }}
                >
                  {session?.user?.name || session?.user?.email || "Admin"}
                </p>
                <p
                  className="text-[9px] font-semibold uppercase tracking-widest"
                  style={{ color: textInactive }}
                >
                  Connecté
                </p>
              </div>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-xl transition-all duration-200 flex-shrink-0 cursor-pointer"
              style={{ color: "#EE5D50" }}
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          className="fixed bottom-6 left-6 z-50 flex items-center px-4 py-3 rounded-2xl text-xs font-bold shadow-lg animate-fade-in-up"
          style={{
            background: "#FFF6DA",
            color: "#1B2559",
            boxShadow: "14px 17px 40px 4px rgba(112,144,176,0.18)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 mr-2.5 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </aside>
  );
}

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
  UserCheck,
  ChevronLeft,
  Sun,
  Moon,
  LogOut
} from "lucide-react";

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  color: string;
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [sidebarTheme, setSidebarTheme] = useState<"LIGHT" | "DARK">("LIGHT");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  };

  // Read theme securely from localStorage on mount
  useEffect(() => {
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
      
      // Also apply theme immediately as a global class or trigger a sync if needed
      document.dispatchEvent(new CustomEvent("sidebar-theme-changed", { detail: nextTheme }));
    } catch {
      // Avoid SSR errors
    }
  };


  const menuItems: SidebarItem[] = [
    {
      title: "Tableau de Bord",
      icon: <LayoutDashboard className="w-5.5 h-5.5" />,
      href: "/dashboard",
      color: "#06A7B5" // Lively Cyan/Teal
    },
    {
      title: "Membres",
      icon: <Users className="w-5.5 h-5.5" />,
      href: "/dashboard/members",
      color: "#006C69", // Official VH Emerald Green
      requiredPermission: "read:members"
    },
    {
      title: "Groupes & GEM",
      icon: <Network className="w-5.5 h-5.5" />,
      href: "/dashboard/groups",
      color: "#EC8001", // Lively Orange
      requiredPermission: "read:groups"
    },
    {
      title: "Réunions & Agenda",
      icon: <CalendarDays className="w-5.5 h-5.5" />,
      href: "/dashboard/meetings",
      color: "#8B5CF6", // Lively Violet
      requiredPermission: "read:meetings"
    },
    {
      title: "Permissions (RBAC)",
      icon: <ShieldCheck className="w-5.5 h-5.5" />,
      href: "/dashboard/permissions",
      color: "#EF4444", // Lively Red
      requiredPermission: "manage:roles"
    }
  ];

  interface SessionUser {
    roles?: string[];
    permissions?: string[];
  }
  const userRoles: string[] = (session?.user as SessionUser)?.roles || [];
  const userPermissions: string[] = (session?.user as SessionUser)?.permissions || [];
  const isAdmin = userRoles.includes("ADMIN");

  const filteredMenuItems = menuItems.filter(item => {
    if (isAdmin) return true;
    if (!item.requiredPermission) return true;
    return userPermissions.includes(item.requiredPermission);
  });

  // Instantly read theme synchronously if on client to prevent FOUC / transition flash
  let currentTheme = sidebarTheme;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("sidebar-theme");
      if (saved === "DARK") {
        currentTheme = "DARK";
      } else if (saved === "LIGHT") {
        currentTheme = "LIGHT";
      }
    } catch {}
  }

  return (
    <aside 
      suppressHydrationWarning={true}
      className={`fixed inset-y-0 left-0 z-20 flex flex-col h-screen border-r shadow-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      } ${
        currentTheme === "DARK" 
          ? "bg-[#151521] border-[#1f1f2e] shadow-[0_0_30px_rgba(0,0,0,0.2)]" 
          : "bg-white border-slate-100"
      }`}
    >
      {/* Metronic-style Floating Toggle Button on Border */}
      <button
        onClick={onToggle}
        className="absolute top-7 -right-3.5 z-30 flex items-center justify-center w-7 h-7 rounded-full border bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:text-primary transition-all duration-300 shadow-md cursor-pointer focus:outline-none"
        title={isCollapsed ? "Déplier le menu" : "Plier le menu"}
      >
        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
      </button>

      {/* Brand Header */}
      <div 
        className={`flex items-center h-20 border-b transition-all duration-300 ${
          isCollapsed ? "px-0 justify-center" : "px-6 justify-start space-x-3.5"
        } ${
          currentTheme === "DARK" ? "border-[#1f1f2e]" : "border-slate-100"
        }`}
      >
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-secondary shadow-sm flex-shrink-0">
            <span className="font-extrabold text-lg text-white">CF</span>
          </div>
          {!isCollapsed && (
            <span 
              className={`font-extrabold text-lg tracking-tight transition-opacity duration-300 ${
                currentTheme === "DARK" ? "text-white" : "text-primary"
              }`}
            >
              ChurchFlow
            </span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav 
        className={`flex-1 py-6 space-y-2 overflow-y-auto scrollbar-none transition-all duration-300 ${
          isCollapsed ? "px-2" : "px-4"
        }`}
      >
        {filteredMenuItems.map((item, index) => {
          const isActive = pathname === item.href;
          const isHovered = hoveredIndex === index;
          const isDisabled = item.isDisabled;

          // Compute custom colored styles for a beautiful, premium, color-themed Metronic active/hover effect
          let linkStyle: React.CSSProperties = {};
          
          if (isDisabled) {
            linkStyle = {
              backgroundColor: "transparent",
              color: currentTheme === "DARK" ? "#4f5366" : "#cbd5e1",
              borderColor: "transparent",
              cursor: "not-allowed"
            };
          } else if (isActive) {
            linkStyle = {
              backgroundColor: `${item.color}15`, // 15% opacity hex alpha
              color: item.color,
              borderColor: `${item.color}25` // 25% opacity hex alpha
            };
          } else if (isHovered) {
            linkStyle = {
              backgroundColor: `${item.color}08`, // 5% opacity hex alpha
              color: item.color,
              borderColor: "transparent"
            };
          } else {
            linkStyle = {
              backgroundColor: "transparent",
              color: currentTheme === "DARK" ? "#a1a5b7" : "#475569", // Metronic silver vs slate-600
              borderColor: "transparent"
            };
          }

          const content = (
            <div className={`flex items-center w-full ${isCollapsed ? "justify-center" : "justify-between"}`}>
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3.5"}`}>
                <span 
                  className={`transition-transform duration-200 flex items-center justify-center ${!isDisabled ? "group-hover:scale-105" : ""}`}
                  style={{ color: isDisabled ? undefined : item.color }}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span 
                    className={`text-sm tracking-wide transition-all duration-200 ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                    style={{ 
                      color: isDisabled
                        ? (currentTheme === "DARK" ? "#4f5366" : "#94a3b8")
                        : (isActive || isHovered 
                          ? item.color 
                          : currentTheme === "DARK" ? "#a1a5b7" : "#334155")
                    }}
                  >
                    {item.title}
                  </span>
                )}
              </div>
              
              {!isCollapsed && (
                <>
                  {isDisabled && (
                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-50 dark:bg-[#1a1a24] text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800">
                      Bientôt
                    </span>
                  )}
                  {!isDisabled && isActive && (
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  )}
                </>
              )}
            </div>
          );

          if (isDisabled) {
            return (
              <div key={index} className="relative">
                <button
                  type="button"
                  title={isCollapsed ? `${item.title} (Bientôt disponible)` : undefined}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => triggerToast(`Le module ${item.title} est en cours de développement.`)}
                  style={linkStyle}
                  className={`flex items-center rounded-xl transition-all duration-200 group border w-full ${
                    isCollapsed ? "justify-center p-3" : "px-4 py-3"
                  }`}
                >
                  {content}
                </button>
              </div>
            );
          }

          return (
            <div key={index} className="relative">
              <Link
                href={item.href || "#"}
                title={isCollapsed ? item.title : undefined}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={linkStyle}
                className={`flex items-center rounded-xl transition-all duration-200 group border ${
                  isCollapsed ? "justify-center p-3" : "justify-between px-4 py-3"
                }`}
              >
                {content}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer Theme Switcher & User Info */}
      <div className="flex flex-col flex-shrink-0">
        
        {/* Rounded interactive Light/Dark toggle bar */}
        <div 
          className={`flex items-center border-t py-3 transition-all duration-300 ${
            isCollapsed ? "p-3 justify-center" : "px-6 py-3.5 justify-between"
          } ${
            currentTheme === "DARK" ? "border-[#1f1f2e]" : "border-slate-100"
          }`}
        >
          {!isCollapsed && (
            <span 
              className={`text-[10px] font-extrabold uppercase tracking-widest ${
                currentTheme === "DARK" ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Mode Sombre
            </span>
          )}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              currentTheme === "DARK"
                ? "bg-[#1e1e2d] border-[#2b2b40] text-amber-400 hover:bg-[#2b2b40] hover:text-amber-300 shadow-sm"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 shadow-xs"
            }`}
            title={currentTheme === "DARK" ? "Activer le Mode Clair" : "Activer le Mode Sombre"}
          >
            {currentTheme === "DARK" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Footer User Info */}
        <div 
          className={`border-t transition-all duration-300 ${
            isCollapsed ? "p-3" : "p-4"
          } ${
            currentTheme === "DARK" ? "border-[#1f1f2e] bg-[#1a1a24]/30" : "border-slate-100 bg-slate-50/50"
          }`}
        >
          <div className={`flex items-center rounded-xl ${isCollapsed ? "flex-col gap-2 justify-center" : "space-x-3 p-1"}`}>
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-xl border flex-shrink-0 shadow-sm ${
                currentTheme === "DARK" ? "bg-[#1e1e2d] border-[#2b2b40]" : "bg-white border-slate-100"
              }`}
            >
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p 
                  className={`text-sm font-semibold truncate ${
                    currentTheme === "DARK" ? "text-slate-200" : "text-slate-900"
                  }`}
                >
                  {session?.user?.name || "Dr. Paul OBIANG"}
                </p>
                <p 
                  className={`text-xs font-medium truncate ${
                    currentTheme === "DARK" ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {session?.user?.email || "admin@churchflow.com"}
                </p>
              </div>
            )}
            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Se déconnecter"
              className={`flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer group ${
                currentTheme === "DARK"
                  ? "bg-[#1e1e2d] border-[#2b2b40] text-slate-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                  : "bg-white border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50"
              }`}
            >
              <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Toast Notification for Disabled Modules */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-[#201d18] dark:border-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-semibold shadow-md animate-fade-in">
          <ShieldCheck className="w-5 h-5 mr-2.5 flex-shrink-0 text-amber-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </aside>
  );
}

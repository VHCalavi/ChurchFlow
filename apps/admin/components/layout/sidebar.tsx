"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Network,
  GraduationCap,
  CalendarDays,
  ShieldCheck,
  Wallet,
  Package,
  UserCheck,
  ChevronLeft,
  Sun,
  Moon
} from "lucide-react";

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  color: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname() || "";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [sidebarTheme, setSidebarTheme] = useState<"LIGHT" | "DARK">("LIGHT");

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
      color: "#006C69" // Official VH Emerald Green
    },
    {
      title: "Groupes & GEM",
      icon: <Network className="w-5.5 h-5.5" />,
      href: "/dashboard/groups",
      color: "#EC8001" // Lively Orange
    },
    {
      title: "Formations",
      icon: <GraduationCap className="w-5.5 h-5.5" />,
      href: "/dashboard/formations",
      color: "#CEAD1E" // Official Sand Gold
    },
    {
      title: "Réunions & Agenda",
      icon: <CalendarDays className="w-5.5 h-5.5" />,
      href: "/dashboard/meetings",
      color: "#8B5CF6" // Lively Violet
    },
    {
      title: "Patrimoine & Logistique",
      icon: <Package className="w-5.5 h-5.5" />,
      href: "/dashboard/administration",
      color: "#B1C431" // Lively Lime
    },
    {
      title: "Comptabilité & Finances",
      icon: <Wallet className="w-5.5 h-5.5" />,
      href: "/dashboard/finances",
      color: "#10B981" // Lively Emerald
    },
    {
      title: "Permissions (RBAC)",
      icon: <ShieldCheck className="w-5.5 h-5.5" />,
      href: "/dashboard/permissions",
      color: "#EF4444" // Lively Red
    }
  ];

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
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          const isHovered = hoveredIndex === index;

          // Compute custom colored styles for a beautiful, premium, color-themed Metronic active/hover effect
          const linkStyle: React.CSSProperties = isActive
            ? {
                backgroundColor: `${item.color}15`, // 15% opacity hex alpha
                color: item.color,
                borderColor: `${item.color}25` // 25% opacity hex alpha
              }
            : isHovered
            ? {
                backgroundColor: `${item.color}08`, // 5% opacity hex alpha
                color: item.color,
                borderColor: "transparent"
              }
            : {
                backgroundColor: "transparent",
                color: currentTheme === "DARK" ? "#a1a5b7" : "#475569", // Metronic silver vs slate-600
                borderColor: "transparent"
              };

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
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3.5"}`}>
                  <span 
                    className="transition-transform duration-200 group-hover:scale-105 flex items-center justify-center"
                    style={{ color: item.color }}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span 
                      className={`text-sm tracking-wide transition-all duration-200 ${
                        isActive ? "font-semibold" : "font-medium"
                      }`}
                      style={{ 
                        color: isActive || isHovered 
                          ? item.color 
                          : currentTheme === "DARK" ? "#a1a5b7" : "#334155" 
                      }}
                    >
                      {item.title}
                    </span>
                  )}
                </div>
                {!isCollapsed && isActive && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                )}
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
          <div className={`flex items-center rounded-xl ${isCollapsed ? "justify-center" : "space-x-3.5 p-2"}`}>
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
                  Dr. Paul OBIANG
                </p>
                <p 
                  className={`text-xs font-medium truncate ${
                    currentTheme === "DARK" ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  admin@churchflow.com
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
}

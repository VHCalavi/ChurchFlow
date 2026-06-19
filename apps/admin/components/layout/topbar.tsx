"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Bell,
  Search,
  User,
  X,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Minimal dark-mode hook: reads/toggles the `.dark` class on <html>
// (Tailwind darkMode: ["class"] convention — no extra dependency needed)
// ─────────────────────────────────────────────────────────────────────────────
function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialise from the current class or localStorage
    const saved = localStorage.getItem("theme");
    const dark =
      saved === "dark" ||
      (!saved && document.documentElement.classList.contains("dark"));
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return { isDark, toggle };
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface TopbarProps {
  title?: string;
}

interface SessionUser {
  roles?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Topbar Component — Horizon UI NavbarAdmin faithful port
// ─────────────────────────────────────────────────────────────────────────────
export function Topbar({ title = "Tableau de Bord Global" }: TopbarProps) {
  const { data: session } = useSession();
  const { isDark, toggle: toggleTheme } = useDarkMode();

  // Drawer / modal state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<
    "ALL" | "INBOX" | "TEAM" | "FOLLOWING"
  >("ALL");
  const [activeSearchTab, setActiveSearchTab] = useState("ALL");

  // ── Horizon scroll-reactive shadow (changeNavbar) ──────────────────────────
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 1);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Session data ──────────────────────────────────────────────────────────
  const sessionUser = session?.user as
    | (SessionUser & { name?: string | null })
    | undefined;
  const displayName =
    sessionUser?.name || session?.user?.email || "Utilisateur";

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // ── Horizon color tokens ──────────────────────────────────────────────────
  //   navbarBg  : rgba(244,247,254,0.2) light  /  rgba(11,20,55,0.5) dark
  //   menuBg    : #ffffff               light  /  #0b1437 (navy.800)  dark
  //   shadow    : 14px 17px 40px 4px rgba(112,144,176,0.18/.06)
  //   navbarIcon: gray.400 #A3AED0      / white
  const navbarBg = isDark
    ? "rgba(11, 20, 55, 0.5)"
    : "rgba(244, 247, 254, 0.2)";
  const navbarShadow = scrolled
    ? isDark
      ? "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
      : "14px 17px 40px 4px rgba(112, 144, 176, 0.18)"
    : "none";
  const menuBg = isDark ? "#0b1437" : "#ffffff";
  const menuShadow = isDark
    ? "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
    : "14px 17px 40px 4px rgba(112, 144, 176, 0.18)";
  const borderColor = isDark ? "rgba(135, 140, 189, 0.3)" : "#E6ECFA";
  const iconCls = isDark ? "text-white" : "text-[#A3AED0]"; // gray.400
  const textCls = isDark ? "text-white" : "text-[#1B2559]"; // navy.700
  const subTextCls = isDark ? "text-white/70" : "text-[#707EAE]"; // gray.700

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════
          MAIN NAVBAR  — Horizon NavbarAdmin exact replica
          position: fixed, top: 20px, right: 30px, w: calc(100vw - 350px)
          borderRadius: 16px, backdropFilter: blur(20px)
      ════════════════════════════════════════════════════════════════════ */}
      <header
        style={{
          position: "fixed",
          top: "20px",
          right: "30px",
          width: "calc(100vw - 380px)",
          zIndex: 10,
          minHeight: "75px",
          borderRadius: "16px",
          borderWidth: "1.5px",
          borderStyle: "solid",
          borderColor: "transparent",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: navbarBg,
          boxShadow: navbarShadow,
          transition: "box-shadow 0.25s linear, background-color 0.25s linear",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "12px",
          paddingRight: "10px",
          paddingTop: "8px",
          paddingBottom: "8px",
        }}
      >
        {/* ── Left: Breadcrumb + Brand title ──────────────────────────── */}
        <div style={{ marginBottom: "0px" }}>
          {/* Breadcrumb — "Pages / brandText" (sm fontSize, gray.700/white) */}
          <nav
            className="flex items-center gap-1.5 mb-[5px]"
            aria-label="breadcrumb"
          >
            <span className={`text-sm font-normal ${subTextCls}`}>Pages</span>
            <span className={`text-sm font-normal ${subTextCls}`}>/</span>
            <span className={`text-sm font-normal ${subTextCls}`}>{title}</span>
          </nav>
          {/* Brand title — Horizon: fontSize 34px, fontWeight bold, navy.700 / white */}
          <h1
            className={`font-bold leading-none ${textCls}`}
            style={{ fontSize: "34px" }}
          >
            {title}
          </h1>
        </div>

        {/* ── Right: AdminNavbarLinks pill ────────────────────────────── */}
        {/*
            Horizon: bg white/navy.800, p 10px, borderRadius 30px, boxShadow
        */}
        <div
          className="flex items-center gap-3"
          style={{
            background: menuBg,
            padding: "10px",
            borderRadius: "30px",
            boxShadow: menuShadow,
          }}
        >
          {/* SearchBar (me: 10px, borderRadius: 30px) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 rounded-full transition-all hover:opacity-80 mr-[10px]"
            style={{
              background: isDark ? "rgba(11,20,55,0.8)" : "#F4F7FE",
              padding: "8px 14px",
              borderRadius: "30px",
            }}
            aria-label="Rechercher"
          >
            <Search className={`w-[18px] h-[18px] ${iconCls}`} />
            <span
              className={`text-xs font-semibold hidden sm:inline select-none pr-4 ${subTextCls}`}
            >
              Rechercher...
            </span>
          </button>

          {/* Notifications bell — MdNotificationsNone, w/h 18px, me 10px */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className={`relative p-0 mr-[10px] ${iconCls} hover:opacity-70 transition-all`}
            aria-label="Notifications"
            style={{ marginTop: "6px" }}
          >
            <Bell className="w-[18px] h-[18px]" />
            {/* Orange dot */}
            <span
              className="absolute top-0 right-0 w-2 h-2 rounded-full animate-pulse"
              style={{
                background: "#EC8001",
                boxShadow: `0 0 0 2px ${menuBg}`,
              }}
            />
          </button>

          {/* Theme toggle — IoMdMoon / IoMdSunny, me 10px */}
          <button
            onClick={toggleTheme}
            className={`p-0 mr-[10px] ${iconCls} hover:opacity-70 transition-all`}
            aria-label="Basculer le thème"
            style={{ marginTop: "6px" }}
          >
            {isDark ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>

          {/* Avatar — bg #11047A, 40×40, white, cursor pointer */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center font-bold text-sm text-white transition-opacity hover:opacity-90 focus:outline-none"
              style={{
                background: "#11047A",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                cursor: "pointer",
              }}
              aria-label={`Profil de ${displayName}`}
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
            >
              {getInitials(displayName)}
            </button>

            {/* Profile dropdown — borderRadius 20px, no border, shadow */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div
                  className="absolute right-0 mt-2.5 w-56 overflow-hidden z-50"
                  style={{
                    background: menuBg,
                    boxShadow: menuShadow,
                    borderRadius: "20px",
                  }}
                >
                  {/* Greeting header */}
                  <div
                    className={`px-5 pt-4 pb-2.5 text-sm font-bold ${textCls}`}
                    style={{ borderBottom: `1px solid ${borderColor}` }}
                  >
                    👋&nbsp; Hey, {displayName.split(" ")[0]}
                  </div>
                  {/* Items — p 10px */}
                  <div className="p-2.5 flex flex-col gap-0.5">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${textCls}`}
                      style={{ borderRadius: "8px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isDark
                          ? "rgba(255,255,255,0.06)"
                          : "#F4F7FE")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <User className="w-4 h-4" />
                      Paramètres du profil
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium text-[#EE5D50] transition-all w-full text-left"
                      style={{ borderRadius: "8px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isDark
                          ? "rgba(238,93,80,0.1)"
                          : "#FEEFEE")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          NOTIFICATIONS DRAWER
          Horizon: MenuList — boxShadow, borderRadius 20px, bg white/navy.800, border none
      ════════════════════════════════════════════════════════════════════ */}
      {isNotifOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{
            background: "rgba(11,20,55,0.30)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setIsNotifOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-screen z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isNotifOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: "420px",
          background: menuBg,
          boxShadow: menuShadow,
          borderLeft: `1.5px solid ${borderColor}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <div className="flex flex-col items-start gap-0.5">
            <h2 className={`text-base font-bold ${textCls}`}>Notifications</h2>
            <button
              className="text-xs font-semibold"
              style={{ color: isDark ? "#7551FF" : "#422AFB" }}
            >
              Tout marquer comme lu
            </button>
          </div>
          <button
            onClick={() => setIsNotifOpen(false)}
            className={`p-1.5 rounded-xl transition-all ${iconCls}`}
            style={{ borderRadius: "8px" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = isDark
                ? "rgba(255,255,255,0.06)"
                : "#F4F7FE")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center px-6"
          style={{ borderBottom: `1px solid ${borderColor}` }}
        >
          {(["ALL", "INBOX", "TEAM", "FOLLOWING"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveNotifTab(tab)}
              className={`py-4 px-3 text-xs font-bold border-b-2 transition-all ${
                activeNotifTab === tab
                  ? isDark
                    ? "border-[#7551FF] text-[#7551FF]"
                    : "border-[#422AFB] text-[#422AFB]"
                  : `border-transparent ${iconCls} hover:opacity-70`
              }`}
            >
              {tab === "ALL"
                ? "Toutes"
                : tab === "INBOX"
                  ? "Messages"
                  : tab === "TEAM"
                    ? "Équipe"
                    : "Suivis"}
              {tab === "INBOX" && (
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
          <button
            className={`ml-auto p-1.5 rounded-lg ${iconCls} hover:opacity-70 transition-all`}
            style={{ borderRadius: "8px" }}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Notif 1 */}
          <div className="flex space-x-4 items-start">
            <div className="relative flex-shrink-0">
              <div
                className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-xs"
                style={{ background: "#11047A" }}
              >
                JL
              </div>
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500"
                style={{ boxShadow: `0 0 0 2px ${menuBg}` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${textCls}`}>
                <span className="font-extrabold">Joe Lincoln</span> vous a
                mentionné dans{" "}
                <span
                  className="font-bold"
                  style={{ color: isDark ? "#7551FF" : "#422AFB" }}
                >
                  Membres Actifs
                </span>
              </p>
              <p className={`text-xs font-semibold mt-1 ${subTextCls}`}>
                Il y a 18 min • Administration
              </p>
              <div
                className={`mt-3 p-4 text-xs font-medium ${textCls}`}
                style={{
                  background: isDark ? "rgba(11,20,55,0.8)" : "#F4F7FE",
                  borderRadius: "12px",
                }}
              >
                @Admin Est-ce que les fiches d&apos;inscription des nouveaux
                bergers ont été validées ?
              </div>
            </div>
          </div>

          {/* Notif 2 */}
          <div
            className="flex space-x-4 items-start pt-6"
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                LA
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${textCls}`}>
                <span className="font-extrabold">Leslie Alexander</span> a mis à
                jour{" "}
                <span
                  className="font-bold"
                  style={{ color: isDark ? "#7551FF" : "#422AFB" }}
                >
                  Permissions Équipe
                </span>
              </p>
              <p className={`text-xs font-semibold mt-1 ${subTextCls}`}>
                Il y a 53 min • Sécurité
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded"
                  style={{
                    background: isDark ? "rgba(117,81,255,0.15)" : "#F2EFFF",
                    color: isDark ? "#7551FF" : "#422AFB",
                  }}
                >
                  Responsable
                </span>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded"
                  style={{
                    background: isDark ? "rgba(1,181,116,0.1)" : "#E6FAF5",
                    color: "#01B574",
                  }}
                >
                  GEM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — Horizon: 2 buttons, grid cols 2 */}
        <div
          className="grid grid-cols-2 gap-4 p-6"
          style={{
            borderTop: `1px solid ${borderColor}`,
            background: isDark ? "rgba(11,20,55,0.6)" : "#F4F7FE",
          }}
        >
          <button
            onClick={() => setIsNotifOpen(false)}
            className={`w-full py-3 text-xs font-bold border transition-all ${textCls}`}
            style={{ borderRadius: "16px", borderColor }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Tout archiver
          </button>
          <button
            onClick={() => setIsNotifOpen(false)}
            className="w-full py-3 text-xs font-bold text-white transition-all"
            style={{ borderRadius: "16px", background: "#422AFB" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Marquer comme lu
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SEARCH MODAL
      ════════════════════════════════════════════════════════════════════ */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-28 px-4"
          style={{
            background: "rgba(11,20,55,0.40)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl flex flex-col overflow-hidden"
            style={{
              background: menuBg,
              boxShadow: menuShadow,
              borderRadius: "20px",
              maxHeight: "70vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input row */}
            <div
              className="flex items-center px-5 py-4 gap-3"
              style={{ borderBottom: `1px solid ${borderColor}` }}
            >
              <Search className={`w-5 h-5 flex-shrink-0 ${iconCls}`} />
              <input
                type="text"
                autoFocus
                placeholder="Rechercher des membres, groupes, rapports..."
                className={`w-full bg-transparent text-sm font-semibold focus:outline-none ${textCls} placeholder:opacity-60`}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className={`p-1 rounded-lg hover:opacity-70 transition-all ${iconCls}`}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div
              className="flex items-center px-5 overflow-x-auto"
              style={{
                borderBottom: `1px solid ${borderColor}`,
                scrollbarWidth: "none",
              }}
            >
              {[
                { id: "ALL", label: "Général" },
                { id: "MEMBERS", label: "Membres" },
                { id: "GROUPS", label: "Groupes & GEMs" },
                { id: "SETTINGS", label: "Paramètres" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSearchTab(tab.id)}
                  className={`py-3.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeSearchTab === tab.id
                      ? isDark
                        ? "border-[#7551FF] text-[#7551FF]"
                        : "border-[#422AFB] text-[#422AFB]"
                      : `border-transparent ${iconCls} hover:opacity-70`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div
              className="flex-1 overflow-y-auto p-5 space-y-5"
              style={{
                background: isDark
                  ? "rgba(11,20,55,0.3)"
                  : "rgba(244,247,254,0.3)",
                scrollbarWidth: "none",
              }}
            >
              <div className="space-y-3">
                <h4
                  className={`text-xs font-bold uppercase tracking-widest ${iconCls}`}
                >
                  Actions rapides
                </h4>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      href: "/dashboard/profile",
                      icon: <User className="w-4 h-4" />,
                      label: "Mon profil",
                      bg: "#F2EFFF",
                      color: "#422AFB",
                    },
                    {
                      href: "/dashboard/administration",
                      icon: <Settings className="w-4 h-4" />,
                      label: "Configuration de l'application",
                      bg: "#E6FAF5",
                      color: "#01B574",
                    },
                  ].map(({ href, icon, label, bg, color }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsSearchOpen(false)}
                      className={`flex items-center gap-3 p-2.5 transition-all ${textCls}`}
                      style={{
                        background: menuBg,
                        border: `1px solid ${borderColor}`,
                        borderRadius: "12px",
                        boxShadow: "0 1px 4px rgba(112,144,176,0.08)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: bg, color }}
                      >
                        {icon}
                      </div>
                      <span className="text-xs font-semibold">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Topbar } from "./topbar";

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar dépend de `useSession` + `localStorage` + styles conditionnels.
// On l'exclut du SSR pour éviter le mismatch d'hydratation.
// ─────────────────────────────────────────────────────────────────────────────
const Sidebar = dynamic(
  () => import("./sidebar").then((mod) => mod.Sidebar),
  { ssr: false }
);

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("churchflow_sidebar_collapsed");
      if (stored === "true") {
        setIsCollapsed(true);
      }
    } catch {
      // ignore SSR issues
    }
  }, []);

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const nextVal = !prev;
      try {
        localStorage.setItem("churchflow_sidebar_collapsed", String(nextVal));
      } catch {
        // ignore
      }
      return nextVal;
    });
  };

  // Lock body scroll quand la sidebar mobile est ouverte
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — client-only pour éviter le mismatch SSR */}
      {mounted && (
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={handleToggle}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />
      )}

      {/* Zone de contenu */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out
          pl-0
          ${mounted && isCollapsed ? "md:pl-[90px]" : "md:pl-[310px]"}
        `}
      >
        <Topbar
          title={title}
          onHamburgerClick={() => setIsMobileOpen(true)}
        />

        <main className="flex-grow pt-[120px] px-4 md:px-8 pb-8 flex flex-col justify-between overflow-y-auto">
          <div className="flex-grow pb-8">{children}</div>

          <footer className="pt-6 mt-8 border-t border-slate-150 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
            <div>
              <span>
                ChurchFlow &copy; {mounted ? new Date().getFullYear() : 2026}.
                Tous droits réservés.
              </span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-slate-600 dark:hover:text-white transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-white transition-colors">
                CGU &amp; Confidentialité
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

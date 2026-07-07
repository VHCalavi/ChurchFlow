"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

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
    const stored = localStorage.getItem("churchflow_sidebar_collapsed");
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const handleToggle = () => {
    setIsCollapsed(prev => {
      const nextVal = !prev;
      localStorage.setItem("churchflow_sidebar_collapsed", String(nextVal));
      return nextVal;
    });
  };

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (fixed, passing collapse + mobile props) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out
          /* Mobile: no left padding — sidebar floats above */
          pl-0
          /* Desktop: push content right depending on sidebar state */
          ${mounted && isCollapsed ? "md:pl-[90px]" : "md:pl-[310px]"}
        `}
      >
        {/* Topbar (sticky) */}
        <Topbar
          title={title}
          onHamburgerClick={() => setIsMobileOpen(true)}
        />

        {/* Content Wrapper */}
        <main className="flex-grow pt-[120px] px-4 md:px-8 pb-8 flex flex-col justify-between overflow-y-auto">
          <div className="flex-grow pb-8">
            {children}
          </div>

          {/* Footer */}
          <footer className="pt-6 mt-8 border-t border-slate-150 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
            <div>
              <span>ChurchFlow &copy; {mounted ? new Date().getFullYear() : 2026}. Tous droits réservés.</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-slate-600 dark:hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-white transition-colors">CGU &amp; Confidentialité</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

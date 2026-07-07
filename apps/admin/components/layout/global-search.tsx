"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, User, Settings, Users, Network, MapPin } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "MEMBERS" | "GROUPS" | "GEMS";
  url: string;
  extra?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export function GlobalSearch({ isOpen, onClose, isDark }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  
  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const menuBg = isDark ? "#0b1437" : "#ffffff";
  const menuShadow = isDark
    ? "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
    : "14px 17px 40px 4px rgba(112, 144, 176, 0.18)";
  const borderColor = isDark ? "rgba(135, 140, 189, 0.3)" : "#E6ECFA";
  const iconCls = isDark ? "text-white" : "text-[#A3AED0]";
  const textCls = isDark ? "text-white" : "text-[#1B2559]";
  const primaryColor = "#006C69";

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setActiveTab("ALL");
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  if (!isOpen) return null;

  const filteredResults = results.filter(r => {
    if (activeTab === "ALL") return true;
    if (activeTab === "MEMBERS") return r.type === "MEMBERS";
    if (activeTab === "GROUPS") return r.type === "GROUPS" || r.type === "GEMS";
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center pt-28 px-4"
      style={{
        background: "rgba(11,20,55,0.40)",
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des membres, groupes, GEMs..."
            className={`w-full bg-transparent text-sm font-semibold focus:outline-none ${textCls} placeholder:opacity-60`}
          />
          {isLoading && (
            <div className="w-4 h-4 border-2 border-[#006C69] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
          <button
            onClick={onClose}
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
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? `border-[#006C69] text-[#006C69]`
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
          {query.length < 2 ? (
            <div className="space-y-3">
              <h4 className={`text-xs font-bold uppercase tracking-widest ${iconCls}`}>Actions rapides</h4>
              <div className="flex flex-col gap-2">
                {[
                  { href: "/dashboard/profile", icon: <User className="w-4 h-4" />, label: "Mon profil", bg: "#E6FAF5", color: primaryColor },
                  { href: "/dashboard/administration", icon: <Settings className="w-4 h-4" />, label: "Configuration de l'application", bg: "#E6FAF5", color: primaryColor },
                ].map(({ href, icon, label, bg, color }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={`flex items-center gap-3 p-2.5 transition-all ${textCls}`}
                    style={{
                      background: menuBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "12px",
                      boxShadow: "0 1px 4px rgba(112,144,176,0.08)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg, color }}>
                      {icon}
                    </div>
                    <span className="text-xs font-semibold">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-3">
              <h4 className={`text-xs font-bold uppercase tracking-widest ${iconCls}`}>Résultats</h4>
              <div className="flex flex-col gap-2">
                {filteredResults.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.url}
                    onClick={onClose}
                    className={`flex items-center justify-between p-3 transition-all ${textCls}`}
                    style={{
                      background: menuBg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "12px",
                      boxShadow: "0 1px 4px rgba(112,144,176,0.08)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" 
                        style={{ background: result.type === 'MEMBERS' ? '#006C69' : result.type === 'GROUPS' ? '#CEAD1E' : '#12BC7E' }}
                      >
                        {result.type === 'MEMBERS' && <User className="w-4 h-4" />}
                        {result.type === 'GROUPS' && <Users className="w-4 h-4" />}
                        {result.type === 'GEMS' && <Network className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{result.title}</span>
                        <span className="text-xs font-semibold text-[#A3AED0]">{result.subtitle}</span>
                      </div>
                    </div>
                    {result.extra && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F7FE] text-[#006C69]">
                        {result.extra}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ) : !isLoading ? (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-[#A3AED0] mx-auto mb-3 opacity-50" />
              <p className="text-sm font-bold text-[#A3AED0]">Aucun résultat trouvé pour "{query}"</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

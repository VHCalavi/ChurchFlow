"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  User, 
  X, 
  Settings, 
  Image as ImageIcon, 
  FileText,
  HelpCircle,
  MoreVertical
} from "lucide-react";


interface TopbarProps {
  title?: string;
}

export function Topbar({ title = "Tableau de Bord Global" }: TopbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"ALL" | "INBOX" | "TEAM" | "FOLLOWING">("ALL");
  const [activeSearchTab, setActiveSearchTab] = useState<string>("MIXED");

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between h-20 px-8 bg-white/70 backdrop-blur-md border-b border-slate-100">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">{title}</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Bienvenue dans l&apos;espace administratif de ChurchFlow</p>
        </div>

        {/* Right Tools */}
        <div className="flex items-center space-x-4">
          {/* Search Button (Exact Metronic Icon Trigger style!) */}
          {/* <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:text-primary text-slate-400 transition-all cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button> */}

          {/* Notifications Button */}
          {/* <button 
            onClick={() => setIsOpen(true)}
            className="relative p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:text-primary text-slate-400 transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary ring-4 ring-white animate-pulse" />
          </button> */}

          {/* Divider */}
          {/* <div className="w-px h-6 bg-slate-100" /> */}

          {/* Profile */}
          <Link href="/dashboard/profile" className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center transition-all group-hover:border-primary/30">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-all">Dr. Paul OBIANG</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Pasteur Principal</p>
            </div>
          </Link>
        </div>
      </header>

      {/* ======================================================== */}
      {/* METRONIC-STYLE NOTIFICATIONS SIDEBAR DRAWER              */}
      {/* ======================================================== */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-screen w-full max-w-md bg-white border-l border-slate-100 shadow-[0_0_40px_0_rgba(0,0,0,0.06)] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header Title */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Notifications</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50/20">
          <div className="flex space-x-5 text-xs font-bold text-slate-500">
            {[
              { id: "ALL", label: "All" },
              { id: "INBOX", label: "Inbox", dot: true },
              { id: "TEAM", label: "Team" },
              { id: "FOLLOWING", label: "Following" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as "ALL" | "INBOX" | "TEAM" | "FOLLOWING")}
                className={`py-4 transition-all relative flex items-center ${
                  activeSubTab === tab.id 
                    ? "text-primary border-b-2 border-primary" 
                    : "hover:text-primary border-b-2 border-transparent"
                }`}
              >
                <span>{tab.label}</span>
                {tab.dot && (
                  <span className="w-1.5 h-1.5 ml-1 rounded-full bg-emerald-500" />
                )}
              </button>
            ))}
          </div>

          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
          {/* Notification 1: Joe Lincoln */}
          <div className="flex space-x-4 items-start">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">
                JL
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800">
                <span className="font-bold text-slate-900">Joe Lincoln</span> mentioned you in <span className="font-bold text-primary hover:underline cursor-pointer">Latest Trends</span> topic
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">18 mins ago • Web Design 2024</p>
              
              {/* Bubble text comment card */}
              <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                @Cody For an expert opinion, check out what Mike has to say on this topic!
              </div>

              {/* Reply field */}
              <div className="mt-2.5 relative">
                <input 
                  type="text" 
                  placeholder="Reply" 
                  className="w-full pl-3 pr-9 py-2 text-xs font-semibold rounded-lg border border-slate-150 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                />
                <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notification 2: Leslie Alexander */}
          <div className="flex space-x-4 items-start border-t border-slate-100 pt-6">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">
                LA
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800">
                <span className="font-bold text-slate-900">Leslie Alexander</span> added new tags to <span className="font-bold text-primary hover:underline cursor-pointer">Web Redesign 2024</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">53 mins ago • ACME</p>

              {/* Colored tag badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  Client-Request
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                  Figma
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Redesign
                </span>
              </div>
            </div>
          </div>

          {/* Notification 3: Guy Hawkins */}
          <div className="flex space-x-4 items-start border-t border-slate-100 pt-6">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">
                GH
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800">
                <span className="font-bold text-slate-900">Guy Hawkins</span> requested access to <span className="font-bold text-primary hover:underline cursor-pointer">AirSpace</span> project
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">14 hours ago • Dev Team</p>

              {/* Decline Accept Buttons */}
              <div className="flex items-center space-x-2 mt-3">
                <button className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer">
                  Decline
                </button>
                <button className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all cursor-pointer">
                  Accept
                </button>
              </div>
            </div>
          </div>

          {/* Notification 4: Jane Perez */}
          <div className="flex space-x-4 items-start border-t border-slate-100 pt-6">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">
                JP
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800">
                <span className="font-bold text-slate-900">Jane Perez</span> invites you to review a file.
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">3 hours ago • 742kb</p>

              {/* PDF card */}
              <div className="flex items-center space-x-3 mt-3 p-3.5 rounded-xl border border-slate-150 bg-slate-50/50">
                <div className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Launch_nov24.pptx</p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Edited 39 mins ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification 5: Raymond Pawell */}
          <div className="flex space-x-4 items-start border-t border-slate-100 pt-6">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">
                RP
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800">
                <span className="font-bold text-slate-900">Raymond Pawell</span> posted a new article <span className="font-bold text-primary hover:underline cursor-pointer">2024 Roadmap</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">1 hour ago • Roadmap</p>
            </div>
          </div>

          {/* Notification 6: Tyler Hero */}
          <div className="flex space-x-4 items-start border-t border-slate-100 pt-6">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm">
                TH
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800">
                <span className="font-bold text-slate-900">Tyler Hero</span> wants to view your design project
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">3 days ago • Metronic Launcher mockups</p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50/50 border-t border-slate-100">
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full py-3 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-750 transition-all cursor-pointer text-center"
          >
            Archive all
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full py-3 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-750 transition-all cursor-pointer text-center"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* METRONIC CENTERED SEARCH MODAL                          */}
      {/* ======================================================== */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs z-50 flex items-start justify-center pt-28 px-4 transition-all duration-300"
          onClick={() => setIsSearchOpen(false)}
        >
          {/* Modal box */}
          <div 
            className="w-full max-w-xl bg-white rounded-xl shadow-[0_15px_50px_-10px_rgba(0,0,0,0.18)] border border-slate-100 overflow-hidden flex flex-col max-h-[70vh] scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Area */}
            <div className="flex items-center px-5 py-4.5 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search..."
                className="w-full text-slate-800 placeholder-slate-400 text-sm font-semibold focus:outline-none"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-50 text-slate-450 hover:text-slate-650 transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center justify-between px-5 border-b border-slate-100 bg-slate-50/15 flex-shrink-0">
              <div className="flex space-x-4.5 text-[11px] font-bold text-slate-450 overflow-x-auto scrollbar-none">
                {[
                  { id: "ALL", label: "Général" },
                  { id: "MEMBERS", label: "Membres" },
                  { id: "GROUPS", label: "Groupes & GEMs" },
                  { id: "FORMATIONS", label: "Formations" },
                  { id: "FINANCES", label: "Finances & Dîmes" },
                  { id: "SETTINGS", label: "Paramètres" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSearchTab(tab.id)}
                    className={`py-3.5 transition-all border-b-2 whitespace-nowrap ${
                      activeSearchTab === tab.id 
                        ? "text-primary border-primary" 
                        : "border-transparent hover:text-primary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer flex-shrink-0 ml-2">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Results Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-none text-left">
              {/* Category: Settings */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paramètres & Support</h4>
                
                <div className="space-y-2.5">
                  <Link href="/dashboard/profile" onClick={() => setIsSearchOpen(false)} className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-primary transition-all">Profil Public</span>
                  </Link>

                  <Link href="/dashboard/profile" onClick={() => setIsSearchOpen(false)} className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                      <Settings className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-primary transition-all">Mon Compte Administrateur</span>
                  </Link>

                  <div className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                      <HelpCircle className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-primary transition-all">Centre d&apos;Assistance & FAQ</span>
                  </div>
                </div>
              </div>

              {/* Category: Integrations */}
              <div className="space-y-3.5 border-t border-slate-100 pt-5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modules ChurchFlow</h4>

                <div className="space-y-3">
                  <Link href="/dashboard/groups" onClick={() => setIsSearchOpen(false)} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
                        GEM
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Groupes & Cellules de Maison</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Suivi des rapports hebdomadaires</p>
                      </div>
                    </div>
                    {/* User Avatars on Right */}
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <div className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[7px] font-bold">P</div>
                      <div className="w-5 h-5 rounded-full bg-slate-300 border border-white flex items-center justify-center text-[7px] font-bold">M</div>
                      <div className="w-5 h-5 rounded-full bg-[#06A7B5] border border-white flex items-center justify-center text-[8px] font-bold text-white">+12</div>
                    </div>
                  </Link>

                  <Link href="/dashboard/formations" onClick={() => setIsSearchOpen(false)} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center font-bold text-xs shadow-sm">
                        EDU
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Écoles de Croissance</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">École des Bergers & Affermissement</p>
                      </div>
                    </div>
                    {/* User Avatars on Right */}
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <div className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[7px] font-bold">E</div>
                      <div className="w-5 h-5 rounded-full bg-slate-300 border border-white flex items-center justify-center text-[7px] font-bold">T</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Category: Users */}
              <div className="space-y-3.5 border-t border-slate-100 pt-5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membres Référencés</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-250 flex items-center justify-center text-xs font-bold text-slate-700 shadow-xs">
                        PO
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-850">Dr. Paul OBIANG</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">paul.obiang@churchflow.com • Pasteur Principal</p>
                      </div>
                    </div>
                    {/* Status Badge & Actions */}
                    <div className="flex items-center space-x-3">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Actif
                      </span>
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-250 flex items-center justify-center text-xs font-bold text-slate-700 shadow-xs">
                        EK
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-850">Mme Esther KOUASSI</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">esther.kouassi@churchflow.com • Responsable Trésorerie</p>
                      </div>
                    </div>
                    {/* Status Badge & Actions */}
                    <div className="flex items-center space-x-3">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-750 border border-red-100">
                        En Mission
                      </span>
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

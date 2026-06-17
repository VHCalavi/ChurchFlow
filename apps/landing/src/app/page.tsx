"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Network,
  GraduationCap,
  CalendarDays,
  ShieldCheck,
  Wallet,
  Package,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  Play,
  UserCheck,
  Star,
  Check,
  TrendingUp,
  Sliders,
  Sun,
  Moon
} from "lucide-react";

export default function LandingPage() {
  const [theme, setTheme] = useState<"LIGHT" | "DARK">("LIGHT");
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("membres");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Initialize theme from localStorage on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("landing-theme") as "LIGHT" | "DARK";
    if (savedTheme === "DARK" || savedTheme === "LIGHT") {
      setTheme(savedTheme);
    } else {
      setTheme("LIGHT"); // LIGHT is the default
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "LIGHT" ? "DARK" : "LIGHT";
    setTheme(nextTheme);
    localStorage.setItem("landing-theme", nextTheme);
  };

  // Base architecture modules from PRD_VH_Calavi.md
  const modules = [
    {
      id: "membres",
      title: "Membres & Hiérarchie",
      icon: <Users className="w-5 h-5" />,
      color: "#006C69",
      desc: "Suivez le parcours complet de vos membres avec notre système de hiérarchie unique : Statuts, Grades et Échelons.",
      bullets: [
        "Classification stricte par statuts : Sympathisant, Membre, Responsable.",
        "Grades de responsabilité pastorale : Aspirant, Serviteur, Gagneur d'âmes, Assistant Pasteur, etc.",
        "Échelons d'impact (étendue de gestion) : de C2 (2 personnes) à GA C100 (100 personnes et plus)."
      ]
    },
    {
      id: "groupes",
      title: "Groupes & GEMs",
      icon: <Network className="w-5 h-5" />,
      color: "#EC8001",
      desc: "Orchestrez la vie communautaire de votre église à travers des structures pyramidales souples et robustes.",
      bullets: [
        "Organisation par Départements administratifs et opérationnels.",
        "Tribus régionales ou par affinités pour resserrer les liens.",
        "GEM (Groupes d'Évangélisation et de Mission) : cellules locales de partage et de croissance spirituelle."
      ]
    },
    {
      id: "formations",
      title: "Formations & Écoles",
      icon: <GraduationCap className="w-5 h-5" />,
      color: "#CEAD1E",
      desc: "Pilotez le cursus de croissance et les académies spirituelles directement depuis le portail.",
      bullets: [
        "Suivi des promotions pour les académies de croissance et classes de baptême.",
        "Gestion complète du cursus 'Porteurs de Vie' (PDV).",
        "Suivi académique de l'École des bergers pour former vos futurs leaders."
      ]
    },
    {
      id: "reunions",
      title: "Réunions & Agenda",
      icon: <CalendarDays className="w-5 h-5" />,
      color: "#8B5CF6",
      desc: "Planifiez, planifiez et analysez la présence de toutes les rencontres officielles de l'église.",
      bullets: [
        "Gestion globale des cultes du dimanche et temps de prière officiels.",
        "Répétitions de chorales, réunions techniques et logistiques.",
        "Suivi des Agapés de Tribus et partages fraternels locaux."
      ]
    },
    {
      id: "finances",
      title: "Comptabilité & Finances",
      icon: <Wallet className="w-5 h-5" />,
      color: "#10B981",
      desc: "Maintenez une transparence financière totale grâce à notre module de comptabilité analytique.",
      bullets: [
        "Saisie simplifiée et sécurisée des Dîmes et Offrandes dominicales.",
        "Rapports mensuels de comptabilité générale et suivi des contributions GEM.",
        "Permissions d'accès distinctes pour le secrétariat et le trésorier."
      ]
    },
    {
      id: "administration",
      title: "Patrimoine & Logistique",
      icon: <Package className="w-5 h-5" />,
      color: "#B1C431",
      desc: "Supervisez les ressources matérielles et logistiques qui soutiennent l'activité de l'église.",
      bullets: [
        "Inventaire en temps réel du matériel (audio, chaises, instruments, projecteurs).",
        "Gestion des prestataires externes et suivi des contrats de maintenance.",
        "Suivi des flux d'achats et processus d'approbations internes."
      ]
    }
  ];

  const faqs = [
    {
      q: "Comment fonctionne la hiérarchie unique Grades & Échelons de ChurchFlow ?",
      a: "ChurchFlow intègre un système hiérarchique spirituel et pastoral novateur. Les membres obtiennent un statut (Sympathisant, Membre, Responsable). S'ils deviennent responsables, ils acquièrent un Grade (Aspirant, Serviteur, Gagneur d'âmes, Assistant Pasteur, etc.) qui définit leur maturité et cursus pastoral, et un Échelon (C2, C5, C10, C20, GA C50, GA C100) qui reflète le nombre réel de personnes qu'ils encadrent activement."
    },
    {
      q: "Qu'est-ce qu'un GEM dans l'architecture ChurchFlow ?",
      a: "Un GEM (Groupe d'Évangélisation et de Mission) est une cellule de maison ou groupe de croissance local au sein de l'église. ChurchFlow permet de rattacher chaque GEM à une Tribu ou à un Département, de nommer des bergers responsables de GEM et de suivre la croissance hebdomadaire de ces cellules."
    },
    {
      q: "L'application est-elle compatible avec les smartphones ?",
      a: "Absolument. ChurchFlow est entièrement responsive. L'application d'administration utilise un layout Metronic adaptatif qui s'ajuste parfaitement sur mobile, tablette et ordinateur de bureau. Vos bergers peuvent renseigner les présences aux GEM directement depuis leur téléphone."
    },
    {
      q: "Mes données financières sont-elles sécurisées ?",
      a: "La sécurité est notre priorité absolue. Toutes les données financières (dîmes, offrandes) sont cryptées en transit et au repos. De plus, notre système RBAC (Role-Based Access Control) garantit que seuls les utilisateurs disposant du rôle Trésorier ou Administrateur peuvent consulter ces informations."
    }
  ];

  // Helper variables for theme switching classnames
  const isDark = theme === "DARK";

  return (
    <div className={`relative min-h-screen flex flex-col overflow-hidden transition-colors duration-300 ${
      isDark ? "bg-[#090a0f] text-slate-100 radial-mesh" : "bg-slate-50 text-slate-900 radial-mesh-light"
    }`}>
      
      {/* Background Glowing Circles */}
      {isDark ? (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#06a7b5] opacity-10 blur-[150px] animate-pulse-glow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#ec8001] opacity-[0.08] blur-[150px] animate-pulse-glow" />
          <div className="absolute inset-0 pointer-events-none grid-bg opacity-30" />
        </>
      ) : (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#06a7b5] opacity-[0.05] blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#ec8001] opacity-[0.03] blur-[120px] animate-pulse-glow" />
          <div className="absolute inset-0 pointer-events-none grid-bg-light opacity-50" />
        </>
      )}

      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-350 border-b ${
        isDark ? "border-white/5 bg-[#090a0f]/80 backdrop-blur-lg" : "border-slate-200/50 bg-white/80 backdrop-blur-lg"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06a7b5] to-[#006c69] shadow-md group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-white text-base">CF</span>
            </div>
            <span className={`font-black text-xl tracking-tight group-hover:opacity-90 transition-opacity ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              ChurchFlow<span className="text-[#06a7b5]">.SaaS</span>
            </span>
          </a>

          {/* Right aligned desktop controls */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            
            {/* Desktop Navigation */}
            <nav className="flex items-center space-x-6 lg:space-x-8">
              <a href="#features" className={`text-sm font-medium transition-colors ${isDark ? "text-slate-350 hover:text-white" : "text-slate-600 hover:text-[#06a7b5]"}`}>Fonctionnalités</a>
              <a href="#modules" className={`text-sm font-medium transition-colors ${isDark ? "text-slate-350 hover:text-white" : "text-slate-600 hover:text-[#06a7b5]"}`}>Nos Modules</a>
              <a href="#hierarchie" className={`text-sm font-medium transition-colors ${isDark ? "text-slate-350 hover:text-white" : "text-slate-600 hover:text-[#06a7b5]"}`}>Grades & Échelons</a>
              <a href="#pricing" className={`text-sm font-medium transition-colors ${isDark ? "text-slate-350 hover:text-white" : "text-slate-600 hover:text-[#06a7b5]"}`}>Tarifs</a>
              <a href="#faq" className={`text-sm font-medium transition-colors ${isDark ? "text-slate-350 hover:text-white" : "text-slate-600 hover:text-[#06a7b5]"}`}>FAQ</a>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 border-l pl-6 border-slate-200/50 dark:border-white/5">
              <a
                href="https://churchflow-indol.vercel.app/login"
                className={`text-sm font-bold transition-colors ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Connexion
              </a>
              <a
                href="https://churchflow-indol.vercel.app/login"
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  isDark
                    ? "bg-[#06a7b5] text-white hover:bg-[#006c69] shadow-[0_0_20px_rgba(6,167,181,0.25)]"
                    : "bg-slate-950 text-white hover:bg-slate-800 shadow-sm"
                }`}
              >
                Démarrer
              </a>
            </div>

            {/* Metronic-style Theme Toggler - Far Right */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isDark 
                  ? "text-slate-400 hover:text-white hover:bg-white/5" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title={isDark ? "Activer le Mode Clair" : "Activer le Mode Sombre"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

          </div>

          {/* Mobile Menu & Toggle Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all ${
                isDark 
                  ? "bg-[#161824] border-white/5 text-amber-400" 
                  : "bg-slate-100 border-slate-250 text-slate-550"
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className={`fixed inset-x-0 top-20 z-45 md:hidden border-b p-6 space-y-4 shadow-xl ${
          isDark ? "border-white/5 bg-[#090a0f]" : "border-slate-200 bg-white"
        }`}>
          <nav className="flex flex-col space-y-4">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold ${isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
            >
              Fonctionnalités
            </a>
            <a 
              href="#modules" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold ${isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
            >
              Nos Modules
            </a>
            <a 
              href="#hierarchie" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold ${isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
            >
              Grades & Échelons
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold ${isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
            >
              Tarifs
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold ${isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"}`}
            >
              FAQ
            </a>
          </nav>
          <div className="pt-4 border-t border-slate-200/50 flex flex-col space-y-3">
            <a
              href="https://churchflow-indol.vercel.app/login"
              className={`w-full text-center py-2.5 rounded-xl border font-semibold ${
                isDark ? "border-white/10 text-slate-300 bg-white/2" : "border-slate-200 text-slate-700 bg-slate-50"
              }`}
            >
              Connexion
            </a>
            <a
              href="https://churchflow-indol.vercel.app/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#06a7b5] text-white font-bold"
            >
              Démarrer
            </a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center relative z-10">
        
        {/* Glow Badges */}
        <div className={`inline-flex items-center space-x-2.5 px-4 py-2 rounded-full border mb-8 shadow-xs ${
          isDark ? "border-[#06a7b5]/20 bg-[#06a7b5]/5" : "border-[#06a7b5]/30 bg-[#06a7b5]/10"
        }`}>
          <span className="flex w-2 h-2 rounded-full bg-[#06a7b5] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#06a7b5]">Version 2.0 Spéciale Églises Connectées</span>
        </div>

        {/* Major Headline */}
        <h1 className={`max-w-5xl mx-auto text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6 ${
          isDark ? "text-white" : "text-slate-900"
        }`}>
          Propulsez la Croissance et l'Administration de <span className="text-gradient-primary">votre Église</span>
        </h1>

        {/* Supporting description */}
        <p className={`max-w-3xl mx-auto text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-10 ${
          isDark ? "text-slate-400" : "text-slate-650"
        }`}>
          Le système SaaS tout-en-un le plus puissant et complet pour gérer vos membres, tribus, GEMs, formations, réunions et finances avec l'élégance et la fluidité visuelle du design Metronic.
        </p>

        {/* Actions buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a
            href="https://churchflow-indol.vercel.app/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-white bg-[#06a7b5] hover:bg-[#006c69] active:scale-98 transition-all shadow-[0_0_30px_rgba(6,167,181,0.3)] flex items-center justify-center space-x-2"
          >
            <span>Démarrer</span>
            <ArrowRight className="w-5 h-5" />
          </a>
          <a 
            href="#modules" 
            className={`w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold active:scale-98 transition-all flex items-center justify-center space-x-2 border ${
              isDark 
                ? "text-slate-350 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white" 
                : "text-slate-700 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-sm"
            }`}
          >
            <Play className={`w-4 h-4 text-transparent ${isDark ? "fill-slate-350" : "fill-slate-700"}`} />
            <span>Découvrir nos Modules</span>
          </a>
        </div>

        {/* Premium Interactive Metronic Simulated Dashboard Mockup */}
        <div className={`relative max-w-6xl mx-auto rounded-2xl border p-3 backdrop-blur-md transition-all ${
          isDark 
            ? "border-white/10 bg-[#0d0e16]/80 shadow-[0_30px_100px_rgba(0,0,0,0.6)]" 
            : "border-slate-200 bg-slate-100/80 shadow-[0_30px_70px_rgba(0,0,0,0.1)]"
        }`}>
          
          {/* Top glowing ambient highlight */}
          <div className="absolute top-[-5px] left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-[#06a7b5] to-transparent blur-[3px]" />

          {/* Window Buttons */}
          <div className={`flex items-center space-x-2 px-3 pb-3 border-b ${isDark ? "border-white/5" : "border-slate-200"}`}>
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider ml-4 uppercase">Churchflow Admin portal — Aperçu Live</span>
          </div>

          {/* Dashboard Inner Shell */}
          <div className="flex h-[480px] bg-[#090a0f] rounded-xl overflow-hidden text-left text-xs text-slate-400">
            
            {/* Dark Sidebar mock */}
            <aside className="w-48 bg-[#151521] border-r border-[#1f1f2e] p-3 flex flex-col justify-between shrink-0">
              <div>
                {/* Brand Logo header */}
                <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#1f1f2e]">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#06a7b5] to-[#006c69] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-white">CF</span>
                  </div>
                  <span className="font-extrabold text-[11px] text-white">ChurchFlow</span>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-[#06a7b5]15 text-[#06a7b5] border border-[#06a7b5]25">
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span className="font-bold">Tableau de Bord</span>
                  </div>
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">
                    <Users className="w-4 h-4 shrink-0 text-[#006C69]" />
                    <span className="font-medium">Membres</span>
                  </div>
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">
                    <Network className="w-4 h-4 shrink-0 text-[#EC8001]" />
                    <span className="font-medium">Groupes & GEM</span>
                  </div>
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">
                    <GraduationCap className="w-4 h-4 shrink-0 text-[#CEAD1E]" />
                    <span className="font-medium">Formations</span>
                  </div>
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">
                    <CalendarDays className="w-4 h-4 shrink-0 text-[#8B5CF6]" />
                    <span className="font-medium">Réunions</span>
                  </div>
                  <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors">
                    <Wallet className="w-4 h-4 shrink-0 text-[#10B981]" />
                    <span className="font-medium">Finances</span>
                  </div>
                </div>
              </div>

              {/* Sidebar bottom switch */}
              <div className="border-t border-[#1f1f2e] pt-3 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400">MODE SOMBRE</span>
                <div className="w-6 h-6 rounded-md bg-[#1e1e2d] border border-[#2b2b40] flex items-center justify-center text-amber-400 shadow-sm shrink-0">
                  <Play className="w-2.5 h-2.5 rotate-270 fill-amber-400 text-transparent" />
                </div>
              </div>
            </aside>

            {/* Content Mock */}
            <div className="flex-1 flex flex-col bg-[#090a0f] overflow-hidden">
              
              {/* Header topbar mock */}
              <header className="h-12 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-[#0d0e15]/50">
                <span className="font-bold text-white text-[11px]">Portail VH Calavi</span>
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#06a7b5]">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
              </header>

              {/* Main content body mock */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                
                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-[#121420] border border-white/5 rounded-xl p-3 shadow-xs">
                    <span className="text-[9px] text-slate-500 font-bold block mb-1">MEMBRES TOTAL</span>
                    <span className="text-sm font-extrabold text-white">1 240</span>
                    <span className="text-[8px] text-emerald-500 font-bold flex items-center mt-1">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                      +12% ce mois
                    </span>
                  </div>
                  <div className="bg-[#121420] border border-white/5 rounded-xl p-3 shadow-xs">
                    <span className="text-[9px] text-slate-500 font-bold block mb-1">GEM ACTIFS</span>
                    <span className="text-sm font-extrabold text-white">42</span>
                    <span className="text-[8px] text-[#ec8001] font-bold block mt-1">6 Équipes Tribales</span>
                  </div>
                  <div className="bg-[#121420] border border-white/5 rounded-xl p-3 shadow-xs">
                    <span className="text-[9px] text-slate-500 font-bold block mb-1">FORMATION EN COURS</span>
                    <span className="text-sm font-extrabold text-white">88</span>
                    <span className="text-[8px] text-[#cead1e] font-bold block mt-1">École des bergers</span>
                  </div>
                  <div className="bg-[#121420] border border-white/5 rounded-xl p-3 shadow-xs">
                    <span className="text-[9px] text-slate-500 font-bold block mb-1">DÎMES & OFFRANDES</span>
                    <span className="text-sm font-extrabold text-[#10b981]">+24%</span>
                    <span className="text-[8px] text-slate-500 font-bold block mt-1">Trésorerie saine</span>
                  </div>
                </div>

                {/* Simulated Chart & List Card */}
                <div className="grid grid-cols-3 gap-4">
                  
                  {/* SVG Chart Box */}
                  <div className="col-span-2 bg-[#121420] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-white block mb-0.5">Croissance mensuelle de l'Audience</span>
                      <span className="text-[8px] text-slate-500 font-semibold">Inscriptions directes aux cultes</span>
                    </div>
                    {/* Tiny responsive curved chart */}
                    <div className="h-28 w-full relative mt-3">
                      <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="glow-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06a7b5" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#06a7b5" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path d="M 0 90 Q 50 60 100 75 T 200 40 T 300 10 L 300 100 L 0 100 Z" fill="url(#glow-grad)" />
                        {/* Curve Line */}
                        <path d="M 0 90 Q 50 60 100 75 T 200 40 T 300 10" fill="none" stroke="#06a7b5" strokeWidth="2.5" />
                        {/* Points */}
                        <circle cx="100" cy="75" r="3.5" fill="#06a7b5" stroke="#121420" strokeWidth="1" />
                        <circle cx="200" cy="40" r="3.5" fill="#06a7b5" stroke="#121420" strokeWidth="1" />
                        <circle cx="300" cy="10" r="3.5" fill="#ffffff" stroke="#06a7b5" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Right side list block */}
                  <div className="bg-[#121420] border border-white/5 rounded-xl p-3 flex flex-col">
                    <span className="text-[10px] font-bold text-white block mb-2">Activités Récentes GEM</span>
                    <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                      <div className="flex items-center space-x-2 py-1 border-b border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#06a7b5]" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-350 truncate">GEM VH Calavi Centre</p>
                          <p className="text-[8px] text-slate-500 font-medium">12 Présences enregistrées</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 py-1 border-b border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ec8001]" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-350 truncate">GEM PDV Ouidah</p>
                          <p className="text-[8px] text-slate-500 font-medium">Nouveau baptisé enregistré</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#cead1e]" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-350 truncate">Académie de croissance</p>
                          <p className="text-[8px] text-slate-500 font-medium">Session pastorale clôturée</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Brand Metrics Section */}
      <section className={`border-t border-b py-12 relative z-10 transition-colors ${
        isDark ? "border-white/5 bg-[#090a0f]/40" : "border-slate-200 bg-slate-200/30"
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className={`text-3xl md:text-4xl font-extrabold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>99.99%</p>
            <p className={`text-xs md:text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-550"}`}>Taux de Disponibilité (Uptime)</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#06a7b5] mb-2">50 000+</p>
            <p className={`text-xs md:text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-550"}`}>Membres Actifs Gérés</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#ec8001] mb-2">180+</p>
            <p className={`text-xs md:text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-550"}`}>Églises & GEM Déployés</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#cead1e] mb-2">&lt; 15 mins</p>
            <p className={`text-xs md:text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-550"}`}>Temps de Configuration de base</p>
          </div>
        </div>
      </section>

      {/* Features showcase section (En fonction de nos modules!) */}
      <section id="modules" className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-[#06a7b5] block mb-3">CONÇU POUR LE MINISTÈRE</span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            Des Modules Métiers Adaptés à Votre Vision
          </h2>
          <p className={`text-base font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Chaque aspect opérationnel de votre communauté est structuré de manière optimale, de la hiérarchie spirituelle pastorale à la comptabilité générale de l'église.
          </p>
        </div>

        {/* Tab Grid Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-12">
          {modules.map((mod) => {
            const isSelected = activeTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveTab(mod.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? "bg-[#121420] border-[#06a7b5] text-white shadow-[0_0_20px_rgba(6,167,181,0.15)]"
                      : "bg-white border-[#06a7b5] text-[#06a7b5] shadow-[0_8px_20px_rgba(6,167,181,0.08)]"
                    : isDark
                    ? "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white"
                    : "bg-slate-100 border-slate-200/65 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                <span 
                  className="mb-2.5 transition-transform" 
                  style={{ color: isSelected ? "#06a7b5" : mod.color }}
                >
                  {mod.icon}
                </span>
                <span className="text-xs font-bold tracking-tight block truncate w-full">{mod.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Details Card */}
        {modules.map((mod) => {
          if (mod.id !== activeTab) return null;
          return (
            <div 
              key={mod.id}
              className={`rounded-2xl border p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center shadow-lg animate-fadeIn ${
                isDark 
                  ? "glass border-white/10 text-slate-100" 
                  : "bg-white border-slate-250/60 text-slate-900"
              }`}
            >
              <div>
                {/* Header Icon Block */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm"
                  style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
                >
                  {mod.icon}
                </div>

                <h3 className={`text-2xl md:text-3xl font-black mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>{mod.title}</h3>
                <p className={`text-base font-medium leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{mod.desc}</p>

                {/* Bullets List */}
                <ul className="space-y-3.5">
                  {mod.bullets.map((bullet, idx) => (
                    <li key={idx} className={`flex items-start space-x-3 text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      <CheckCircle2 className="w-5 h-5 text-[#06a7b5] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dynamic simulated module graphic on the right */}
              <div className={`border rounded-2xl p-6 relative overflow-hidden h-[300px] flex items-center justify-center ${
                isDark ? "bg-[#090a0f] border-white/5" : "bg-slate-50 border-slate-200"
              }`}>
                
                {/* Glowing circular backdrop */}
                <div 
                  className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-15"
                  style={{ backgroundColor: mod.color }}
                />

                {/* Membres & Hiérarchie visualizer preview */}
                {mod.id === "membres" && (
                  <div className="relative w-full max-w-sm space-y-3.5 z-10 text-xs font-semibold">
                    <div className="p-3 bg-[#121420] border border-white/5 rounded-xl shadow-xs flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#006c69]/20 border border-[#006c69]/30 flex items-center justify-center text-[#006c69] font-bold">PO</div>
                        <div>
                          <p className="text-white font-bold">Dr. Paul OBIANG</p>
                          <p className="text-[9px] text-[#006c69] uppercase font-extrabold tracking-wider">Statut: Responsable</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-[#06a7b5]/10 text-[#06a7b5] text-[9px] font-black uppercase">PASTEUR TITULAIRE</span>
                    </div>

                    <div className="flex items-center justify-center text-slate-600 my-1">
                      <ChevronDown className="w-4 h-4" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#121420] border border-white/5 rounded-xl text-center shadow-xs">
                        <span className="text-[9px] text-slate-500 font-bold block mb-1">GRADE PASTORAL</span>
                        <span className="text-white font-extrabold">Assistant Pasteur</span>
                      </div>
                      <div className="p-3 bg-[#121420] border border-white/5 rounded-xl text-center shadow-xs">
                        <span className="text-[9px] text-slate-500 font-bold block mb-1">ÉCHELON DE GESTION</span>
                        <span className="text-white font-extrabold">GA C100 (+100p)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Groupes & GEMs visualizer preview */}
                {mod.id === "groupes" && (
                  <div className="relative w-full max-w-xs z-10 text-xs font-semibold">
                    <div className="p-3 bg-[#121420] border border-white/5 rounded-xl text-center shadow-xs mb-3">
                      <p className="text-[9px] text-[#ec8001] font-extrabold uppercase mb-1">Structure Régionale</p>
                      <p className="text-white font-bold">Tribu du Sud (VH Calavi)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 pl-6 relative">
                      <div className="absolute left-2.5 top-0 bottom-6 w-0.5 bg-white/5" />
                      <div className="p-2 bg-[#121420] border border-white/5 rounded-lg shadow-xs flex items-center justify-between">
                        <span className="text-white font-bold truncate">GEM Calavi 1</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black">12p</span>
                      </div>
                      <div className="p-2 bg-[#121420] border border-white/5 rounded-lg shadow-xs flex items-center justify-between">
                        <span className="text-white font-bold truncate">GEM Ouidah 2</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black">8p</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Formations & Écoles preview */}
                {mod.id === "formations" && (
                  <div className="relative w-full max-w-xs space-y-3 z-10 text-xs font-semibold">
                    <div className="p-3 bg-[#121420] border border-white/5 rounded-xl shadow-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-bold">École des Bergers</span>
                        <span className="text-[#cead1e] font-bold text-[9px]">En cours (Promo 4)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mt-1.5">
                        <div className="w-3/4 h-full bg-[#cead1e]" />
                      </div>
                      <p className="text-[8px] text-slate-500 font-semibold mt-1">75% du cursus complété • 12 étudiants</p>
                    </div>
                    <div className="p-3 bg-[#121420] border border-white/5 rounded-xl shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold">Porteurs de Vie (PDV)</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black">Session Active</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Réunions & Agenda preview */}
                {mod.id === "reunions" && (
                  <div className="relative w-full max-w-xs space-y-2 z-10 text-xs font-semibold">
                    <div className="p-2.5 bg-[#121420] border border-white/5 rounded-xl shadow-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                        <div>
                          <p className="text-white font-bold">Culte d'Adoration Principal</p>
                          <p className="text-[8px] text-slate-500">Chaque Dimanche à 08:30</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-white text-[8px] font-bold">Culte</span>
                    </div>
                    <div className="p-2.5 bg-[#121420] border border-white/5 rounded-xl shadow-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#ec8001] shrink-0" />
                        <div>
                          <p className="text-white font-bold">Agapé Fraternel de Tribu</p>
                          <p className="text-[8px] text-slate-500">Mardi Prochain à 19:00</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-white text-[8px] font-bold">Rencontre</span>
                    </div>
                  </div>
                )}

                {/* Comptabilité & Finances preview */}
                {mod.id === "finances" && (
                  <div className="relative w-full max-w-xs space-y-2 z-10 text-xs font-semibold">
                    <div className="p-3 bg-[#121420] border border-white/5 rounded-xl shadow-xs">
                      <p className="text-[9px] text-slate-500 font-bold mb-1">TOTAL DÉPÔTS MENSUELS</p>
                      <p className="text-lg font-black text-[#10b981]">9 350 000 FCFA</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[9px]">
                        <span className="text-slate-400">Dîmes : 6 100 000 FCFA</span>
                        <span className="text-slate-400">Offrandes : 3 250 000 FCFA</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Patrimoine & Logistique preview */}
                {mod.id === "administration" && (
                  <div className="relative w-full max-w-xs space-y-2.5 z-10 text-xs font-semibold">
                    <div className="p-2.5 bg-[#121420] border border-white/5 rounded-xl shadow-xs flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold">Console Audio Behringer X32</p>
                        <p className="text-[8px] text-slate-500">Catégorie: Électronique & Son</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black">Actif</span>
                    </div>
                    <div className="p-2.5 bg-[#121420] border border-white/5 rounded-xl shadow-xs flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold">Projecteur Epson 4K Pro</p>
                        <p className="text-[8px] text-slate-500">Catégorie: Vidéo & Médias</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-black">Maintenance</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}

      </section>

      {/* Grades & Échelons Explainer Infographic (PRD_VH_Calavi.md SPECIFIC) */}
      <section id="hierarchie" className={`border-t py-24 md:py-32 relative z-10 transition-colors ${
        isDark ? "border-white/5 bg-[#0d0e15]/40" : "border-slate-200 bg-slate-150/40"
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#ec8001] block mb-3">GESTION HIERARCHIQUE</span>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Un Système de Grades & Échelons Inégalé
            </h2>
            <p className={`text-base font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Modélisez fidèlement le parcours d'engagement de vos leaders et l'étendue de leurs responsabilités pastorales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            
            {/* Grades block */}
            <div className={`rounded-2xl border p-6 md:p-8 shadow-md transition-colors ${
              isDark ? "glass border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-900"
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#06a7b5]/15 text-[#06a7b5] flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Les Grades Pastoraux</h3>
              </div>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Définit le niveau d'autorité, de maturité spirituelle et le cursus pastoral validé au sein de votre ministère.
              </p>
              
              <div className="space-y-3">
                {[
                  { name: "Pasteur Titulaire", level: "Niveau 6", active: true },
                  { name: "Pasteur Assistant", level: "Niveau 5" },
                  { name: "Assistant Pasteur", level: "Niveau 4" },
                  { name: "Gagneur d'âmes", level: "Niveau 3" },
                  { name: "Serviteur", level: "Niveau 2" },
                  { name: "Aspirant", level: "Niveau 1" }
                ].map((grade, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      grade.active 
                        ? isDark
                          ? "bg-[#06a7b5]/10 border-[#06a7b5]/25 text-white"
                          : "bg-[#06a7b5]/10 border-[#06a7b5]/30 text-slate-900"
                        : isDark
                        ? "bg-white/2 border-white/5 text-slate-350 hover:bg-white/5"
                        : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span className="font-bold text-xs">{grade.name}</span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${
                      grade.active 
                        ? isDark ? "bg-[#06a7b5] text-white" : "bg-[#06a7b5] text-white"
                        : "bg-slate-200/50 text-slate-500"
                    }`}>{grade.level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Échelons block */}
            <div className={`rounded-2xl border p-6 md:p-8 shadow-md transition-colors ${
              isDark ? "glass border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-900"
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#ec8001]/15 text-[#ec8001] flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Les Échelons d'Impact</h3>
              </div>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Mesure l'étendue des responsabilités pratiques et physiques (nombre de fidèles encadrés activement), peu importe le grade.
              </p>

              <div className="space-y-3">
                {[
                  { name: "GA C100", scope: "100 personnes et plus", active: true },
                  { name: "GA C50", scope: "Jusqu'à 50 personnes" },
                  { name: "C20", scope: "Jusqu'à 20 personnes" },
                  { name: "C10", scope: "Jusqu'à 10 personnes" },
                  { name: "C5", scope: "Jusqu'à 5 personnes" },
                  { name: "C2", scope: "2 personnes (bînome d'impact)" }
                ].map((echelon, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      echelon.active 
                        ? isDark
                          ? "bg-[#ec8001]/10 border-[#ec8001]/25 text-white"
                          : "bg-[#ec8001]/10 border-[#ec8001]/30 text-slate-900"
                        : isDark
                        ? "bg-white/2 border-white/5 text-slate-350 hover:bg-white/5"
                        : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span className="font-bold text-xs">{echelon.name}</span>
                    <span className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-800"}`}>{echelon.scope}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Pricing Section - 100% Gratuit */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-[#06a7b5] block mb-3">TARIFICATION</span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            ChurchFlow est 100% Gratuit
          </h2>
          <p className={`text-base font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            Pas de plans, pas de niveaux. Un seul accès complet à toutes les fonctionnalités, pour toutes les églises, sans aucune condition.
          </p>
        </div>

        {/* Single Unified Free Card */}
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-3xl border-2 p-10 md:p-14 relative overflow-hidden shadow-2xl ${
            isDark 
              ? "bg-[#0d0e15]/95 border-[#06a7b5] shadow-[0_0_80px_rgba(6,167,181,0.12)]" 
              : "bg-white border-[#06a7b5] shadow-[0_0_60px_rgba(6,167,181,0.08)]"
          }`}>

            {/* Glow backdrop */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#06a7b5] opacity-[0.04] blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#ec8001] opacity-[0.03] blur-[80px] pointer-events-none" />

            {/* Badge */}
            <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-[#06a7b5] text-white text-[10px] font-black uppercase tracking-widest shadow-md">
              ACCÈS COMPLET OFFERT
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              
              {/* Left — Big Price + CTA */}
              <div>
                <div className="flex items-end gap-3 mb-3">
                  <span className={`text-7xl md:text-8xl font-black leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
                    0
                  </span>
                  <div className="mb-2">
                    <span className="text-2xl font-black text-[#06a7b5]">FCFA</span>
                  </div>
                </div>

                <p className={`text-base font-semibold leading-relaxed mb-8 ${isDark ? "text-slate-400" : "text-slate-800"}`}>
                  Aucune carte bancaire. Aucun engagement. Aucune limite cachée. ChurchFlow met l'ensemble de ses fonctionnalités à la disposition de toutes les communautés chrétiennes gratuitement.
                </p>

                <a
                  href="https://churchflow-indol.vercel.app/login"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-[#06a7b5] hover:bg-[#006c69] transition-all shadow-[0_0_30px_rgba(6,167,181,0.3)] hover:shadow-[0_0_40px_rgba(6,167,181,0.45)] active:scale-98"
                >
                  <span>Accéder</span>
                  <ArrowRight className="w-5 h-5" />
                </a>

                <p className={`text-xs font-semibold mt-4 ${isDark ? "text-slate-500" : "text-slate-700"}`}>
                  Connexion instantanée. Aucune installation requise.
                </p>
              </div>

              {/* Right — Feature list */}
              <div>
                <p className={`text-xs font-black uppercase tracking-widest mb-5 ${isDark ? "text-slate-400" : "text-slate-800"}`}>
                  Tout inclus, sans exception
                </p>
                <ul className="space-y-3.5">
                  {[
                    "Membres, grades & échelons illimités",
                    "GEM, Tribus et cellules locales illimités",
                    "Formations, cursus PDV & École des Bergers",
                    "Réunions, cultes & agenda complet",
                    "Comptabilité, dîmes & offrandes (FCFA)",
                    "Patrimoine, logistique & prestataires",
                    "Permissions RBAC & rôles configurables",
                    "Interface light & dark mode premium",
                    "Support communautaire inclus",
                  ].map((item, idx) => (
                    <li key={idx} className={`flex items-center gap-3 text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                      <div className="w-5 h-5 rounded-full bg-[#06a7b5]/15 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#06a7b5]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Trust line below card */}
          <p className={`text-center text-xs font-semibold mt-8 ${isDark ? "text-slate-500" : "text-slate-600"}`}>
            ChurchFlow est développé avec ❤️ pour les communautés chrétiennes du Bénin et d'Afrique.
          </p>
        </div>

      </section>


      {/* Interactive FAQs Section */}
      <section id="faq" className={`border-t py-24 md:py-32 relative z-10 transition-colors ${
        isDark ? "border-white/5 bg-[#090a0f]" : "border-slate-200 bg-slate-100"
      }`}>
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#06a7b5] block mb-3">FAQ - FOIRE AUX QUESTIONS</span>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Questions Fréquentes
            </h2>
          </div>

          {/* List */}
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                    isDark ? "glass border-white/5" : "bg-white border-slate-200 shadow-xs text-slate-800"
                  }`}
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className={`w-full px-6 py-5 text-left flex items-center justify-between font-bold text-sm hover:text-[#06a7b5] transition-colors ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? "rotate-180 text-[#06a7b5]" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className={`px-6 pb-5 pt-1 border-t text-xs font-medium leading-relaxed ${
                      isDark ? "border-white/5 text-slate-400" : "border-slate-150 text-slate-600"
                    }`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Hero CTA Section */}
      <section className={`relative py-24 md:py-32 z-10 border-t ${isDark ? "border-white/5" : "border-slate-200 bg-slate-50"}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#06a7b5] opacity-5 blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Prêt à Transformer la Gestion de votre Église ?
          </h2>
          <p className={`max-w-2xl mx-auto text-base font-semibold leading-relaxed mb-10 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Rejoignez dès aujourd'hui les pasteurs et bergers de GEM qui font confiance à ChurchFlow pour piloter leur communauté locale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#pricing" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-white bg-[#06a7b5] hover:bg-[#006c69] active:scale-98 transition-all shadow-[0_0_30px_rgba(6,167,181,0.25)] flex items-center justify-center space-x-2"
            >
              <span>Créer un Compte Gratuit</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="mailto:support@churchflow.com" 
              className={`w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold active:scale-98 transition-all block border ${
                isDark 
                  ? "text-slate-350 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white" 
                  : "text-slate-700 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Planifier un appel de démonstration
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`mt-auto border-t py-12 relative z-10 ${isDark ? "border-white/5 bg-[#07080d]" : "border-slate-200 bg-slate-100"}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#06a7b5] to-[#006c69] flex items-center justify-center">
              <span className="text-xs font-black text-white">CF</span>
            </div>
            <span className={`font-bold text-sm tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>
              ChurchFlow &copy; {new Date().getFullYear()}. Tous droits réservés.
            </span>
          </div>

          {/* Right info Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-semibold">
            <a href="#" className="hover:text-slate-300 transition-colors">Politique de Confidentialité</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Conditions Générales de Vente (CGV)</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>

        </div>
      </footer>

    </div>
  );
}

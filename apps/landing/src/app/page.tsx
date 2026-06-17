"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Network, GraduationCap, CalendarDays,
  Wallet, Package, ArrowRight, CheckCircle2, ChevronDown,
  Menu, X, Play, UserCheck, Star, Check, TrendingUp, Sliders,
  Sun, Moon, Shield, Zap, Globe, Lock
} from "lucide-react";

export default function LandingPage() {
  const [theme, setTheme] = useState<"LIGHT" | "DARK">("LIGHT");
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("membres");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("landing-theme") as "LIGHT" | "DARK";
    if (savedTheme === "DARK" || savedTheme === "LIGHT") setTheme(savedTheme);
    else setTheme("LIGHT");
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "LIGHT" ? "DARK" : "LIGHT";
    setTheme(nextTheme);
    localStorage.setItem("landing-theme", nextTheme);
  };

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
        "GEM (Groupes d'Évangélisation et de Mission) : cellules locales de croissance spirituelle."
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
      desc: "Planifiez et analysez la présence à toutes les rencontres officielles de l'église.",
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

  const features = [
    { icon: <Users className="w-5 h-5" />, color: "#006C69", title: "Membres & Hiérarchie", desc: "Grades, Échelons, statuts et parcours pastoraux." },
    { icon: <Network className="w-5 h-5" />, color: "#EC8001", title: "Groupes & GEMs", desc: "Tribus, Départements et cellules locales." },
    { icon: <GraduationCap className="w-5 h-5" />, color: "#CEAD1E", title: "Formations & Écoles", desc: "PDV, École des Bergers, cursus de croissance." },
    { icon: <CalendarDays className="w-5 h-5" />, color: "#8B5CF6", title: "Réunions & Agenda", desc: "Cultes, Agapés, présences et suivi d'assiduité." },
    { icon: <Wallet className="w-5 h-5" />, color: "#10B981", title: "Comptabilité & Finances", desc: "Dîmes, offrandes, rapports et transparence FCFA." },
    { icon: <Package className="w-5 h-5" />, color: "#B1C431", title: "Patrimoine & Logistique", desc: "Inventaire matériel, prestataires et achats." },
    { icon: <Shield className="w-5 h-5" />, color: "#527EDB", title: "Permissions RBAC", desc: "Rôles configurables et contrôle d'accès granulaire." },
    { icon: <Zap className="w-5 h-5" />, color: "#06A7B5", title: "Interface Premium", desc: "Design Metronic, mode clair & sombre inclus." },
    { icon: <Globe className="w-5 h-5" />, color: "#006C69", title: "Multi-Tenant", desc: "Chaque église dispose de son espace isolé et sécurisé." },
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
    },
    {
      q: "ChurchFlow est-il vraiment gratuit ? Y a-t-il des coûts cachés ?",
      a: "Oui, ChurchFlow est 100% gratuit et le restera. Aucune carte bancaire requise, aucun abonnement, aucun coût caché. Notre mission est de rendre les outils de pilotage d'église accessibles à toutes les communautés chrétiennes, en particulier celles d'Afrique."
    }
  ];

  const isDark = theme === "DARK";

  return (
    <div className={`relative min-h-screen flex flex-col overflow-hidden transition-colors duration-300 ${
      isDark ? "bg-[#090a0f] text-slate-100" : "bg-white text-slate-900"
    }`}>

      {/* Ambient background glows */}
      <div className={`absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[180px] pointer-events-none transition-opacity ${
        isDark ? "bg-[#06a7b5] opacity-[0.07]" : "bg-[#06a7b5] opacity-[0.04]"
      }`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-opacity ${
        isDark ? "bg-[#ec8001] opacity-[0.05]" : "bg-[#ec8001] opacity-[0.03]"
      }`} />

      {/* ===== HEADER ===== */}
      <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isDark ? "border-white/5 bg-[#090a0f]/90 backdrop-blur-xl" : "border-slate-200/80 bg-white/90 backdrop-blur-xl"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center space-x-3 group shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06a7b5] to-[#006c69] shadow-md group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-white text-base">CF</span>
            </div>
            <span className={`font-black text-xl tracking-tight transition-opacity group-hover:opacity-80 ${isDark ? "text-white" : "text-slate-900"}`}>
              ChurchFlow<span className="text-[#06a7b5]">.SaaS</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-1">
            <nav className="flex items-center">
              {[
                { label: "Fonctionnalités", href: "#features" },
                { label: "Grades & Échelons", href: "#hierarchie" },
                { label: "Tout Inclus", href: "#acces" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-3 pl-4 ml-2 border-l border-slate-200/50 dark:border-white/5">
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
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isDark
                    ? "bg-[#06a7b5] text-white hover:bg-[#006c69] shadow-[0_0_20px_rgba(6,167,181,0.2)]"
                    : "bg-[#006c69] text-white hover:bg-[#006c69]/90 shadow-sm"
                }`}
              >
                Démarrer
              </a>
            </div>

            <button
              onClick={toggleTheme}
              className={`ml-2 p-2 rounded-xl transition-all cursor-pointer ${
                isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title={isDark ? "Mode Clair" : "Mode Sombre"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all ${
                isDark ? "bg-[#161824] border-white/5 text-amber-400" : "bg-slate-100 border-slate-200 text-slate-600"
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

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className={`fixed inset-x-0 top-20 z-40 md:hidden border-b p-6 shadow-2xl ${
          isDark ? "border-white/5 bg-[#0d0e15]" : "border-slate-200 bg-white"
        }`}>
          <nav className="flex flex-col space-y-1">
            {[
              { label: "Fonctionnalités", href: "#features" },
              { label: "Grades & Échelons", href: "#hierarchie" },
              { label: "Tout Inclus", href: "#acces" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-4 rounded-xl text-base font-semibold transition-colors ${
                  isDark ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5 flex flex-col space-y-3">
            <a
              href="https://churchflow-indol.vercel.app/login"
              className={`w-full text-center py-3 rounded-xl border font-semibold text-sm ${
                isDark ? "border-white/10 text-slate-300 bg-white/5" : "border-slate-200 text-slate-700 bg-slate-50"
              }`}
            >
              Connexion
            </a>
            <a
              href="https://churchflow-indol.vercel.app/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-[#06a7b5] text-white font-bold text-sm"
            >
              Démarrer — C'est gratuit
            </a>
          </div>
        </div>
      )}

      {/* ===== HERO ===== */}
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-20 pb-28 md:pt-28 md:pb-36 text-center relative z-10">

        {/* Live badge */}
        <div className={`inline-flex items-center space-x-2.5 px-4 py-2 rounded-full border mb-8 ${
          isDark ? "border-[#06a7b5]/20 bg-[#06a7b5]/5" : "border-[#06a7b5]/25 bg-[#06a7b5]/8"
        }`}>
          <span className="flex w-2 h-2 rounded-full bg-[#06a7b5] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#06a7b5]">100% Gratuit · Disponible Maintenant</span>
        </div>

        {/* Headline */}
        <h1 className={`max-w-5xl mx-auto text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 ${
          isDark ? "text-white" : "text-slate-900"
        }`}>
          Pilotez la Croissance de{" "}
          <span className="relative inline-block">
            <span className="text-gradient-primary">votre Église</span>
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#06a7b5] to-[#006c69] rounded-full opacity-40" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className={`max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-10 ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}>
          La plateforme SaaS tout-en-un pour gérer vos membres, tribus, GEMs, formations, réunions et finances — avec un design premium Metronic.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a
            href="https://churchflow-indol.vercel.app/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-white bg-[#06a7b5] hover:bg-[#006c69] transition-all shadow-[0_0_40px_rgba(6,167,181,0.35)] flex items-center justify-center space-x-2 active:scale-[0.98]"
          >
            <span>Démarrer — C'est gratuit</span>
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#features"
            className={`w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center space-x-2 border active:scale-[0.98] ${
              isDark
                ? "text-slate-300 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                : "text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
            }`}
          >
            <Play className={`w-4 h-4 ${isDark ? "fill-slate-300 text-transparent" : "fill-slate-700 text-transparent"}`} />
            <span>Voir les fonctionnalités</span>
          </a>
        </div>

        {/* Dashboard mockup */}
        <div className={`relative max-w-6xl mx-auto rounded-2xl border p-3 transition-all ${
          isDark
            ? "border-white/8 bg-[#0d0e16]/90 shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
            : "border-slate-200 bg-slate-100 shadow-[0_30px_80px_rgba(0,0,0,0.08)]"
        }`}>
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#06a7b5] to-transparent blur-sm opacity-60" />

          {/* Window bar */}
          <div className={`flex items-center space-x-2 px-3 pb-3 border-b ${isDark ? "border-white/5" : "border-slate-200"}`}>
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider ml-4 uppercase">ChurchFlow Admin — Portail VH Calavi</span>
          </div>

          {/* Dashboard inner */}
          <div className="flex h-[480px] bg-[#090a0f] rounded-xl overflow-hidden text-left text-xs text-slate-400">

            {/* Sidebar mock */}
            <aside className="w-48 bg-[#151521] border-r border-[#1f1f2e] p-3 flex flex-col justify-between shrink-0">
              <div>
                <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#1f1f2e]">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#06a7b5] to-[#006c69] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-white">CF</span>
                  </div>
                  <span className="font-extrabold text-[11px] text-white">ChurchFlow</span>
                </div>
                <div className="space-y-1">
                  {[
                    { label: "Tableau de Bord", icon: <LayoutDashboard className="w-4 h-4 shrink-0" />, color: "#06a7b5", active: true },
                    { label: "Membres", icon: <Users className="w-4 h-4 shrink-0" />, color: "#006C69" },
                    { label: "Groupes & GEM", icon: <Network className="w-4 h-4 shrink-0" />, color: "#EC8001" },
                    { label: "Formations", icon: <GraduationCap className="w-4 h-4 shrink-0" />, color: "#CEAD1E" },
                    { label: "Réunions", icon: <CalendarDays className="w-4 h-4 shrink-0" />, color: "#8B5CF6" },
                    { label: "Finances", icon: <Wallet className="w-4 h-4 shrink-0" />, color: "#10B981" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors ${
                      item.active ? "bg-[#06a7b5]/10 border border-[#06a7b5]/20 text-[#06a7b5]" : "hover:bg-white/5 hover:text-white"
                    }`}>
                      <span style={{ color: item.active ? "#06a7b5" : item.color }}>{item.icon}</span>
                      <span className={item.active ? "font-bold" : "font-medium"}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-[#1f1f2e] pt-3 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400">MODE SOMBRE</span>
                <div className="w-6 h-6 rounded-md bg-[#1e1e2d] border border-[#2b2b40] flex items-center justify-center text-amber-400">
                  <Play className="w-2.5 h-2.5 rotate-[270deg] fill-amber-400 text-transparent" />
                </div>
              </div>
            </aside>

            {/* Content mock */}
            <div className="flex-1 flex flex-col bg-[#090a0f] overflow-hidden">
              <header className="h-12 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-[#0d0e15]/50">
                <span className="font-bold text-white text-[11px]">Portail VH Calavi — Tableau de Bord Global</span>
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#06a7b5]">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
              </header>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "MEMBRES TOTAL", value: "1 240", sub: "+12% ce mois", subColor: "text-emerald-500", icon: <TrendingUp className="w-2.5 h-2.5 mr-0.5 shrink-0" /> },
                    { label: "GEM ACTIFS", value: "42", sub: "6 Équipes Tribales", subColor: "text-[#ec8001]" },
                    { label: "EN FORMATION", value: "88", sub: "École des bergers", subColor: "text-[#cead1e]" },
                    { label: "DÎMES & OFFRANDES", value: "+24%", sub: "Trésorerie saine", subColor: "text-slate-500", valueColor: "text-[#10b981]" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#121420] border border-white/5 rounded-xl p-3">
                      <span className="text-[9px] text-slate-500 font-bold block mb-1">{stat.label}</span>
                      <span className={`text-sm font-extrabold ${stat.valueColor || "text-white"}`}>{stat.value}</span>
                      <span className={`text-[8px] font-bold flex items-center mt-1 ${stat.subColor}`}>
                        {stat.icon}{stat.sub}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-[#121420] border border-white/5 rounded-xl p-3 flex flex-col">
                    <div>
                      <span className="text-[10px] font-bold text-white block mb-0.5">Croissance mensuelle de l'Audience</span>
                      <span className="text-[8px] text-slate-500 font-semibold">Inscriptions directes aux cultes</span>
                    </div>
                    <div className="h-28 w-full relative mt-3">
                      <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06a7b5" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#06a7b5" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M 0 90 Q 50 60 100 75 T 200 40 T 300 10 L 300 100 L 0 100 Z" fill="url(#g1)" />
                        <path d="M 0 90 Q 50 60 100 75 T 200 40 T 300 10" fill="none" stroke="#06a7b5" strokeWidth="2.5" />
                        <circle cx="100" cy="75" r="3.5" fill="#06a7b5" stroke="#121420" strokeWidth="1.5" />
                        <circle cx="200" cy="40" r="3.5" fill="#06a7b5" stroke="#121420" strokeWidth="1.5" />
                        <circle cx="300" cy="10" r="3.5" fill="#fff" stroke="#06a7b5" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-[#121420] border border-white/5 rounded-xl p-3 flex flex-col">
                    <span className="text-[10px] font-bold text-white block mb-2">Activités Récentes GEM</span>
                    <div className="space-y-2 flex-1">
                      {[
                        { dot: "#06a7b5", label: "GEM VH Calavi Centre", sub: "12 Présences enregistrées" },
                        { dot: "#ec8001", label: "GEM PDV Ouidah", sub: "Nouveau baptisé enregistré" },
                        { dot: "#cead1e", label: "Académie de croissance", sub: "Session pastorale clôturée" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center space-x-2 py-1 border-b border-white/5 last:border-0">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.dot }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-350 truncate">{item.label}</p>
                            <p className="text-[8px] text-slate-500 font-medium">{item.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== METRICS BAR ===== */}
      <section className={`border-t border-b py-14 relative z-10 transition-colors ${
        isDark ? "border-white/5 bg-[#0d0e15]/60" : "border-slate-200 bg-slate-50"
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "99.99%", label: "Taux de Disponibilité", color: isDark ? "text-white" : "text-slate-900" },
            { value: "50 000+", label: "Membres Actifs Gérés", color: "text-[#06a7b5]" },
            { value: "180+", label: "Églises & GEM Déployés", color: "text-[#ec8001]" },
            { value: "0 FCFA", label: "Pour Toujours Gratuit", color: "text-[#10B981]" },
          ].map((stat, i) => (
            <div key={i}>
              <p className={`text-3xl md:text-4xl font-extrabold mb-2 ${stat.color}`}>{stat.value}</p>
              <p className={`text-xs md:text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MODULES (FEATURES) ===== */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-[#06a7b5] block mb-3">MODULES MÉTIERS</span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            Tout ce dont votre Église a Besoin
          </h2>
          <p className={`text-base font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            De la hiérarchie pastorale à la comptabilité, chaque aspect de votre communauté est structuré de manière optimale.
          </p>
        </div>

        {/* Tab grid */}
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
                      ? "bg-[#121420] border-[#06a7b5]/60 text-white shadow-[0_0_24px_rgba(6,167,181,0.15)]"
                      : "bg-white border-[#06a7b5] text-[#06a7b5] shadow-[0_8px_24px_rgba(6,167,181,0.1)]"
                    : isDark
                    ? "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-white"
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span className="mb-2.5" style={{ color: isSelected ? "#06a7b5" : mod.color }}>
                  {mod.icon}
                </span>
                <span className="text-xs font-bold tracking-tight block truncate w-full">{mod.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab detail card */}
        {modules.map((mod) => {
          if (mod.id !== activeTab) return null;
          return (
            <div
              key={mod.id}
              className={`rounded-2xl border p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center shadow-lg ${
                isDark ? "bg-[#0d0e15] border-white/8 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
                >
                  {mod.icon}
                </div>
                <h3 className={`text-2xl md:text-3xl font-black mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>{mod.title}</h3>
                <p className={`text-base font-medium leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{mod.desc}</p>
                <ul className="space-y-3.5">
                  {mod.bullets.map((bullet, idx) => (
                    <li key={idx} className={`flex items-start space-x-3 text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      <CheckCircle2 className="w-5 h-5 text-[#06a7b5] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`border rounded-2xl p-6 relative overflow-hidden h-[300px] flex items-center justify-center ${
                isDark ? "bg-[#090a0f] border-white/5" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-10" style={{ backgroundColor: mod.color }} />

                {mod.id === "membres" && (
                  <div className="relative w-full max-w-sm space-y-3.5 z-10 text-xs font-semibold">
                    <div className="p-3 bg-[#121420] border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#006c69]/20 border border-[#006c69]/30 flex items-center justify-center text-[#006c69] font-bold">PO</div>
                        <div>
                          <p className="text-white font-bold">Dr. Paul OBIANG</p>
                          <p className="text-[9px] text-[#006c69] uppercase font-extrabold">Statut: Responsable</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-[#06a7b5]/10 text-[#06a7b5] text-[9px] font-black uppercase">PASTEUR TITULAIRE</span>
                    </div>
                    <div className="flex items-center justify-center text-slate-600"><ChevronDown className="w-4 h-4" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#121420] border border-white/5 rounded-xl text-center">
                        <span className="text-[9px] text-slate-500 font-bold block mb-1">GRADE PASTORAL</span>
                        <span className="text-white font-extrabold">Aspirant → Pasteur</span>
                      </div>
                      <div className="p-3 bg-[#121420] border border-white/5 rounded-xl text-center">
                        <span className="text-[9px] text-slate-500 font-bold block mb-1">ÉCHELON</span>
                        <span className="text-white font-extrabold">GA C100 (+100p)</span>
                      </div>
                    </div>
                  </div>
                )}

                {mod.id === "groupes" && (
                  <div className="relative w-full max-w-xs z-10 text-xs font-semibold">
                    <div className="p-3 bg-[#121420] border border-white/5 rounded-xl text-center mb-3">
                      <p className="text-[9px] text-[#ec8001] font-extrabold uppercase mb-1">Structure Régionale</p>
                      <p className="text-white font-bold">Tribu du Sud (VH Calavi)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 pl-6 relative">
                      <div className="absolute left-2.5 top-0 bottom-6 w-0.5 bg-white/5" />
                      {["GEM Calavi 1 — 12p", "GEM Ouidah 2 — 8p"].map((g, i) => (
                        <div key={i} className="p-2 bg-[#121420] border border-white/5 rounded-lg flex items-center justify-between">
                          <span className="text-white font-bold truncate text-[10px]">{g.split(" —")[0]}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black">{g.split("— ")[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mod.id === "formations" && (
                  <div className="relative w-full max-w-xs space-y-3 z-10 text-xs font-semibold">
                    <div className="p-3 bg-[#121420] border border-white/5 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white font-bold">École des Bergers</span>
                        <span className="text-[#cead1e] font-bold text-[9px]">Promo 4 — En cours</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mt-1.5">
                        <div className="w-3/4 h-full bg-[#cead1e] rounded-full" />
                      </div>
                      <p className="text-[8px] text-slate-500 font-semibold mt-1">75% complété · 12 étudiants</p>
                    </div>
                    <div className="p-3 bg-[#121420] border border-white/5 rounded-xl flex justify-between items-center">
                      <span className="text-white font-bold">Porteurs de Vie (PDV)</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black">Session Active</span>
                    </div>
                  </div>
                )}

                {mod.id === "reunions" && (
                  <div className="relative w-full max-w-xs space-y-2 z-10 text-xs font-semibold">
                    {[
                      { dot: "#8B5CF6", title: "Culte d'Adoration Principal", sub: "Chaque Dimanche à 08:30", tag: "Culte" },
                      { dot: "#ec8001", title: "Agapé Fraternel de Tribu", sub: "Mardi Prochain à 19:00", tag: "Rencontre" },
                    ].map((r, i) => (
                      <div key={i} className="p-2.5 bg-[#121420] border border-white/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.dot }} />
                          <div>
                            <p className="text-white font-bold">{r.title}</p>
                            <p className="text-[8px] text-slate-500">{r.sub}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-white text-[8px] font-bold">{r.tag}</span>
                      </div>
                    ))}
                  </div>
                )}

                {mod.id === "finances" && (
                  <div className="relative w-full max-w-xs space-y-2 z-10 text-xs font-semibold">
                    <div className="p-3 bg-[#121420] border border-white/5 rounded-xl">
                      <p className="text-[9px] text-slate-500 font-bold mb-1">TOTAL DÉPÔTS MENSUELS</p>
                      <p className="text-lg font-black text-[#10b981]">9 350 000 FCFA</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[9px] text-slate-400">
                        <span>Dîmes : 6 100 000</span>
                        <span>Offrandes : 3 250 000</span>
                      </div>
                    </div>
                  </div>
                )}

                {mod.id === "administration" && (
                  <div className="relative w-full max-w-xs space-y-2.5 z-10 text-xs font-semibold">
                    {[
                      { title: "Console Audio Behringer X32", sub: "Électronique & Son", badge: "Actif", badgeColor: "bg-emerald-500/10 text-emerald-400" },
                      { title: "Projecteur Epson 4K Pro", sub: "Vidéo & Médias", badge: "Maintenance", badgeColor: "bg-amber-500/10 text-amber-400" },
                    ].map((item, i) => (
                      <div key={i} className="p-2.5 bg-[#121420] border border-white/5 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-white font-bold">{item.title}</p>
                          <p className="text-[8px] text-slate-500">{item.sub}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${item.badgeColor}`}>{item.badge}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* ===== GRADES & ÉCHELONS ===== */}
      <section id="hierarchie" className={`border-t py-24 md:py-32 relative z-10 transition-colors ${
        isDark ? "border-white/5 bg-[#0d0e15]/50" : "border-slate-200 bg-slate-50"
      }`}>
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#ec8001] block mb-3">GESTION HIÉRARCHIQUE</span>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Un Système Grades & Échelons Inégalé
            </h2>
            <p className={`text-base font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Modélisez fidèlement le parcours d'engagement de vos leaders et l'étendue de leurs responsabilités pastorales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Grades */}
            <div className={`rounded-2xl border p-6 md:p-8 ${isDark ? "bg-[#0d0e15] border-white/8" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#06a7b5]/12 text-[#06a7b5] flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Les Grades Pastoraux</h3>
              </div>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Définit le niveau d'autorité, de maturité spirituelle et le cursus pastoral validé au sein du ministère.
              </p>
              <div className="space-y-2.5">
                {[
                  { name: "Pasteur Titulaire", level: "Niveau 6", active: true },
                  { name: "Pasteur Assistant", level: "Niveau 5" },
                  { name: "Assistant Pasteur", level: "Niveau 4" },
                  { name: "Gagneur d'âmes", level: "Niveau 3" },
                  { name: "Serviteur", level: "Niveau 2" },
                  { name: "Aspirant", level: "Niveau 1" },
                ].map((grade, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    grade.active
                      ? "bg-[#06a7b5]/8 border-[#06a7b5]/25"
                      : isDark ? "bg-white/[0.02] border-white/5 hover:bg-white/5" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}>
                    <span className={`font-bold text-xs ${grade.active ? "text-[#06a7b5]" : isDark ? "text-slate-300" : "text-slate-700"}`}>{grade.name}</span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${
                      grade.active ? "bg-[#06a7b5] text-white" : isDark ? "bg-white/5 text-slate-500" : "bg-slate-200 text-slate-500"
                    }`}>{grade.level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Échelons */}
            <div className={`rounded-2xl border p-6 md:p-8 ${isDark ? "bg-[#0d0e15] border-white/8" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#ec8001]/12 text-[#ec8001] flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Les Échelons d'Impact</h3>
              </div>
              <p className={`text-sm font-medium leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Mesure l'étendue des responsabilités pratiques et le nombre de fidèles encadrés activement.
              </p>
              <div className="space-y-2.5">
                {[
                  { name: "GA C100", scope: "100 personnes et plus", active: true },
                  { name: "GA C50", scope: "Jusqu'à 50 personnes" },
                  { name: "C20", scope: "Jusqu'à 20 personnes" },
                  { name: "C10", scope: "Jusqu'à 10 personnes" },
                  { name: "C5", scope: "Jusqu'à 5 personnes" },
                  { name: "C2", scope: "2 personnes (binôme d'impact)" },
                ].map((echelon, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    echelon.active
                      ? "bg-[#ec8001]/8 border-[#ec8001]/25"
                      : isDark ? "bg-white/[0.02] border-white/5 hover:bg-white/5" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}>
                    <span className={`font-bold text-xs ${echelon.active ? "text-[#ec8001]" : isDark ? "text-slate-300" : "text-slate-700"}`}>{echelon.name}</span>
                    <span className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>{echelon.scope}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOUT INCLUS · ACCÈS GRATUIT ===== */}
      <section id="acces" className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border mb-6 ${
            isDark ? "border-[#10B981]/20 bg-[#10B981]/5" : "border-[#10B981]/25 bg-[#10B981]/8"
          }`}>
            <Lock className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#10B981]">Aucune carte bancaire requise</span>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-[#06a7b5] block mb-3">TOUT INCLUS · SANS FRAIS</span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            Toutes les Fonctionnalités,{" "}
            <span className="text-[#10B981]">Pour Toujours Gratuit</span>
          </h2>
          <p className={`text-base font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            ChurchFlow est développé pour les communautés chrétiennes d'Afrique. Pas de plan, pas de niveaux, pas de coûts cachés. Un accès complet à tout, pour toujours.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {features.map((feat, idx) => (
            <div key={idx} className={`rounded-2xl border p-6 transition-all hover:scale-[1.01] ${
              isDark
                ? "bg-[#0d0e15] border-white/8 hover:border-white/15"
                : "bg-white border-slate-200 shadow-sm hover:shadow-md"
            }`}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${feat.color}12`, color: feat.color }}>
                {feat.icon}
              </div>
              <div className="flex items-start justify-between mb-2">
                <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{feat.title}</h3>
                <div className="w-5 h-5 rounded-full bg-[#10B981]/12 flex items-center justify-center shrink-0 ml-2 mt-0.5">
                  <Check className="w-3 h-3 text-[#10B981]" />
                </div>
              </div>
              <p className={`text-xs font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Free CTA block */}
        <div className={`rounded-3xl border-2 p-10 md:p-14 relative overflow-hidden text-center ${
          isDark
            ? "bg-[#0d0e15] border-[#06a7b5]/30 shadow-[0_0_80px_rgba(6,167,181,0.08)]"
            : "bg-gradient-to-br from-[#06a7b5]/5 to-[#006c69]/5 border-[#06a7b5]/20"
        }`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#06a7b5] opacity-[0.04] blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 mx-auto ${
              isDark ? "bg-[#06a7b5]/10 border border-[#06a7b5]/20" : "bg-[#06a7b5]/10"
            }`}>
              <span className={`text-4xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>0</span>
              <span className="text-lg font-black text-[#06a7b5] mt-2">FCFA</span>
            </div>
            <h3 className={`text-2xl md:text-3xl font-black mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Accès Complet — Maintenant et Pour Toujours
            </h3>
            <p className={`max-w-xl mx-auto text-base font-semibold mb-8 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Aucune carte bancaire. Aucun engagement. Aucune limite cachée. Rejoignez les centaines d'églises qui font confiance à ChurchFlow.
            </p>
            <a
              href="https://churchflow-indol.vercel.app/login"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-extrabold text-white bg-[#06a7b5] hover:bg-[#006c69] transition-all shadow-[0_0_40px_rgba(6,167,181,0.3)] hover:shadow-[0_0_50px_rgba(6,167,181,0.4)] active:scale-[0.98]"
            >
              <span>Accéder — C'est Gratuit</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className={`text-xs font-semibold mt-5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Connexion instantanée · Aucune installation requise · Données sécurisées et chiffrées
            </p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className={`border-t py-24 md:py-32 relative z-10 transition-colors ${
        isDark ? "border-white/5 bg-[#090a0f]" : "border-slate-200 bg-slate-50"
      }`}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#06a7b5] block mb-3">FAQ</span>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Questions Fréquentes
            </h2>
            <p className={`text-base font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Tout ce que vous devez savoir sur ChurchFlow.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    isDark
                      ? isExpanded ? "bg-[#0d0e15] border-[#06a7b5]/20" : "bg-[#0d0e15] border-white/5"
                      : isExpanded ? "bg-white border-[#06a7b5]/30 shadow-sm" : "bg-white border-slate-200 shadow-xs"
                  }`}
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className={`w-full px-6 py-5 text-left flex items-center justify-between font-bold text-sm transition-colors ${
                      isDark ? "text-white hover:text-[#06a7b5]" : "text-slate-900 hover:text-[#06a7b5]"
                    }`}
                  >
                    <span className="pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-180 text-[#06a7b5]" : "text-slate-400"}`} />
                  </button>
                  {isExpanded && (
                    <div className={`px-6 pb-5 border-t text-sm font-medium leading-relaxed ${
                      isDark ? "border-white/5 text-slate-400" : "border-slate-100 text-slate-600"
                    }`}>
                      <div className="pt-4">{faq.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className={`relative py-24 md:py-32 z-10 border-t overflow-hidden ${isDark ? "border-white/5 bg-[#090a0f]" : "border-slate-200 bg-white"}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#06a7b5] opacity-[0.05] blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#06a7b5] block mb-4">REJOIGNEZ LA COMMUNAUTÉ</span>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
            Prêt à Transformer la Gestion de votre Église ?
          </h2>
          <p className={`max-w-2xl mx-auto text-base font-semibold leading-relaxed mb-10 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Rejoignez dès aujourd'hui les pasteurs et bergers de GEM qui font confiance à ChurchFlow pour piloter leur communauté — gratuitement, sans aucune limite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://churchflow-indol.vercel.app/login"
              className="w-full sm:w-auto px-10 py-4 rounded-xl text-base font-extrabold text-white bg-[#06a7b5] hover:bg-[#006c69] transition-all shadow-[0_0_40px_rgba(6,167,181,0.25)] flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>Créer un Compte Gratuit</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="mailto:contact@churchflow.app"
              className={`w-full sm:w-auto px-10 py-4 rounded-xl text-base font-bold transition-all border active:scale-[0.98] ${
                isDark
                  ? "text-slate-300 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                  : "text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
              }`}
            >
              Contacter l'équipe
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={`border-t py-12 relative z-10 ${isDark ? "border-white/5 bg-[#07080d]" : "border-slate-200 bg-slate-50"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#06a7b5] to-[#006c69] flex items-center justify-center">
                <span className="text-xs font-black text-white">CF</span>
              </div>
              <div>
                <span className={`font-black text-base tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  ChurchFlow<span className="text-[#06a7b5]">.SaaS</span>
                </span>
                <p className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  Développé pour les Communautés Chrétiennes d'Afrique
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold">
              {[
                { label: "Fonctionnalités", href: "#features" },
                { label: "Grades & Échelons", href: "#hierarchie" },
                { label: "Tout Inclus", href: "#acces" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <a key={link.href} href={link.href} className={`transition-colors ${isDark ? "text-slate-500 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className={`border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold ${isDark ? "border-white/5 text-slate-600" : "border-slate-200 text-slate-400"}`}>
            <span>© {new Date().getFullYear()} ChurchFlow. Tous droits réservés.</span>
            <div className="flex gap-6">
              <a href="#" className={`transition-colors ${isDark ? "hover:text-slate-300" : "hover:text-slate-700"}`}>Politique de Confidentialité</a>
              <a href="#" className={`transition-colors ${isDark ? "hover:text-slate-300" : "hover:text-slate-700"}`}>Conditions d'Utilisation</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

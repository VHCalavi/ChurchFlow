"use client";

import React, { useState } from "react";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { 
  User, 
  Settings, 
  ShieldAlert, 
  MapPin, 
  Mail, 
  Building2, 
  Clock, 
  Laptop, 
  Smartphone,
  Save,
  Eye,
  EyeOff,
  Zap,
  Award,
  Globe,
  Activity,
  MessageSquare
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "SETTINGS" | "SECURITY">("OVERVIEW");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Profile data states
  const [name, setName] = useState("Dr. Paul OBIANG");
  const [email, setEmail] = useState("admin@churchflow.com");
  const [phone, setPhone] = useState("+229 97 11 22 33 44");
  const [role, setRole] = useState("Pasteur Principal / Fondateur");
  const [church, setChurch] = useState("Vases d'Honneur Calavi (VHAIDC)");
  const [language, setLanguage] = useState("Français (FR)");


  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification("Profil mis à jour avec succès !", "success");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification("Veuillez renseigner tous les champs.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification("Le nouveau mot de passe et sa confirmation ne correspondent pas.", "error");
      return;
    }
    showNotification("Mot de passe mis à jour !", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <DashboardLayout title="Mon Profil d'Utilisateur">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-8 z-50 flex items-center px-4 py-3 rounded-xl border shadow-premium animate-fade-in ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* METRONIC-STYLE COVER PROFILE CARD */}
      <div className="mb-8 rounded-xl border border-slate-100 bg-white overflow-hidden shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
        {/* Banner with a premium gradient background using VH colors */}
        <div className="h-44 bg-gradient-to-r from-[#006C69] via-[#06A7B5] to-[#CEAD1E] relative" />
        
        {/* User Details Box */}
        <div className="p-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between -mt-20 lg:-mt-24 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
              {/* Avatar stuck in the cover banner */}
              <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-premium flex items-center justify-center relative overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-tr from-[#006C69]/10 to-[#CEAD1E]/15 flex items-center justify-center">
                  <User className="w-14 h-14 text-primary" />
                </div>
              </div>
              
              <div className="pb-2">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    SUPERADMIN
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-xs font-semibold text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{role}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Abidjan, CI</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center justify-center gap-4 mt-6 lg:mt-0">
              <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="block text-sm font-bold text-slate-900">450+</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Membres</span>
              </div>
              <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="block text-sm font-bold text-slate-900">12</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">GEMs</span>
              </div>
              <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="block text-sm font-bold text-slate-900">4</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Écoles</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-t border-slate-100 pt-4 -mx-6 px-6 -mb-6 space-x-6 text-sm font-bold text-slate-500">
            <button
              onClick={() => setActiveTab("OVERVIEW")}
              className={`pb-4 transition-all flex items-center space-x-2 border-b-2 ${
                activeTab === "OVERVIEW" 
                  ? "text-primary border-primary font-bold" 
                  : "border-transparent hover:text-primary hover:border-slate-200"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Aperçu</span>
            </button>
            <button
              onClick={() => setActiveTab("SETTINGS")}
              className={`pb-4 transition-all flex items-center space-x-2 border-b-2 ${
                activeTab === "SETTINGS" 
                  ? "text-primary border-primary font-bold" 
                  : "border-transparent hover:text-primary hover:border-slate-200"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Paramètres</span>
            </button>
            <button
              onClick={() => setActiveTab("SECURITY")}
              className={`pb-4 transition-all flex items-center space-x-2 border-b-2 ${
                activeTab === "SECURITY" 
                  ? "text-primary border-primary font-bold" 
                  : "border-transparent hover:text-primary hover:border-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Sécurité</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRONIC DYNAMIC CONTENT SHEETS */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Badges & About Cards (matches 1/3 layout in screen 1) */}
          <div className="space-y-8 lg:col-span-1">
            
            {/* Community Badges Card */}
            <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                Community Badges
              </h3>
              
              <div className="flex items-center space-x-3.5">
                {/* Globe Cyan badge */}
                <div className="w-10 h-10 rounded-full border border-[#06A7B5]/25 bg-[#06A7B5]/5 flex items-center justify-center shadow-sm">
                  <Globe className="w-5 h-5 text-[#06A7B5]" />
                </div>
                {/* Lightning/Zap Orange badge */}
                <div className="w-10 h-10 rounded-full border border-[#EC8001]/25 bg-[#EC8001]/5 flex items-center justify-center shadow-sm">
                  <Zap className="w-5 h-5 text-[#EC8001]" />
                </div>
                {/* Message Green badge */}
                <div className="w-10 h-10 rounded-full border border-[#006C69]/25 bg-[#006C69]/5 flex items-center justify-center shadow-sm">
                  <MessageSquare className="w-5 h-5 text-[#006C69]" />
                </div>
                {/* Award Purple badge */}
                <div className="w-10 h-10 rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/5 flex items-center justify-center shadow-sm">
                  <Award className="w-5 h-5 text-[#8B5CF6]" />
                </div>
              </div>
            </div>

            {/* About Card */}
            <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                About
              </h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-center">
                  <span className="w-24 text-slate-400 font-bold">Age:</span>
                  <span className="text-slate-800 font-semibold">45</span>
                </div>
                <div className="flex items-center border-t border-slate-100/50 pt-3">
                  <span className="w-24 text-slate-400 font-bold">City:</span>
                  <span className="text-slate-800 font-semibold">Abidjan</span>
                </div>
                <div className="flex items-center border-t border-slate-100/50 pt-3">
                  <span className="w-24 text-slate-400 font-bold">State:</span>
                  <span className="text-slate-800 font-semibold">Lagunes</span>
                </div>
                <div className="flex items-center border-t border-slate-100/50 pt-3">
                  <span className="w-24 text-slate-400 font-bold">Country:</span>
                  <span className="text-slate-800 font-semibold">Côte d&apos;Ivoire</span>
                </div>
                <div className="flex items-center border-t border-slate-100/50 pt-3">
                  <span className="w-24 text-slate-400 font-bold">Postcode:</span>
                  <span className="text-slate-800 font-semibold">01 BP 2244</span>
                </div>
                <div className="flex items-center border-t border-slate-100/50 pt-3">
                  <span className="w-24 text-slate-400 font-bold">Phone:</span>
                  <span className="text-slate-800 font-semibold">{phone}</span>
                </div>
                <div className="flex items-center border-t border-slate-100/50 pt-3">
                  <span className="w-24 text-slate-400 font-bold">Email:</span>
                  <span className="text-slate-800 font-semibold truncate">{email}</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Creative Partnerships banner & SVG Chart (matches 2/3 layout) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Unlock Creative Partnerships Banner Card */}
            <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900">
                  Débloquez l&apos;Évangélisation Digitale avec ChurchFlow
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-2.5 leading-relaxed max-w-xl">
                  Explorez de nouvelles opportunités de croissance spirituelle et de suivi grâce à nos outils de pilotage connectés pour les Tribus et les GEMs. Invitez vos bergers à intégrer leurs rapports.
                </p>
                <button className="text-xs font-bold text-primary hover:underline flex items-center mt-5">
                  <span>Commencer</span>
                  <span className="ml-1">→</span>
                </button>
              </div>

              {/* Decorative Vector cluster illustration */}
              <div className="w-32 h-24 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl flex-shrink-0">
                <div className="relative">
                  <Activity className="w-10 h-10 text-primary stroke-[1.5]" />
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#EC8001] border-2 border-white" />
                </div>
              </div>
            </div>

            {/* Media Uploads / Live Stats SVG Curved Line Chart */}
            <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Croissance de l&apos;Audience Mensuelle
                </h3>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span>Nouveaux Enregistrements</span>
                </div>
              </div>

              {/* Custom High-fidelity Inline Responsive SVG Chart (completely robust and visually stunning!) */}
              <div className="w-full h-56 mt-4">
                <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#006C69" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#006C69" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Smooth curved chart area fill */}
                  <path 
                    d="M 0 170 C 50 160, 100 120, 150 110 C 200 100, 250 140, 300 70 C 350 0, 400 40, 500 20 L 500 200 L 0 200 Z" 
                    fill="url(#chartGrad)" 
                  />

                  {/* Curving path outline */}
                  <path 
                    d="M 0 170 C 50 160, 100 120, 150 110 C 200 100, 250 140, 300 70 C 350 0, 400 40, 500 20" 
                    fill="none" 
                    stroke="#006C69" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />

                  {/* Interactive node points */}
                  <circle cx="150" cy="110" r="5" fill="#006C69" stroke="#ffffff" strokeWidth="2" className="shadow-sm" />
                  <circle cx="300" cy="70" r="5" fill="#006C69" stroke="#ffffff" strokeWidth="2" className="shadow-sm" />
                  <circle cx="500" cy="20" r="5" fill="#006C69" stroke="#ffffff" strokeWidth="2" className="shadow-sm" />
                </svg>

                {/* X Axis labels */}
                <div className="flex items-center justify-between mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  <span>Jan</span>
                  <span>Fév</span>
                  <span>Mar</span>
                  <span>Avr</span>
                  <span>Mai</span>
                  <span>Jui</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === "SETTINGS" && (
        <div className="max-w-3xl rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] p-6">
          <h3 className="text-base font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
            Paramètres du Compte
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Nom complet *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Adresse E-mail *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Numéro de Téléphone *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Rôle / Fonction *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Église locale principale *</label>
                <input
                  type="text"
                  required
                  value={church}
                  onChange={(e) => setChurch(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Langue *</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                >
                  <option value="Français (FR)">Français (FR)</option>
                  <option value="English (US)">English (US)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center justify-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium"
              >
                <Save className="w-4 h-4" />
                <span>Sauvegarder les modifications</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "SECURITY" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Password modifier */}
          <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] p-6">
            <h3 className="text-base font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
              Modifier le Mot de Passe
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Mot de passe actuel *</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Nouveau mot de passe *</label>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Confirmer le nouveau mot de passe *</label>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex items-center justify-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer le mot de passe</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Sessions */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] p-6">
            <h3 className="text-base font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Sessions Actives</span>
            </h3>

            <div className="space-y-5">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">Chrome sous Windows (Ce PC)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Abidjan, Côte d&apos;Ivoire • IP: 197.234.12.98</p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase mt-1">
                    Actuel
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 border-t border-slate-100 pt-4">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 flex-shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">Safari sous iPhone 15 Pro</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Abidjan, Côte d&apos;Ivoire • IP: 172.56.88.204</p>
                  <p className="text-[9px] text-slate-400 mt-1">Dernière activité: Il y a 2 heures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

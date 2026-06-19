"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, AlertCircle, Building, Shield } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // First connection states
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the API login endpoint to check for firstConnection
      const checkRes = await fetch(`/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const checkJson = await checkRes.json();

      if (checkJson.firstConnection) {
        setShowModal(true);
        setNewPassword(password); // Pre-fill with what they typed
        setConfirmPassword(password);
        setLoading(false);
        return;
      }

      // Standard sign in
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Identifiants incorrects ou compte inactif");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur de connexion s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFirstConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setRegError("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      setRegError("Le mot de passe doit faire au moins 6 caractères");
      return;
    }

    try {
      setRegLoading(true);
      setRegError(null);

      const res = await fetch(`/api/v1/auth/register-first-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword })
      });

      const json = await res.json();

      if (!json.success) {
        setRegError(json.error || "Une erreur s'est produite");
      } else {
        // Sign in automatically
        const loginRes = await signIn("credentials", {
          email,
          password: newPassword,
          redirect: false,
        });

        if (loginRes?.error) {
          setError("Erreur de connexion après création de compte");
          setShowModal(false);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err) {
      console.error(err);
      setRegError("Erreur lors de la création du compte");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Background subtle gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#CEAD1E]/5 blur-3xl" />
      </div>

      {/* Main login card */}
      <div className="relative w-full max-w-md">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#CEAD1E]/10 blur-2xl" />

        <div className="relative horizon-card p-8 shadow-horizon-xl">
          <div className="flex flex-col items-center mb-8">
            {/* Logo */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg mb-6">
              <span className="font-extrabold text-xl text-white">CF</span>
            </div>

            {/* Title and subtitle */}
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Connexion Administration
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                ChurchFlow Management Dashboard
              </p>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              <Shield className="w-3 h-3" />
              <span>Sécurisé</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start space-x-3 p-4 rounded-xl border border-[#CD3C14]/20 bg-[#CD3C14]/10 text-[#CD3C14] text-sm font-semibold mb-6 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Adresse e-mail *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@churchflow.com"
                  className="w-full pl-12 pr-4 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-4 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-horizon btn-horizon-primary flex items-center justify-center space-x-2 w-full py-3.5 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Info text */}
          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              <Building className="w-3 h-3 inline mr-1" />
              Accès sécurisé réservé aux administrateurs de la communauté.
            </p>
          </div>
        </div>

        {/* Additional branding elements */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 ChurchFlow - Vase d'Honneur Calavi
          </p>
        </div>
      </div>

      {/* First Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 horizon-card shadow-horizon-xl">
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20 mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground text-center mb-2">
                Première Connexion
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Votre adresse e-mail correspond à un membre enregistré. Définissez votre mot de passe pour activer votre accès.
              </p>
            </div>

            {regError && (
              <div className="flex items-start space-x-3 p-3 rounded-xl border border-[#CD3C14]/20 bg-[#CD3C14]/10 text-[#CD3C14] text-xs font-semibold mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterFirstConnection} className="space-y-4">
              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nouveau mot de passe *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    className="w-full pl-12 pr-4 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="w-full pl-12 pr-4 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-horizon btn-horizon-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="btn-horizon btn-horizon-primary flex-1 disabled:opacity-50"
                >
                  {regLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Valider</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
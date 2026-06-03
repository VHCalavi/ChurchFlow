"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-[#0d0d15] text-slate-200 selection:bg-primary selection:text-white px-4">
      {/* Background elegant abstract gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-secondary/15 blur-[150px] pointer-events-none" />

      {/* Main glassmorphic login card */}
      <div className="w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5 bg-[#151521]/60 backdrop-blur-xl shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary shadow-lg mb-4">
            <span className="font-extrabold text-2xl text-white">CF</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Connexion Admin</h2>
          <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-widest text-center">
            ChurchFlow Management Dashboard
          </p>
        </div>

        {error && (
          <div className="flex items-start space-x-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold mb-6 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Adresse e-mail
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex. admin@churchflow.com"
                className="w-full pl-12 pr-4 py-3 text-sm font-semibold rounded-xl border border-white/5 bg-[#1e1e2d]/60 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-12 pr-4 py-3 text-sm font-semibold rounded-xl border border-white/5 bg-[#1e1e2d]/60 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50 mt-8 cursor-pointer group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Se connecter</span>
                <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600 font-medium">
            Accès sécurisé réservé aux administrateurs de la communauté.
          </p>
        </div>
      </div>

      {/* First Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-[#151521]/95 shadow-2xl relative">
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-600 shadow-lg shadow-emerald-500/20 mb-4">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white text-center">Première Connexion</h3>
              <p className="text-sm text-slate-400 text-center mt-2">
                Votre adresse e-mail correspond à un membre enregistré. Définissez votre mot de passe pour activer votre accès.
              </p>
            </div>

            {regError && (
              <div className="flex items-start space-x-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-semibold mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterFirstConnection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-lg border border-white/5 bg-[#1e1e2d] text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-lg border border-white/5 bg-[#1e1e2d] text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 text-sm font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-1/2 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-1"
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

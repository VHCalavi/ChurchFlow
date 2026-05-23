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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      setError(null);

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
    </div>
  );
}

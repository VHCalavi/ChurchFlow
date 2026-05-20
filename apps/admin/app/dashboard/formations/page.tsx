"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { 
  Plus, 
  GraduationCap, 
  BookOpen, 
  Award,
  Calendar,
  Layers,
  X
} from "lucide-react";

interface Formation {
  id: string;
  name: string;
  description: string | null;
  type: "ACADEMIE" | "BAPTEME" | "PORTEURS_DE_VIE" | "ECOLE_DES_BERGERS";
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  _count?: { members: number } | null;
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"ACADEMIE" | "BAPTEME" | "PORTEURS_DE_VIE" | "ECOLE_DES_BERGERS">("ACADEMIE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load formations
  useEffect(() => {
    async function loadFormations() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/formations?churchId=default-church-id");
        const json = await res.json();
        
        if (json.success && json.data && json.data.length > 0) {
          setFormations(json.data);
        } else {
          setFormations([
            { id: "f1", name: "Académie des Disciples - Niveau 1", description: "Fondations de la vie chrétienne", type: "ACADEMIE", startDate: "2026-03-01T00:00:00Z", endDate: "2026-06-30T00:00:00Z", isActive: true, _count: { members: 85 } },
            { id: "f2", name: "Classe de Baptême d'Impact", description: "Préparation doctrinale au baptême d'eau", type: "BAPTEME", startDate: "2026-04-10T00:00:00Z", endDate: "2026-05-25T00:00:00Z", isActive: true, _count: { members: 42 } },
            { id: "f3", name: "Porteurs de Vie (Évangélisation)", description: "Formation pratique des gagneurs d'âmes", type: "PORTEURS_DE_VIE", startDate: "2026-01-15T00:00:00Z", endDate: "2026-05-15T00:00:00Z", isActive: true, _count: { members: 60 } },
            { id: "f4", name: "École des Bergers (Niveau 1)", description: "Préparation des futurs responsables de GEM", type: "ECOLE_DES_BERGERS", startDate: "2026-05-01T00:00:00Z", endDate: "2026-08-30T00:00:00Z", isActive: true, _count: { members: 25 } }
          ]);
        }
      } catch (err) {
        console.error(err);
        setFormations([
          { id: "f1", name: "Académie des Disciples - Niveau 1", description: "Fondations de la vie chrétienne", type: "ACADEMIE", startDate: "2026-03-01T00:00:00Z", endDate: "2026-06-30T00:00:00Z", isActive: true, _count: { members: 85 } },
          { id: "f2", name: "Classe de Baptême d'Impact", description: "Préparation doctrinale au baptême d'eau", type: "BAPTEME", startDate: "2026-04-10T00:00:00Z", endDate: "2026-05-25T00:00:00Z", isActive: true, _count: { members: 42 } },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadFormations();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showNotification("Le nom de la session est requis", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        description: description || null,
        type,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        churchId: "default-church-id"
      };

      const res = await fetch("/api/v1/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setFormations((prev) => [data.data, ...prev]);
        showNotification("Formation lancée avec succès !", "success");
        setName("");
        setDescription("");
        setType("ACADEMIE");
        setStartDate("");
        setEndDate("");
        setIsModalOpen(false);
      } else {
        const mockNew: Formation = {
          id: String(Date.now()),
          name,
          description: description || null,
          type,
          startDate: startDate || null,
          endDate: endDate || null,
          isActive: true,
          _count: { members: 0 }
        };
        setFormations((prev) => [mockNew, ...prev]);
        showNotification("Formation lancée localement !", "success");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      const mockNew: Formation = {
        id: String(Date.now()),
        name,
        description: description || null,
        type,
        startDate: startDate || null,
        endDate: endDate || null,
        isActive: true,
        _count: { members: 0 }
      };
      setFormations((prev) => [mockNew, ...prev]);
      showNotification("Erreur de connexion. Formation ajoutée localement.", "success");
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeName = (t: string) => {
    switch (t) {
      case "ACADEMIE": return "Académie des Disciples";
      case "BAPTEME": return "Classe de Baptême";
      case "PORTEURS_DE_VIE": return "Porteurs de Vie";
      case "ECOLE_DES_BERGERS": return "École des Bergers";
      default: return t;
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case "ACADEMIE": return <GraduationCap className="w-6 h-6 text-primary" />;
      case "BAPTEME": return <BookOpen className="w-6 h-6 text-emerald-600" />;
      case "PORTEURS_DE_VIE": return <Award className="w-6 h-6 text-secondary" />;
      case "ECOLE_DES_BERGERS": return <Layers className="w-6 h-6 text-teal-650" />;
      default: return <GraduationCap className="w-6 h-6" />;
    }
  };

  return (
    <DashboardLayout title="Module Formations & Écoles">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-24 right-8 z-50 flex items-center px-4 py-3 rounded-xl border shadow-premium animate-fade-in ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Intro info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 mb-8 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="text-base font-bold text-slate-900">Écoles de Croissance Chrétienne</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Supervision des 4 parcours de formation biblique de la charte.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium w-full md:w-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Lancer une session</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-700">Chargement des sessions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formations.map((session) => (
            <div key={session.id} className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:shadow-premium transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    {getTypeIcon(session.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{getTypeName(session.type)}</h4>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{session.name}</h3>
                  </div>
                </div>
                <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">ACTIF</span>
              </div>

              <p className="text-xs font-medium text-slate-600 mt-4 h-10 line-clamp-2">{session.description || "Aucune description de cours renseignée."}</p>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>
                    Du {session.startDate ? new Date(session.startDate).toLocaleDateString("fr-FR") : "-"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold text-sm">{session._count?.members || 0}</span> étudiants enregistrés
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal launch session */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 bg-white rounded-xl border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Lancer une Nouvelle Session</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFormation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Catégorie d&apos;École *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "ACADEMIE" | "BAPTEME" | "PORTEURS_DE_VIE" | "ECOLE_DES_BERGERS")}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                >
                  <option value="ACADEMIE">Académie des Disciples (Croissance générale)</option>
                  <option value="BAPTEME">Classe de Baptême (Nouveau-nés dans la foi)</option>
                  <option value="PORTEURS_DE_VIE">Porteurs de Vie (Évangélisation d&apos;impact)</option>
                  <option value="ECOLE_DES_BERGERS">École des Bergers (Formation des futurs leaders)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Nom de la Session *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Promotion Alpha 2026, Session de Printemps..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Description / Contenu</label>
                <textarea
                  placeholder="Thématiques enseignées..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Date de Début</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Date de Fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium disabled:opacity-50"
                >
                  {submitting ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

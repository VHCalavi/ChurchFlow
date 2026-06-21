"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Search, Plus, FileText, Calendar, User } from "lucide-react";
import { HorizonCard } from "@/components/ui/horizon-card";
import { Report } from "@churchflow/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Load reports data
  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/reports`);
        const json = await res.json();
        if (json.success && json.data) {
          setReports(json.data);
        }
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  // Filtered reports
  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show notification and auto-hide
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <DashboardLayout title="Rapports">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        } animate-fade-in`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <HorizonCard className="p-5 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2559]">Rapports</h1>
            <p className="text-[#6D6E71] mt-2">Gérer les rapports de l'église</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-horizon btn-horizon-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Nouveau rapport</span>
          </button>
        </div>
      </HorizonCard>

      {/* Search */}
      <HorizonCard className="p-5 mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -mt-0.5 -translate-y-1/2 w-4.5 h-4.5 text-[#A3AED0]" />
          <input
            type="text"
            placeholder="Rechercher un rapport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 !pl-12 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] shadow-horizon-md hover:shadow-horizon-lg transition-shadow duration-300"
          />
        </div>
      </HorizonCard>

      {/* Main Content */}
      <div className="space-y-4">
        {loading ? (
          <HorizonCard className="p-12">
            <p className="text-center text-[#6D6E71]">Chargement des rapports...</p>
          </HorizonCard>
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <HorizonCard key={report.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#1B2559] mb-2">
                    {report.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold border border-[#D6D1CE] text-[#6D6E71]">
                      {report.type}
                    </span>
                  </div>

                  <p className="text-sm text-[#6D6E71] line-clamp-3 mb-4">
                    {report.content}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-[#A3AED0]" />
                      <span className="text-[#6D6E71]">
                        {report.author.firstName} {report.author.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#A3AED0]" />
                      <span className="text-[#6D6E71]">
                        {new Date(report.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="btn-horizon btn-horizon-secondary ml-4">
                  <FileText className="w-4 h-4" />
                  <span>Voir</span>
                </button>
              </div>
            </HorizonCard>
          ))
        ) : (
          <HorizonCard className="p-12">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-[#D6D1CE] mb-4" />
              <p className="text-[#6D6E71]">
                Aucun rapport trouvé. Créez votre premier rapport pour commencer.
              </p>
            </div>
          </HorizonCard>
        )}
      </div>

      {/* Create Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 bg-white rounded-[20px] shadow-horizon-xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D6D1CE]">
              <h3 className="text-base font-bold text-[#1B2559]">
                Créer un nouveau rapport
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#6D6E71] hover:text-[#1B2559]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              showNotification("Fonctionnalité en cours de développement", "success");
              setIsModalOpen(false);
            }} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#1B2559] block mb-2">
                  Titre du rapport *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rapport de réunion"
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#1B2559] block mb-2">
                  Type *
                </label>
                <select
                  required
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
                >
                  <option value="ACTIVITY">Activité</option>
                  <option value="FINANCIAL">Financier</option>
                  <option value="SPIRITUAL">Spirituel</option>
                  <option value="TRAINING">Formation</option>
                  <option value="MEETING">Réunion</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-[#1B2559] block mb-2">
                  GEM (optionnel)
                </label>
                <select
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
                >
                  <option value="">Aucun</option>
                  <option value="gem1">GEM Victoire</option>
                  <option value="gem2">GEM Paix</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-[#1B2559] block mb-2">
                  Contenu *
                </label>
                <textarea
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
                  placeholder="Écrivez le contenu du rapport..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-horizon btn-horizon-primary"
                >
                  Créer le rapport
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-bold rounded-full border-[#D6D1CE] bg-white text-[#6D6E71]"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
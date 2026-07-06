"use client";

"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Search, Plus, FileText, Calendar, User, Trash2, Eye, X, Building } from "lucide-react";
import { HorizonCard } from "@/components/ui/horizon-card";
import { Report } from "@churchflow/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [gems, setGems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [viewReportModal, setViewReportModal] = useState(false);
  const [reportToView, setReportToView] = useState<Report | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Load reports data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Load reports
        const reportParams = new URLSearchParams();
        if (typeFilter !== "all") reportParams.append("type", typeFilter);
        if (dateFilter.start) reportParams.append("startDate", dateFilter.start);
        if (dateFilter.end) reportParams.append("endDate", dateFilter.end);

        const [reportsRes, gemsRes] = await Promise.all([
          fetch(`/api/v1/reports?${reportParams}`),
          fetch("/api/v1/gems")
        ]);

        const reportsJson = await reportsRes.json();
        const gemsJson = await gemsRes.json();

        if (reportsJson.success && reportsJson.data) {
          setReports(reportsJson.data);
        }
        if (gemsJson.success && gemsJson.data) {
          setGems(gemsJson.data);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        showNotification("Erreur lors du chargement des données", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [typeFilter, dateFilter]);

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
        <div className={`notification-toast fixed top-24 right-8 px-6 py-3 rounded-lg shadow-lg ${
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

      {/* Filters */}
      <HorizonCard className="p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-bold text-[#1B2559] block mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
            >
              <option value="all">Tous les types</option>
              <option value="ACTIVITY">Activité</option>
              <option value="FINANCIAL">Financier</option>
              <option value="SPIRITUAL">Spirituel</option>
              <option value="TRAINING">Formation</option>
              <option value="MEETING">Réunion</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-[#1B2559] block mb-2">Date de début</label>
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
              className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-[#1B2559] block mb-2">Date de fin</label>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
              className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
            />
          </div>
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

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setReportToView(report);
                      setViewReportModal(true);
                    }}
                    className="btn-horizon btn-horizon-secondary"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Voir</span>
                  </button>
                  <button
                    onClick={() => {
                      setReportToDelete(report);
                      setDeleteModalOpen(true);
                    }}
                    className="btn-horizon btn-horizon-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
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

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);

              try {
                const reportData: any = {
                  title: formData.get('title') as string,
                  type: formData.get('type') as string,
                  content: formData.get('content') as string,
                };

                // Ajouter gemId seulement s'il est sélectionné
                const gemId = formData.get('gemId') as string;
                if (gemId && gemId !== '') {
                  reportData.gemId = gemId;
                }

                const res = await fetch('/api/v1/reports', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(reportData),
                });

                const json = await res.json();
                if (json.success) {
                  showNotification("Rapport créé avec succès", "success");
                  setIsModalOpen(false);
                  // Reload reports
                  loadReports();
                } else {
                  showNotification(json.error || "Erreur lors de la création", "error");
                  console.error("Error creating report:", json.details);
                }
              } catch (err) {
                console.error("Error creating report:", err);
                showNotification("Erreur lors de la création", "error");
              }
            }} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#1B2559] block mb-2">
                  Titre du rapport *
                </label>
                <input
                  type="text"
                  name="title"
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
                  name="type"
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
                  name="gemId"
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
                >
                  <option value="">Aucun</option>
                  {gems.map(gem => (
                    <option key={gem.id} value={gem.id}>{gem.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-[#1B2559] block mb-2">
                  Contenu *
                </label>
                <textarea
                  name="content"
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

      {/* Delete Report Modal */}
      {deleteModalOpen && reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-white rounded-[20px] shadow-horizon-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#1B2559] mb-2">
                Supprimer le rapport ?
              </h3>
              <p className="text-sm text-[#6D6E71] mb-6">
                Êtes-vous sûr de vouloir supprimer le rapport "{reportToDelete.title}" ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/v1/reports/${reportToDelete.id}`, {
                        method: 'DELETE',
                      });
                      const json = await res.json();
                      if (json.success) {
                        showNotification("Rapport supprimé avec succès", "success");
                        setDeleteModalOpen(false);
                        setReportToDelete(null);
                        loadReports();
                      } else {
                        showNotification(json.error || "Erreur lors de la suppression", "error");
                      }
                    } catch (err) {
                      console.error("Error deleting report:", err);
                      showNotification("Erreur lors de la suppression", "error");
                    }
                  }}
                  className="flex-1 btn-horizon btn-horizon-danger"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setReportToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 text-sm font-bold rounded-full border-[#D6D1CE] bg-white text-[#6D6E71]"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {viewReportModal && reportToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl p-6 bg-white rounded-[20px] shadow-horizon-xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1B2559]">
                {reportToView.title}
              </h3>
              <button
                onClick={() => {
                  setViewReportModal(false);
                  setReportToView(null);
                }}
                className="text-[#6D6E71] hover:text-[#1B2559]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full text-sm font-semibold border border-[#D6D1CE] text-[#6D6E71]">
                  {reportToView.type}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-[#6D6E71]">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>
                    {reportToView.author.firstName} {reportToView.author.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(reportToView.submittedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#D6D1CE] pt-6">
              <h4 className="text-sm font-bold text-[#1B2559] mb-3">Contenu du rapport</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-[#6D6E71] whitespace-pre-wrap">
                  {reportToView.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
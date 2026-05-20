import React from "react";
import { DashboardLayout } from "../../components/layout/dashboard-layout";
import {
  Users,
  Network,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight
} from "lucide-react";

export default function DashboardHome() {
  // Statics Mock Data with Metronic styling details
  const stats = [
    {
      title: "MEMBRES ACTIFS",
      value: "1 245",
      change: "+12% ce mois-ci",
      isPositive: true,
      icon: <Users className="w-5 h-5 text-primary" />,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100"
    },
    {
      title: "GROUPES & GEM",
      value: "48",
      change: "3 nouveaux GEM",
      isPositive: true,
      icon: <Network className="w-5 h-5 text-primary" />,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100"
    },
    {
      title: "FORMATIONS EN COURS",
      value: "6 Écoles",
      change: "185 étudiants actifs",
      isPositive: true,
      icon: <GraduationCap className="w-5 h-5 text-secondary" />,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100"
    },
    {
      title: "FINANCES (SOLDE)",
      value: "8 450 200 FCFA",
      change: "-5% dépenses équipement",
      isPositive: false,
      icon: <TrendingDown className="w-5 h-5 text-red-500" />,
      badgeClass: "bg-red-50 text-red-700 border-red-100"
    }
  ];

  const recentMembers = [
    { name: "Marc KOFFI", status: "RESPONSABLE", grade: "Serviteur", echelon: "C10", date: "Il y a 2 heures" },
    { name: "Awa DIALLO", status: "MEMBRE", grade: null, echelon: null, date: "Il y a 5 heures" },
    { name: "Jean-Pierre TANO", status: "RESPONSABLE", grade: "Aspirant", echelon: "C5", date: "Hier" },
    { name: "Esther AMON", status: "SYMPATHISANT", grade: null, echelon: null, date: "Il y a 2 jours" }
  ];

  const meetings = [
    { title: "Culte de Célébration", type: "CULTE", date: "Dimanche, 08:00", location: "Temple Principal" },
    { title: "Répétition de la Chorale", type: "REPETITION", date: "Samedi, 16:00", location: "Salle Polyvalente" },
    { title: "Temps de Prière (Gethsémané)", type: "TEMPS_DE_PRIERE", date: "Vendredi, 19:00", location: "En Ligne" }
  ];

  return (
    <DashboardLayout title="Tableau de Bord Global">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] transition-all duration-300 hover:scale-[1.01] hover:shadow-premium"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">{stat.title}</span>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                {stat.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
            <div className="flex items-center mt-3.5 space-x-1.5">
              {stat.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-650" />
              )}
              <span className={`text-xs font-semibold ${stat.isPositive ? "text-emerald-600" : "text-red-600"}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Members Panel */}
        <div className="xl:col-span-2 p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Membres Récemment Enregistrés</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Derniers enregistrements administratifs</p>
            </div>
            <button className="flex items-center text-xs font-bold text-primary hover:text-primary/80 transition-colors space-x-1">
              <span>Voir tout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs font-bold tracking-wider uppercase">
                  <th className="pb-4">Nom complet</th>
                  <th className="pb-4">Statut</th>
                  <th className="pb-4">Grade & Échelon</th>
                  <th className="pb-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
                {recentMembers.map((member, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-slate-900 font-semibold">{member.name}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wider ${
                        member.status === "RESPONSABLE"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : member.status === "MEMBRE"
                          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {member.grade ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 bg-slate-50 rounded border border-slate-100 font-semibold text-primary">
                            {member.grade}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-slate-50 rounded border border-slate-100 font-semibold text-secondary">
                            {member.echelon}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-4 text-slate-500 text-xs flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Next meetings Panel with Metronic colored border styling */}
        <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Prochaines Réunions</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Rencontres officielles et cultes</p>
            </div>
            <button className="flex items-center text-xs font-bold text-primary hover:text-primary/80 transition-colors space-x-1">
              <span>Calendrier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {meetings.map((meeting, idx) => (
              <div
                key={idx}
                className="flex flex-col p-4 rounded-lg border-l-4 border-y border-r border-slate-100 bg-slate-50/20 hover:bg-slate-50 transition-all duration-300"
                style={{
                  borderLeftColor: meeting.type === "CULTE" ? "#006C69" : meeting.type === "REPETITION" ? "#CEAD1E" : "#94A3B8"
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                    meeting.type === "CULTE"
                      ? "bg-primary/10 text-primary"
                      : meeting.type === "REPETITION"
                      ? "bg-secondary/10 text-secondary"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {meeting.type}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{meeting.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{meeting.title}</h4>
                <p className="text-xs font-medium text-slate-555 mt-1">{meeting.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

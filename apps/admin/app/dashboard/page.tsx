import React from "react";
import { cookies } from "next/headers";
import { auth } from "@churchflow/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "../../components/layout/dashboard-layout";

interface ApiMember {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  grade: string | null;
  echelon: string | null;
  createdAt: string;
}

interface ApiGroup {
  id: string;
  type: string;
  name: string;
}

interface ApiMeeting {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string | null;
}

import { AttendanceTrendChart } from "../../components/dashboard/AttendanceTrendChart";

import {
  Users,
  Network,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  CalendarCheck,
  Construction
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  // Get the authenticated session server-side
  const session = await auth();
  if (!session?.user) redirect("/login");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Forward the session cookies to the API so it can validate the JWT
  const cookieStore = cookies();
  const cookieHeader = cookieStore.getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const fetchOptions: RequestInit = {
    cache: "no-store",
    headers: { Cookie: cookieHeader },
  };

  let membersList: ApiMember[] = [];
  let groupsList: ApiGroup[] = [];
  let meetingsList: ApiMeeting[] = [];
  let fetchError = false;

  try {
    const [membersRes, groupsRes, meetingsRes] = await Promise.all([
      fetch(`${apiUrl}/api/v1/members`, fetchOptions),
      fetch(`${apiUrl}/api/v1/groups`, fetchOptions),
      fetch(`${apiUrl}/api/v1/meetings`, fetchOptions),
    ]);

    if (membersRes.ok) {
      const json = await membersRes.json();
      if (json.success) membersList = json.data;
    } else {
      fetchError = true;
    }

    if (groupsRes.ok) {
      const json = await groupsRes.json();
      if (json.success) groupsList = json.data;
    } else {
      fetchError = true;
    }

    if (meetingsRes.ok) {
      const json = await meetingsRes.json();
      if (json.success) meetingsList = json.data;
    } else {
      fetchError = true;
    }
  } catch (error) {
    console.error("Dashboard fetching error:", error);
    fetchError = true;
  }

  // Format real-time statistics
  const stats = [
    {
      title: "MEMBRES ACTIFS",
      value: fetchError ? "—" : membersList.length.toString(),
      change: fetchError ? "Données non disponibles" : `+${membersList.length} au total`,
      isPositive: true,
      isPending: false,
      icon: <Users className="w-5 h-5 text-[#006C69]" />,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100"
    },
    {
      title: "GROUPES & GEM",
      value: fetchError ? "—" : groupsList.length.toString(),
      change: fetchError ? "Données non disponibles" : `${groupsList.filter(g => g.type === "GEM").length} GEM actifs`,
      isPositive: true,
      isPending: false,
      icon: <Network className="w-5 h-5 text-[#EC8001]" />,
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100"
    },
    {
      title: "FORMATIONS",
      value: "Bientôt",
      change: "Module en développement",
      isPositive: true,
      isPending: true,
      icon: <GraduationCap className="w-5 h-5 text-slate-400" />,
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200"
    },
    {
      title: "FINANCES (SOLDE)",
      value: "Bientôt",
      change: "Module en développement",
      isPositive: false,
      isPending: true,
      icon: <TrendingDown className="w-5 h-5 text-slate-400" />,
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200"
    }
  ];

  // Dynamic members mapping — no mock fallback
  const displayMembers = membersList.slice(0, 4).map(m => {
    const joinDate = new Date(m.createdAt);
    const dateFormatted = joinDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short"
    });
    return {
      name: `${m.firstName} ${m.lastName}`,
      status: m.status,
      grade: m.grade,
      echelon: m.echelon,
      date: `Le ${dateFormatted}`
    };
  });

  // Dynamic meetings mapping — no mock fallback
  const displayMeetings = meetingsList.slice(0, 3).map(mt => {
    const meetingDate = new Date(mt.date);
    const dateFormatted = meetingDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit"
    });
    return {
      title: mt.title,
      type: mt.type,
      date: dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1),
      location: mt.location || "Non spécifié"
    };
  });

  return (
    <DashboardLayout title="Tableau de Bord Global">
      <div className="relative w-full min-h-[600px] rounded-xl overflow-hidden">
        {/* Under Construction Overlay */}
        <div className="absolute inset-0 z-20 flex pt-48 justify-center p-6 bg-slate-900/5 backdrop-blur-[2px]">
          <div className="max-w-md h-min w-full p-8 rounded-2xl border border-slate-150 bg-white/95 shadow-premium text-center flex flex-col items-center transition-all duration-300 hover:scale-[1.01]">
            <div className="w-16 h-16 rounded-2xl bg-[#006C69]/10 border border-[#006C69]/20 flex items-center justify-center text-[#006C69] mb-6 animate-pulse">
              <Construction className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-2.5">Espace en Construction</h2>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Le tableau de bord global est actuellement en cours de développement. Cet espace centralisera bientôt toutes les statistiques clés et indicateurs de performance de votre communauté.
            </p>
            
            {/* Progress bar visual */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#006C69] to-[#EC8001] h-1.5 rounded-full" 
                style={{ width: "65%" }}
              />
            </div>
            
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
              <span>ChurchFlow</span>
              <span className="text-slate-300">&bull;</span>
              <span>Module Dashboard</span>
            </div>
          </div>
        </div>

        {/* Blurred Content */}
        <div className="filter blur-[6px] opacity-35 pointer-events-none select-none">
          {fetchError && (
            <div className="flex items-center space-x-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-6">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>Mode déconnecté activé : Impossible de joindre l&apos;API ChurchFlow. Données simulées affichées.</span>
            </div>
          )}

          {/* Overview stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`p-6 rounded-xl border bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] transition-all duration-300 hover:scale-[1.01] hover:shadow-premium ${
                  stat.isPending ? "border-slate-100 opacity-80" : "border-slate-150"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">{stat.title}</span>
                  <div className={`p-2.5 rounded-lg border ${stat.isPending ? "bg-slate-50 border-slate-100" : "bg-slate-50 border-slate-100"}`}>
                    {stat.icon}
                  </div>
                </div>
                <h3 className={`text-2xl font-bold tracking-tight ${stat.isPending ? "text-slate-400 font-medium" : "text-slate-900"}`}>
                  {stat.value}
                </h3>
                <div className="flex items-center mt-3.5 space-x-1.5">
                  {stat.isPending ? (
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  ) : stat.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-650" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-650" />
                  )}
                  <span className={`text-xs font-semibold ${stat.isPending ? "text-slate-400" : stat.isPositive ? "text-emerald-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Attendance Trend Chart */}
          <div className="mb-8">
            <AttendanceTrendChart />
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
                    {displayMembers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-sm text-slate-400 font-medium">
                          {fetchError ? "Impossible de joindre l'API. Veuillez vérifier la connexion." : "Aucun membre enregistré pour le moment."}
                        </td>
                      </tr>
                    ) : (
                      displayMembers.map((member, idx) => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Next meetings Panel */}
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
                {displayMeetings.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400 font-medium">
                    {fetchError ? "Impossible de joindre l'API." : "Aucune réunion planifiée."}
                  </div>
                ) : (
                  displayMeetings.map((meeting, idx) => (
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
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center">
                          <CalendarCheck className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {meeting.date}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{meeting.title}</h4>
                      <p className="text-xs font-medium text-slate-500 mt-1">{meeting.location}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

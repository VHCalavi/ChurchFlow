import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@churchflow/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "../../components/layout/dashboard-layout";
import { StatCard } from "../../components/ui/stat-card";
import { HorizonCard } from "../../components/ui/horizon-card";
import { AttendanceTrendChart } from "../../components/dashboard/AttendanceTrendChart";

import {
  Users,
  User,
  Network,
  GraduationCap,
  TrendingDown,
  Clock,
  ArrowRight,
  ShieldAlert,
  CalendarCheck,
  CalendarDays,
  FileText,
  DollarSign,
} from "lucide-react";

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

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  // Get the authenticated session server-side
  const session = await auth();
  if (!session?.user) redirect("/login");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Forward the session cookies to the API so it can validate the JWT
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
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

  // Format statistics
  const activeMembersCount = membersList.length.toString();
  const activeGroupsCount = groupsList.length.toString();
  const gemCount = groupsList.filter((g) => g.type === "GEM").length.toString();

  // Dynamic members mapping
  const displayMembers = membersList.slice(0, 4).map((m) => {
    const joinDate = new Date(m.createdAt);
    const dateFormatted = joinDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
    return {
      name: `${m.firstName} ${m.lastName}`,
      status: m.status,
      grade: m.grade,
      echelon: m.echelon,
      date: `Le ${dateFormatted}`,
    };
  });

  // Dynamic meetings mapping
  const displayMeetings = meetingsList.slice(0, 3).map((mt) => {
    const meetingDate = new Date(mt.date);
    const dateFormatted = meetingDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      title: mt.title,
      type: mt.type,
      date: dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1),
      location: mt.location || "Non spécifié",
    };
  });

  return (
    <DashboardLayout title="Tableau de Bord Global">
      <div className="flex flex-col gap-6 animate-fade-in-up">
        {/* API Error Notification */}
        {fetchError && (
          <div className="flex items-center space-x-3 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>
              Impossible de joindre l&apos;API ChurchFlow. Utilisation de
              données hors ligne.
            </span>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-primary horizon-hero-banner p-8 text-white flex flex-col justify-center min-h-[160px] shadow-horizon-md animate-fade-in-up">
          <span className="text-sm font-bold bg-white/20 w-fit px-3 py-1 rounded-full mb-3">
            Portail Administration
          </span>
          <h2 className="text-base font-bold leading-tight">
            Bonjour, {session?.user?.name || "Administrateur"} 👋
          </h2>
          <p className="text-sm text-white/85 mt-2 max-w-xl">
            Bienvenue sur le tableau de bord de ChurchFlow. Suivez
            l&apos;évolution des membres, la gestion des cellules et
            l&apos;organisation des cultes en temps réel.
          </p>
        </div>

        {/* 4 Columns Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Membres Actifs"
            value={fetchError ? "—" : activeMembersCount}
            change={
              fetchError ? undefined : `+${activeMembersCount} enregistrés`
            }
            isPositive={true}
            icon={<Users className="w-5 h-5 text-[#006C69]" />}
            iconBg="bg-[#006C69]/10"
          />
          <StatCard
            title="Groupes & GEM"
            value={fetchError ? "—" : activeGroupsCount}
            change={fetchError ? undefined : `${gemCount} GEM actives`}
            isPositive={true}
            icon={<Network className="w-5 h-5 text-[#EC8001]" />}
            iconBg="bg-[#EC8001]/10"
            iconColorClass="text-[#EC8001]"
          />
          <StatCard
            title="Formations"
            value="Bientôt"
            change="Module en développement"
            isPending={true}
            icon={<GraduationCap className="w-5 h-5 text-[#0EA7D5]" />}
            iconBg="bg-[#0EA7D5]/10"
            iconColorClass="text-[#0EA7D5]"
          />
          <StatCard
            title="Finances"
            value="Bientôt"
            change="Module en développement"
            isPending={true}
            icon={<DollarSign className="w-5 h-5 text-[#10B981]" />}
            iconBg="bg-[#10B981]/10"
            iconColorClass="text-[#10B981]"
          />
        </div>

        {/* Main Charts & Meetings Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Attendance Trend Chart */}
          <div className="xl:col-span-2">
            <AttendanceTrendChart />
          </div>

          {/* Next Meetings Section */}
          <HorizonCard className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Prochaines Réunions
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rencontres officielles et cultes
                  </p>
                </div>
                <Link
                  href="/dashboard/meetings"
                  className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                >
                  <CalendarDays className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3.5">
                {displayMeetings.length === 0 ? (
                  <div className="py-12 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                    Aucune réunion planifiée pour le moment.
                  </div>
                ) : (
                  displayMeetings.map((meeting, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border bg-background hover:bg-background/80 transition-all flex flex-col gap-2"
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: "#006C69",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-bold bg-primary/10 text-primary px-2 py-0.5 rounded"
                        >
                          {meeting.type}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meeting.date}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground">
                        {meeting.title}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {meeting.location}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Link
              href="/dashboard/meetings"
              className="mt-6 flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-sm font-bold text-white transition-colors"
            >
              <span>Voir le calendrier complet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </HorizonCard>
        </div>

        {/* Lower Members Table & Quick Navigation Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Members Table */}
          <HorizonCard className="xl:col-span-2">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Membres Récemment Enregistrés
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Derniers enregistrements administratifs
                </p>
              </div>
              <Link
                href="/dashboard/members"
                className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
              >
                <span>Voir tout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-sm font-medium">
                    <th className="pb-3 pr-4">Membre</th>
                    <th className="pb-3 pr-4">Statut</th>
                    <th className="pb-3 pr-4">Grade & Échelon</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm font-medium text-muted-foreground">
                  {displayMembers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-xs font-bold text-slate-400 dark:text-slate-500"
                      >
                        {fetchError
                          ? "Impossible de charger les membres."
                          : "Aucun membre enregistré récemment."}
                      </td>
                    </tr>
                  ) : (
                    displayMembers.map((member, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 dark:hover:bg-navy-900/50 transition-colors"
                      >
                        <td className="py-3.5 pr-4 flex items-center gap-3">
                          {/* Avatar Circle with initials */}
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <span className="font-bold text-foreground">
                            {member.name}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-sm font-bold bg-primary/10 text-primary"
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          {member.grade ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm px-2 py-0.5 bg-background border border-border rounded font-bold text-primary">
                                {member.grade}
                              </span>
                              <span className="text-sm px-2 py-0.5 bg-background border border-border rounded font-bold">
                                {member.echelon}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-muted-foreground font-medium">
                          {member.date}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </HorizonCard>

          {/* Quick Actions / Shortcuts Panel */}
          <HorizonCard className="flex flex-col justify-between">
            <div>
              <div className="pb-4 mb-4 border-b border-border">
                <h3 className="text-base font-bold text-foreground">
                  Raccourcis Administrateur
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Accès rapides aux actions fréquentes
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <Link
                  href="/dashboard/members?action=create"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-background/80 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    +
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      Ajouter un membre
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Enregistrer un nouveau fidèle
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/groups"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-background/80 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    G
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      Gérer les GEMs
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Assignations et rapports de cellule
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-background/80 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      Paramètres profil
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Rôles, identifiants et accès
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <span className="text-sm font-bold text-muted-foreground text-center">
                Système ChurchFlow v1.0
              </span>
            </div>
          </HorizonCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

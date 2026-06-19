"use client";

import { useState, useEffect } from "react";
import { X, Users, Calendar, CheckCircle, XCircle } from "lucide-react";

interface MemberGroup {
  group: { id: string; name: string; type: string };
  role: string | null;
  joinedAt: string;
}

interface Attendance {
  meetingId: string;
  isPresent: boolean;
  notes: string | null;
  meeting?: { title: string; date: string; type: string };
}

interface MemberDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  gender: string;
  status: string;
  grade: string | null;
  echelon: string | null;
  isActive: boolean;
  joinDate: string;
  baptismDate: string | null;
  groups: MemberGroup[];
  meetingsAttended: Attendance[];
}

interface Props {
  memberId: string | null;
  onClose: () => void;
}

export function MemberDetailsDrawer({ memberId, onClose }: Props) {
  const [tab, setTab] = useState<"general" | "groupes" | "presences">("general");
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    setTab("general");
    fetch(`/api/v1/members/${memberId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMember(d.data);
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  if (!memberId) return null;

  const presentCount = member?.meetingsAttended?.filter((a) => a.isPresent).length ?? 0;
  const total = member?.meetingsAttended?.length ?? 0;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-all"
        onClick={onClose}
      />
      
      {/* Drawer Container */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-card border-l border-[#E0E5F2] dark:border-white/10 shadow-horizon-xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0E5F2] dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#F2EFFF] dark:bg-navy-700 flex items-center justify-center font-bold text-sm text-[#422AFB] dark:text-white flex-shrink-0">
              {member ? `${member.firstName[0]}${member.lastName[0]}` : "..."}
            </div>
            <div className="flex flex-col items-start">
              <h3 className="text-sm font-bold text-foreground">
                {member ? `${member.firstName} ${member.lastName}` : "Chargement..."}
              </h3>
              <p className="text-sm font-medium text-[#A3AED0] mt-0.5">
                {member?.status || "Profil Membre"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-transparent hover:bg-[#F4F7FE] dark:hover:bg-navy-700 text-[#A3AED0] hover:text-foreground transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-[#E0E5F2] dark:border-white/10 px-6">
          {(["general", "groupes", "presences"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-4 px-4 text-sm font-medium border-b-2 transition-all ${
                tab === t
                  ? "border-[#422AFB] text-[#422AFB] dark:border-[#7551FF] dark:text-[#7551FF]"
                  : "border-transparent text-[#A3AED0] hover:text-foreground"
              }`}
            >
              {t === "general" ? "Général" : t === "groupes" ? "Groupes" : "Présences"}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-4 border-[#422AFB] dark:border-[#7551FF] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && member && tab === "general" && (
            <div className="space-y-3.5">
              {[
                { label: "Prénom", value: member.firstName },
                { label: "Nom", value: member.lastName },
                { label: "Genre", value: member.gender === "HOMME" ? "Homme" : "Femme" },
                { label: "Email", value: member.email || "Non renseigné" },
                { label: "Téléphone", value: member.phone || "Non renseigné" },
                { label: "Date d'entrée", value: new Date(member.joinDate).toLocaleDateString("fr-FR") },
                {
                  label: "Baptême",
                  value: member.baptismDate
                    ? new Date(member.baptismDate).toLocaleDateString("fr-FR")
                    : "Non renseigné",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-[#E0E5F2]/40 dark:border-white/5">
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  <span className="text-sm font-bold text-foreground">{value}</span>
                </div>
              ))}
              
              {member.grade && (
                <div className="flex items-center gap-2 pt-4">
                  <span className="px-3.5 py-1.5 bg-[#F4F7FE] dark:bg-[#0B1437] text-foreground rounded-full text-sm font-medium">
                    {member.grade}
                  </span>
                  <span className="px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {member.echelon}
                  </span>
                </div>
              )}
            </div>
          )}

          {!loading && member && tab === "groupes" && (
            <div className="space-y-3">
              {member.groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-10 h-10 text-[#A3AED0] mb-3" />
                  <p className="text-sm font-medium text-[#A3AED0]">Aucun groupe assigné à ce membre.</p>
                </div>
              ) : (
                member.groups.map((mg) => (
                  <div
                    key={mg.group.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-[#E0E5F2] dark:border-white/10 bg-[#F4F7FE]/60 dark:bg-navy-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#F2EFFF] dark:bg-navy-800 flex items-center justify-center text-[#422AFB] dark:text-white flex-shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-start">
                        <p className="text-sm font-bold text-foreground leading-tight">{mg.group.name}</p>
                        <p className="text-sm font-medium text-[#A3AED0] mt-0.5">{mg.group.type}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-card rounded-xl text-sm font-medium text-foreground border border-[#E0E5F2] dark:border-white/10">
                      {mg.role || "Membre"}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && member && tab === "presences" && (
            <div className="space-y-5">
              {/* Presence Statistics Card */}
              <div className="p-5 rounded-2xl bg-[#E6FAF5]/80 dark:bg-[#0B2A22]/20 border border-[#01B574]/20 flex items-center justify-between">
                <div className="flex flex-col items-start">
                  <p className="text-sm font-medium text-[#01B574]">Taux de présence</p>
                  <p className="text-3xl font-extrabold text-[#01B574] mt-1">{rate}%</p>
                  <p className="text-sm font-medium text-[#A3AED0] mt-1">
                    {presentCount} présence(s) sur {total} réunion(s)
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#E6FAF5] dark:bg-navy-700 flex items-center justify-center text-[#01B574]">
                  <Calendar className="w-5.5 h-5.5" />
                </div>
              </div>

              {/* Attendance list */}
              <div className="space-y-2.5">
                {(member.meetingsAttended?.length ?? 0) === 0 ? (
                  <p className="text-sm font-medium text-[#A3AED0] text-center py-6">Aucune participation enregistrée.</p>
                ) : (
                  member.meetingsAttended?.slice(0, 10).map((a) => (
                    <div
                      key={a.meetingId}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E0E5F2] dark:border-white/10 hover:bg-[#F4F7FE]/40 dark:hover:bg-[#0B1437]/20 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        {a.isPresent ? (
                          <CheckCircle className="w-4 h-4 text-[#01B574]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#EE5D50]" />
                        )}
                        <div className="flex flex-col items-start">
                          <p className="text-sm font-medium text-foreground leading-tight">
                            {a.meeting?.title || "Réunion"}
                          </p>
                          <p className="text-[10px] font-medium text-[#A3AED0] mt-0.5">
                            {a.meeting?.date
                              ? new Date(a.meeting.date).toLocaleDateString("fr-FR")
                              : ""}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${
                          a.isPresent
                            ? "bg-[#E6FAF5] text-[#01B574] dark:bg-green-500/10"
                            : "bg-[#FEEFEE] text-[#EE5D50] dark:bg-red-500/10"
                        }`}
                      >
                        {a.isPresent ? "Présent" : "Absent"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

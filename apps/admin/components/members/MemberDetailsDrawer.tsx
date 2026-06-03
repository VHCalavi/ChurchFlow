"use client";

import { useState, useEffect } from "react";
import { X, Users, Calendar, CheckCircle, XCircle } from "lucide-react";

interface MemberGroup { group: { id: string; name: string; type: string }; role: string | null; joinedAt: string; }
interface Attendance { meetingId: string; isPresent: boolean; notes: string | null; meeting?: { title: string; date: string; type: string }; }
interface MemberDetail {
  id: string; firstName: string; lastName: string; email: string | null; phone: string | null;
  gender: string; status: string; grade: string | null; echelon: string | null;
  isActive: boolean; joinDate: string; baptismDate: string | null;
  groups: MemberGroup[];
  meetingsAttended: Attendance[];
}

interface Props { memberId: string | null; onClose: () => void; }

export function MemberDetailsDrawer({ memberId, onClose }: Props) {
  const [tab, setTab] = useState<"general" | "groupes" | "presences">("general");
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    setTab("general");
    fetch(`/api/v1/members/${memberId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setMember(d.data); })
      .finally(() => setLoading(false));
  }, [memberId]);

  if (!memberId) return null;

  const presentCount = member?.meetingsAttended?.filter(a => a.isPresent).length ?? 0;
  const total = member?.meetingsAttended?.length ?? 0;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-2xl border-l border-slate-100 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
              {member ? `${member.firstName[0]}${member.lastName[0]}` : "..."}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{member ? `${member.firstName} ${member.lastName}` : "Chargement..."}</h3>
              <p className="text-xs text-slate-500">{member?.status}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {(["general", "groupes", "presences"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wide border-b-2 transition-all ${tab === t ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t === "general" ? "Général" : t === "groupes" ? "Groupes" : "Présences"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}

          {!loading && member && tab === "general" && (
            <div className="space-y-4">
              {[
                { label: "Prénom", value: member.firstName },
                { label: "Nom", value: member.lastName },
                { label: "Genre", value: member.gender === "HOMME" ? "Homme" : "Femme" },
                { label: "Email", value: member.email || "Non renseigné" },
                { label: "Téléphone", value: member.phone || "Non renseigné" },
                { label: "Date d'entrée", value: new Date(member.joinDate).toLocaleDateString("fr-FR") },
                { label: "Baptême", value: member.baptismDate ? new Date(member.baptismDate).toLocaleDateString("fr-FR") : "Non renseigné" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                  <span className="text-sm font-semibold text-slate-800">{value}</span>
                </div>
              ))}
              {member.grade && (
                <div className="flex space-x-2 pt-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20">{member.grade}</span>
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-bold border border-secondary/20">{member.echelon}</span>
                </div>
              )}
            </div>
          )}

          {!loading && member && tab === "groupes" && (
            <div className="space-y-3">
              {member.groups.length === 0
                ? <p className="text-sm text-slate-500 text-center py-8">Aucun groupe assigné.</p>
                : member.groups.map(mg => (
                  <div key={mg.group.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/10"><Users className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{mg.group.name}</p>
                        <p className="text-xs text-slate-500">{mg.group.type}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-white rounded-lg text-xs font-bold text-slate-700 border border-slate-200">{mg.role || "Membre"}</span>
                  </div>
                ))
              }
            </div>
          )}

          {!loading && member && tab === "presences" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Taux de présence</p>
                  <p className="text-2xl font-bold text-primary">{rate}%</p>
                  <p className="text-xs text-slate-500">{presentCount} présence(s) / {total} réunion(s)</p>
                </div>
                <div className="w-14 h-14 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                {(member.meetingsAttended?.length ?? 0) === 0
                  ? <p className="text-sm text-slate-500 text-center py-4">Aucune réunion enregistrée.</p>
                  : member.meetingsAttended?.slice(0, 10).map(a => (
                    <div key={a.meetingId} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center space-x-3">
                        {a.isPresent
                          ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                          : <XCircle className="w-4 h-4 text-red-400" />}
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{a.meeting?.title || "Réunion"}</p>
                          <p className="text-xs text-slate-500">{a.meeting?.date ? new Date(a.meeting.date).toLocaleDateString("fr-FR") : ""}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${a.isPresent ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {a.isPresent ? "Présent" : "Absent"}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

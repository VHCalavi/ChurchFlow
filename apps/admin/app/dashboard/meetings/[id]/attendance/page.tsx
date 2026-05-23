"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "../../../../../components/layout/dashboard-layout";
import { ArrowLeft, CheckCircle, XCircle, Clock, Search, Save, Users } from "lucide-react";

type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED";

interface AttendeeRow {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  grade: string | null;
  isPresent: boolean | null;
  notes: string | null;
  // local state for UI
  currentStatus: AttendanceStatus | null;
}

interface MeetingInfo { id: string; title: string; date: string; type: string; location: string | null; }
interface Stats { totalMembers: number; totalRecorded: number; presentCount: number; attendanceRate: number; }

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<MeetingInfo | null>(null);
  const [rows, setRows] = useState<AttendeeRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const notify = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/meetings/${meetingId}/attendance`);
      const data = await res.json();
      if (data.success) {
        setMeeting(data.data.meeting);
        setStats(data.data.stats);
        setRows(data.data.sheet.map((m: AttendeeRow & { isPresent: boolean | null }) => ({
          ...m,
          currentStatus: m.isPresent === true ? "PRESENT" : m.isPresent === false ? "ABSENT" : null,
        })));
      }
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  function setStatus(memberId: string, s: AttendanceStatus) {
    setRows(prev => prev.map(r => r.id === memberId ? { ...r, currentStatus: s } : r));
  }

  function markAll(s: AttendanceStatus) {
    setRows(prev => prev.map(r => ({ ...r, currentStatus: s })));
  }

  async function handleSave() {
    const payload = rows
      .filter(r => r.currentStatus !== null)
      .map(r => ({ memberId: r.id, isPresent: r.currentStatus === "PRESENT", notes: r.currentStatus === "EXCUSED" ? "Excusé" : null }));

    if (payload.length === 0) { notify("Aucune présence à enregistrer.", "error"); return; }

    try {
      setSaving(true);
      const res = await fetch(`/api/v1/meetings/${meetingId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendees: payload }),
      });
      const data = await res.json();
      if (data.success) { notify(data.message, "success"); loadAttendance(); }
      else notify(data.error || "Erreur", "error");
    } catch { notify("Erreur de connexion", "error"); }
    finally { setSaving(false); }
  }

  const filtered = rows.filter(r =>
    `${r.firstName} ${r.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = rows.filter(r => r.currentStatus === "PRESENT").length;
  const totalMarked = rows.filter(r => r.currentStatus !== null).length;

  return (
    <DashboardLayout title="Feuille d'Émargement">
      {notification && (
        <div className={`fixed top-24 right-8 z-50 px-4 py-3 rounded-xl border shadow-premium text-sm font-semibold animate-fade-in ${notification.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {notification.message}
        </div>
      )}

      {/* Back */}
      <button onClick={() => router.push("/dashboard/meetings")} className="flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /><span>Retour aux Réunions</span>
      </button>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {/* Meeting Info + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 p-5 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Réunion</p>
              <h2 className="text-lg font-bold text-slate-900">{meeting?.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{meeting?.date ? new Date(meeting.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""}</p>
              {meeting?.location && <p className="text-xs text-slate-400 mt-0.5">{meeting.location}</p>}
            </div>
            {[
              { label: "Présents (session)", value: presentCount, color: "text-emerald-600" },
              { label: "Enregistrés", value: totalMarked, color: "text-primary" },
              { label: "Taux (enregistré)", value: `${stats?.attendanceRate ?? 0}%`, color: "text-secondary" },
            ].map(s => (
              <div key={s.label} className="p-5 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un membre..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => markAll("PRESENT")} className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all">Tout présent</button>
              <button onClick={() => markAll("ABSENT")} className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all">Tout absent</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /><span>{saving ? "Enregistrement..." : "Enregistrer"}</span>
              </button>
            </div>
          </div>

          {/* Attendance list */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{filtered.length} membre(s)</p>
            </div>
            {filtered.length === 0 ? (
              <p className="text-center py-10 text-sm text-slate-500">Aucun résultat.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map(row => (
                  <div key={row.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center font-bold text-sm border border-primary/10">
                        {row.firstName[0]}{row.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{row.firstName} {row.lastName}</p>
                        <p className="text-xs text-slate-500">{row.status}{row.grade ? ` — ${row.grade}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(["PRESENT", "ABSENT", "EXCUSED"] as AttendanceStatus[]).map(s => {
                        const active = row.currentStatus === s;
                        const cfg = {
                          PRESENT: { icon: <CheckCircle className="w-4 h-4" />, activeClass: "bg-emerald-500 text-white border-emerald-500", label: "P" },
                          ABSENT:  { icon: <XCircle className="w-4 h-4" />,    activeClass: "bg-red-500 text-white border-red-500",     label: "A" },
                          EXCUSED: { icon: <Clock className="w-4 h-4" />,      activeClass: "bg-amber-400 text-white border-amber-400",  label: "E" },
                        }[s];
                        return (
                          <button key={s} onClick={() => setStatus(row.id, s)}
                            title={s === "PRESENT" ? "Présent" : s === "ABSENT" ? "Absent" : "Excusé"}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg border-2 transition-all ${active ? cfg.activeClass : "border-slate-200 text-slate-400 hover:border-slate-300"}`}>
                            {cfg.icon}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

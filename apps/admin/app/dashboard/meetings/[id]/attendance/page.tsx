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
          // null = EXCUSED, true = PRESENT, false = ABSENT
          currentStatus: m.isPresent === true ? "PRESENT" : m.isPresent === false ? "ABSENT" : m.isPresent === null && m.notes !== null ? "EXCUSED" : null,
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
      .map(r => ({
        memberId: r.id,
        // PRESENT → true, ABSENT → false, EXCUSED → null
        isPresent: r.currentStatus === "PRESENT" ? true : r.currentStatus === "EXCUSED" ? null : false,
        notes: r.currentStatus === "EXCUSED" ? "Excusé" : null,
      }));

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
      <button onClick={() => router.push("/dashboard/meetings")} className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /><span>Retour aux Réunions</span>
      </button>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-8">
          {/* Meeting Info + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 horizon-card p-6">
              <p className="text-sm font-bold text-foreground mb-1">Réunion</p>
              <h2 className="text-base font-bold text-foreground">{meeting?.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{meeting?.date ? new Date(meeting.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""}</p>
              {meeting?.location && <p className="text-sm text-muted-foreground mt-0.5">{meeting.location}</p>}
            </div>
            {[
              { label: "Présents (session)", value: presentCount, color: "text-emerald-600" },
              { label: "Enregistrés", value: totalMarked, color: "text-primary" },
              { label: "Taux (enregistré)", value: `${stats?.attendanceRate ?? 0}%`, color: "text-muted-foreground" },
            ].map(s => (
              <div key={s.label} className="horizon-card p-6 flex flex-col justify-between">
                <p className="text-sm font-bold text-foreground">{s.label}</p>
                <p className={`text-2xl font-bold text-foreground ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 horizon-card p-6">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un membre..." className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all" />
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => markAll("PRESENT")} className="btn-horizon btn-horizon-secondary">Tout présent</button>
              <button onClick={() => markAll("ABSENT")} className="btn-horizon btn-horizon-danger">Tout absent</button>
              <button onClick={handleSave} disabled={saving} className="btn-horizon btn-horizon-primary">
                <Save className="w-3.5 h-3.5" /><span>{saving ? "Enregistrement..." : "Enregistrer"}</span>
              </button>
            </div>
          </div>

          {/* Attendance list */}
          <div className="horizon-card !p-0 overflow-hidden">
            <div className="px-6 py-3 border-b border-border text-muted-foreground flex items-center space-x-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">{filtered.length} membre(s)</p>
            </div>
            {filtered.length === 0 ? (
              <p className="text-center py-10 text-sm text-muted-foreground">Aucun résultat.</p>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(row => (
                  <div key={row.id} className="flex items-center justify-between px-6 py-3 hover:bg-background/60 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold text-sm border border-primary/10">
                        {row.firstName[0]}{row.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{row.firstName} {row.lastName}</p>
                        <p className="text-sm text-muted-foreground">{row.status}{row.grade ? ` — ${row.grade}` : ""}</p>
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
                            className={`w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all ${active ? cfg.activeClass : "border-border text-muted-foreground hover:border-border"}`}>
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

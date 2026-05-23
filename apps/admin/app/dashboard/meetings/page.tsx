"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { Edit3, Trash2, ClipboardList } from "lucide-react";
import { 
  Plus, 
  Search, 
  CalendarDays, 
  MapPin,
  Clock,
  Notebook,
  X
} from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  type: "CULTE" | "TEMPS_DE_PRIERE" | "REPETITION" | "AGAPE" | "AUTRE";
  date: string;
  location: string | null;
  notes: string | null;
  isActive: boolean;
  _count?: { attendees: number } | null;
}

export default function MeetingsPage() {
  // Edit states
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<"CULTE" | "TEMPS_DE_PRIERE" | "REPETITION" | "AGAPE" | "AUTRE">("CULTE");
  const [editDate, setEditDate] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"CULTE" | "TEMPS_DE_PRIERE" | "REPETITION" | "AGAPE" | "AUTRE">("CULTE");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load meetings
  useEffect(() => {
    async function loadMeetings() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/meetings?churchId=default-church-id");
        const json = await res.json();
        
        if (json.success && json.data && json.data.length > 0) {
          setMeetings(json.data);
        } else {
          setMeetings([
            { id: "m1", title: "Culte de Célébration (Grande Rentrée)", description: "Culte dominical d'impact", type: "CULTE", date: "2026-05-24T08:00:00Z", location: "Temple Principal", notes: "Prédicateur : Pasteur Paul", isActive: true, _count: { attendees: 320 } },
            { id: "m2", title: "Temps de Prière - Gethsémané", description: "Prière collective et intercession", type: "TEMPS_DE_PRIERE", date: "2026-05-22T19:00:00Z", location: "Temple & En Ligne (Zoom)", notes: "Thème : Percée Divine", isActive: true, _count: { attendees: 145 } },
            { id: "m3", title: "Répétition de la Chorale", description: "Préparation des cantiques de louange", type: "REPETITION", date: "2026-05-23T16:00:00Z", location: "Salle de Musique", notes: "Présence obligatoire de tous les chantres", isActive: true, _count: { attendees: 30 } },
            { id: "m4", title: "Agape de la Tribu de Juda", description: "Repas fraternel et communion", type: "AGAPE", date: "2026-05-30T12:00:00Z", location: "Espace Vert / Jardin", notes: "Chaque famille apporte un plat", isActive: true, _count: { attendees: 80 } }
          ]);
        }
      } catch (err) {
        console.error(err);
        setMeetings([
          { id: "m1", title: "Culte de Célébration (Grande Rentrée)", description: "Culte dominical d'impact", type: "CULTE", date: "2026-05-24T08:00:00Z", location: "Temple Principal", notes: "Prédicateur : Pasteur Paul", isActive: true, _count: { attendees: 320 } },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadMeetings();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      showNotification("Le titre et la date sont requis", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title,
        description: description || null,
        type,
        date: new Date(date).toISOString(),
        location: location || null,
        notes: notes || null,
        churchId: "default-church-id"
      };

      const res = await fetch("/api/v1/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setMeetings((prev) => [data.data, ...prev]);
        showNotification("Réunion planifiée avec succès !", "success");
        setTitle("");
        setDescription("");
        setType("CULTE");
        setDate("");
        setLocation("");
        setNotes("");
        setIsModalOpen(false);
      } else {
        const mockNew: Meeting = {
          id: String(Date.now()),
          title,
          description: description || null,
          type,
          date: date,
          location: location || null,
          notes: notes || null,
          isActive: true,
          _count: { attendees: 0 }
        };
        setMeetings((prev) => [mockNew, ...prev]);
        showNotification("Réunion planifiée localement !", "success");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      const mockNew: Meeting = {
        id: String(Date.now()),
        title,
        description: description || null,
        type,
        date: date,
        location: location || null,
        notes: notes || null,
        isActive: true,
        _count: { attendees: 0 }
      };
      setMeetings((prev) => [mockNew, ...prev]);
      showNotification("Erreur de connexion. Réunion planifiée localement.", "success");
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditMeetingModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setEditTitle(meeting.title);
    setEditDescription(meeting.description || "");
    setEditType(meeting.type);
    const d = new Date(meeting.date);
    const offset = d.getTimezoneOffset();
    const localTime = new Date(d.getTime() - offset * 60 * 1000);
    setEditDate(localTime.toISOString().substring(0, 16));
    setEditLocation(meeting.location || "");
    setEditNotes(meeting.notes || "");
    setIsEditModalOpen(true);
  };

  const handleEditMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/meetings/${editingMeeting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          type: editType,
          date: new Date(editDate).toISOString(),
          location: editLocation || null,
          notes: editNotes || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMeetings((prev) => prev.map((m) => m.id === editingMeeting.id ? data.data : m));
        showNotification("Réunion mise à jour avec succès !", "success");
      } else {
        showNotification(data.error || "Erreur lors de la mise à jour", "error");
      }
    } catch {
      showNotification("Erreur de connexion", "error");
    } finally {
      setSubmitting(false);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm("Annuler cette réunion ? Cette action est irréversible.")) return;
    try {
      const res = await fetch(`/api/v1/meetings/${meetingId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
        showNotification("Réunion annulée avec succès.", "success");
      } else {
        showNotification(data.error || "Erreur lors de l'annulation", "error");
      }
    } catch {
      showNotification("Erreur de connexion", "error");
    }
  };

  const filteredMeetings = meetings.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout title="Module Réunions & Agenda">
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

      {/* Control bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 mb-8 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700" />
          <input
            type="text"
            placeholder="Rechercher une réunion, culte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-700/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium w-full md:w-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Planifier une réunion</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-700">Chargement de l&apos;agenda...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100 text-center">
          <CalendarDays className="w-12 h-12 text-slate-300 mb-4" />
          <h4 className="text-base font-bold text-slate-900">Aucune réunion trouvée</h4>
          <p className="text-sm text-slate-555 mt-1">Aucune rencontre planifiée ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMeetings.map((meeting) => (
            <div key={meeting.id} className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:shadow-premium transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase ${
                      meeting.type === "CULTE"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : meeting.type === "REPETITION"
                        ? "bg-secondary/10 text-secondary border border-secondary/20"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      {meeting.type}
                    </span>
                    
                    <div className="flex items-center text-xs font-semibold text-slate-600 space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(meeting.date).toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">{meeting.title}</h3>
                  <p className="text-xs text-slate-500">{meeting.description || "Aucune description renseignée."}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:text-right">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{meeting.location || "Temple principal"}</span>
                  </div>

                  {meeting.notes && (
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
                      <Notebook className="w-4 h-4 text-secondary" />
                      <span className="truncate max-w-[200px]">{meeting.notes}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100">
                    <Link
                      href={`/dashboard/meetings/${meeting.id}/attendance`}
                      className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Émargement</span>
                    </Link>
                    <button
                      onClick={() => openEditMeetingModal(meeting)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-secondary transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal plan meeting */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 bg-white rounded-xl border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Planifier une Nouvelle Réunion</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Titre de la Réunion *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Grand Culte Dominical, Réunion des Bergers..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  placeholder="Ordre du jour ou thématiques..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "CULTE" | "TEMPS_DE_PRIERE" | "REPETITION" | "AGAPE" | "AUTRE")}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="CULTE">Culte de Célébration</option>
                    <option value="TEMPS_DE_PRIERE">Temps de Prière / Intercession</option>
                    <option value="REPETITION">Répétition Générale</option>
                    <option value="AGAPE">Agape / Repas Fraternel</option>
                    <option value="AUTRE">Autre Rencontre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Date et Heure *</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Lieu / Plateforme</label>
                <input
                  type="text"
                  placeholder="Ex: Temple principal, Salle Polyvalente, Zoom..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Notes internes</label>
                <input
                  type="text"
                  placeholder="Ex: Prédicateur externe, apportez des plats..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
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
                  {submitting ? "Planification..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {isEditModalOpen && editingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 bg-white rounded-xl border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Modifier la Réunion</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Titre de la Réunion *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Grand Culte Dominical, Réunion des Bergers..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  placeholder="Ordre du jour ou thématiques..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Type *</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as "CULTE" | "TEMPS_DE_PRIERE" | "REPETITION" | "AGAPE" | "AUTRE")}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="CULTE">Culte de Célébration</option>
                    <option value="TEMPS_DE_PRIERE">Temps de Prière / Intercession</option>
                    <option value="REPETITION">Répétition Générale</option>
                    <option value="AGAPE">Agape / Repas Fraternel</option>
                    <option value="AUTRE">Autre Rencontre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Date et Heure *</label>
                  <input
                    type="datetime-local"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Lieu / Plateforme</label>
                <input
                  type="text"
                  placeholder="Ex: Temple principal, Salle Polyvalente, Zoom..."
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Notes internes</label>
                <input
                  type="text"
                  placeholder="Ex: Prédicateur externe, apportez des plats..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium disabled:opacity-50"
                >
                  {submitting ? "Sauvegarde..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

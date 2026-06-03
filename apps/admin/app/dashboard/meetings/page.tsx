"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { MeetingsAttendanceChart } from "../../../components/dashboard/MeetingsAttendanceChart";
import { Edit3, Trash2, ClipboardList, Copy } from "lucide-react";
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
  tags: string[];
  groupIds?: string[];
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
  const [activeTab, setActiveTab] = useState<"stats" | "manage">("stats");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"CULTE" | "TEMPS_DE_PRIERE" | "REPETITION" | "AGAPE" | "AUTRE">("CULTE");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editNewTag, setEditNewTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Groups states
  const [groups, setGroups] = useState<{ id: string; name: string; type: string }[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [editSelectedGroupIds, setEditSelectedGroupIds] = useState<string[]>([]);
  const [filterGroupIds, setFilterGroupIds] = useState<string[]>([]);

  const handleDuplicateMeeting = (meeting: Meeting) => {
    setTitle(`${meeting.title} (Copie)`);
    setDescription(meeting.description || "");
    setType(meeting.type);
    
    const d = new Date(meeting.date);
    const offset = d.getTimezoneOffset();
    const localTime = new Date(d.getTime() - offset * 60 * 1000);
    setDate(localTime.toISOString().substring(0, 16));
    
    setLocation(meeting.location || "");
    setNotes(meeting.notes || "");
    setTags([...meeting.tags]);
    setSelectedGroupIds([...(meeting.groupIds || [])]);
    setIsModalOpen(true);
  };

  // Load meetings and groups
  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await fetch("/api/v1/groups");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setGroups(json.data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des groupes:", err);
      }
    }

    async function loadMeetings() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/meetings?churchId=default-church-id");
        const json = await res.json();
        
        if (json.success && json.data && json.data.length > 0) {
          setMeetings(json.data);

          // Extraire tous les tags uniques
          const allTagsSet = new Set<string>();
          json.data.forEach((meeting: Meeting) => {
            meeting.tags?.forEach((tag: string) => allTagsSet.add(tag));
          });
          setAllTags(Array.from(allTagsSet));
        } else {
          const mockMeetings: Meeting[] = [
            { id: "m1", title: "Culte de Célébration (Grande Rentrée)", description: "Culte dominical d'impact", type: "CULTE", date: "2026-05-24T08:00:00Z", location: "Temple Principal", notes: "Prédicateur : Pasteur Paul", isActive: true, tags: ["Louange", "Celebration"], _count: { attendees: 320 } },
            { id: "m2", title: "Temps de Prière - Gethsémané", description: "Prière collective et intercession", type: "TEMPS_DE_PRIERE", date: "2026-05-22T19:00:00Z", location: "Temple & En Ligne (Zoom)", notes: "Thème : Percée Divine", isActive: true, tags: ["Priere", "Intercession"], _count: { attendees: 145 } },
            { id: "m3", title: "Répétition de la Chorale", description: "Préparation des cantiques de louange", type: "REPETITION", date: "2026-05-23T16:00:00Z", location: "Salle de Musique", notes: "Présence obligatoire de tous les chantres", isActive: true, tags: ["Musique", "Louange"], _count: { attendees: 30 } },
            { id: "m4", title: "Agape de la Tribu de Juda", description: "Repas fraternel et communion", type: "AGAPE", date: "2026-05-30T12:00:00Z", location: "Espace Vert / Jardin", notes: "Chaque famille apporte un plat", isActive: true, tags: ["Communauté", "Repas"], _count: { attendees: 80 } }
          ];
          setMeetings(mockMeetings);

          // Extraire tous les tags uniques
          const allTagsSet = new Set<string>();
          mockMeetings.forEach(meeting => {
            meeting.tags.forEach(tag => allTagsSet.add(tag));
          });
          setAllTags(Array.from(allTagsSet));
        }
      } catch (err) {
        console.error(err);
        const mockMeetings: Meeting[] = [
          { id: "m1", title: "Culte de Célébration (Grande Rentrée)", description: "Culte dominical d'impact", type: "CULTE", date: "2026-05-24T08:00:00Z", location: "Temple Principal", notes: "Prédicateur : Pasteur Paul", isActive: true, tags: ["Louange", "Celebration"], _count: { attendees: 320 } },
        ];
        setMeetings(mockMeetings);

        // Extraire tous les tags uniques
        const allTagsSet = new Set<string>();
        mockMeetings.forEach(meeting => {
          meeting.tags.forEach(tag => allTagsSet.add(tag));
        });
        setAllTags(Array.from(allTagsSet));
      } finally {
        setLoading(false);
      }
    }
    loadGroups();
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
        tags,
        groupIds: selectedGroupIds,
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
        setTags([]);
        setSelectedGroupIds([]);
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
          tags,
          groupIds: selectedGroupIds,
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
        tags,
        groupIds: selectedGroupIds,
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
    setEditTags([...meeting.tags]);
    setEditSelectedGroupIds([...(meeting.groupIds || [])]);
    setEditNewTag("");
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
          tags: editTags,
          groupIds: editSelectedGroupIds,
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

  const filteredMeetings = meetings.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGroup = filterGroupIds.length === 0 ||
      (m.groupIds && m.groupIds.some(id => filterGroupIds.includes(id)));
    return matchesSearch && matchesGroup;
  });

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



      {/* Navigation Onglets */}
      <div className="flex space-x-1.5 p-1 bg-slate-100 rounded-xl max-w-md mb-8 border border-slate-200/50">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
            activeTab === "stats"
              ? "bg-white text-primary shadow-premium"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <span>Statistiques de présence</span>
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
            activeTab === "manage"
              ? "bg-white text-primary shadow-premium"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <span>Gestion des Réunions</span>
        </button>
      </div>

      {activeTab === "stats" ? (
        <div className="animate-fade-in">
          <MeetingsAttendanceChart />
        </div>
      ) : (
        <div className="animate-fade-in">

      {/* Control bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 my-8 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
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

      {/* Filtrage par groupe (comme dans les statistiques) */}
      {groups.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <h4 className="text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wider">Filtrer par Groupe invité</h4>
          <div className="flex flex-wrap gap-2">
            {groups.map(group => {
              const isSelected = filterGroupIds.includes(group.id);
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    if (isSelected) {
                      setFilterGroupIds(filterGroupIds.filter(id => id !== group.id));
                    } else {
                      setFilterGroupIds([...filterGroupIds, group.id]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {group.name}
                </button>
              );
            })}
            {filterGroupIds.length > 0 && (
              <button
                onClick={() => setFilterGroupIds([])}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-55 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      )}

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

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {meeting.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-[#12BC7E]/10 text-[#12BC7E] border border-[#12BC7E]/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Groupes Invités */}
                    {meeting.groupIds && meeting.groupIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        {meeting.groupIds.map(gid => {
                          const groupName = groups.find(g => g.id === gid)?.name || "Groupe";
                          return (
                            <span
                              key={gid}
                              className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded bg-[#006C69]/10 text-[#006C69] border border-[#006C69]/20"
                            >
                              {groupName}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs font-semibold text-slate-600 space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(meeting.date).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
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
                      onClick={() => handleDuplicateMeeting(meeting)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-primary transition-all cursor-pointer"
                      title="Dupliquer la réunion"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Tags</label>
                {/* Tags existants en suggestion */}
                {allTags.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-slate-500 mb-1">Tags existants:</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {allTags
                        .filter(tag => !tags.includes(tag))
                        .slice(0, 6) // Afficher seulement 6 tags pour ne pas surcharger
                        .map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (!tags.includes(tag)) {
                                setTags([...tags, tag]);
                              }
                            }}
                            className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            {tag}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Tags sélectionnés */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                        className="ml-1 hover:text-primary/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Ajout de tag */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ajouter un tag..."
                    className="flex-1 px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newTag.trim() && !tags.includes(newTag.trim())) {
                          setTags([...tags, newTag.trim()]);
                          setNewTag("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTag.trim() && !tags.includes(newTag.trim())) {
                        setTags([...tags, newTag.trim()]);
                        setNewTag("");
                      }
                    }}
                    className="px-3.5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 font-bold">Groupes invités</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                  {groups.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Aucun groupe disponible.</p>
                  ) : (
                    groups.map(group => {
                      const isInvited = selectedGroupIds.includes(group.id);
                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => {
                            if (isInvited) {
                              setSelectedGroupIds(selectedGroupIds.filter(id => id !== group.id));
                            } else {
                              setSelectedGroupIds([...selectedGroupIds, group.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            isInvited
                              ? "bg-primary border-primary text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {group.name}
                        </button>
                      );
                    })
                  )}
                </div>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Tags</label>
                {/* Tags existants en suggestion */}
                {allTags.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-slate-500 mb-1">Tags existants:</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {allTags
                        .filter(tag => !editTags.includes(tag))
                        .slice(0, 6) // Afficher seulement 6 tags pour ne pas surcharger
                        .map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (!editTags.includes(tag)) {
                                setEditTags([...editTags, tag]);
                              }
                            }}
                            className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            {tag}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Tags sélectionnés */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setEditTags(editTags.filter((_, i) => i !== index))}
                        className="ml-1 hover:text-primary/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Ajout de tag */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editNewTag}
                    onChange={(e) => setEditNewTag(e.target.value)}
                    placeholder="Ajouter un tag..."
                    className="flex-1 px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editNewTag.trim() && !editTags.includes(editNewTag.trim())) {
                          setEditTags([...editTags, editNewTag.trim()]);
                          setEditNewTag("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editNewTag.trim() && !editTags.includes(editNewTag.trim())) {
                        setEditTags([...editTags, editNewTag.trim()]);
                        setEditNewTag("");
                      }
                    }}
                    className="px-3.5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 font-bold">Groupes invités</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
                  {groups.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Aucun groupe disponible.</p>
                  ) : (
                    groups.map(group => {
                      const isInvited = editSelectedGroupIds.includes(group.id);
                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => {
                            if (isInvited) {
                              setEditSelectedGroupIds(editSelectedGroupIds.filter(id => id !== group.id));
                            } else {
                              setEditSelectedGroupIds([...editSelectedGroupIds, group.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            isInvited
                              ? "bg-primary border-primary text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {group.name}
                        </button>
                      );
                    })
                  )}
                </div>
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

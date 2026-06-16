"use client";

import React, { useState, useEffect } from "react";
import { MemberDetailsDrawer } from "../../../components/members/MemberDetailsDrawer";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit3, 
  Eye, 
  X,
  Users,
  ShieldAlert,
  UserPlus
} from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: "SYMPATHISANT" | "MEMBRE" | "RESPONSABLE";
  grade: string | null;
  echelon: string | null;
  isActive: boolean;
  createdAt: string;
  metadata?: {
    systemRole?: string;
  } | null;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [echelonFilter, setEchelonFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"SYMPATHISANT" | "MEMBRE" | "RESPONSABLE">("MEMBRE");
  const [grade, setGrade] = useState("");
  const [echelon, setEchelon] = useState("");
  const [systemRole, setSystemRole] = useState("MEMBRE");
  const [submitting, setSubmitting] = useState(false);
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState<"SYMPATHISANT" | "MEMBRE" | "RESPONSABLE">("MEMBRE");
  const [editGrade, setEditGrade] = useState("");
  const [editEchelon, setEditEchelon] = useState("");
  const [editSystemRole, setEditSystemRole] = useState("MEMBRE");

  // Load mock & database members
  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/members?churchId=default-church-id");
        const json = await res.json();
        
        if (json.success && json.data && json.data.length > 0) {
          setMembers(json.data);
        } else {
          setMembers([
            { id: "1", firstName: "Marc", lastName: "KOFFI", email: "marc.koffi@gmail.com", phone: "+229 97 45 89 65", status: "RESPONSABLE", grade: "Serviteur", echelon: "C10", isActive: true, createdAt: new Date().toISOString() },
            { id: "2", firstName: "Awa", lastName: "DIALLO", email: "awa.diallo@outlook.com", phone: "+229 95 12 45 78", status: "MEMBRE", grade: null, echelon: null, isActive: true, createdAt: new Date().toISOString() },
            { id: "3", firstName: "Jean-Pierre", lastName: "TANO", email: "jp.tano@gmail.com", phone: "+229 61 23 56 89", status: "RESPONSABLE", grade: "Aspirant", echelon: "C5", isActive: true, createdAt: new Date().toISOString() },
            { id: "4", firstName: "Esther", lastName: "AMON", email: "esther.amon@live.fr", phone: "+229 97 78 96 54", status: "SYMPATHISANT", grade: null, echelon: null, isActive: true, createdAt: new Date().toISOString() },
            { id: "5", firstName: "Dr. Paul", lastName: "OBIANG", email: "p.obiang@churchflow.com", phone: "+241 06 12 34 56", status: "RESPONSABLE", grade: "Pasteur titulaire", echelon: "GA C100", isActive: true, createdAt: new Date().toISOString() },
          ]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des membres:", err);
        setMembers([
          { id: "1", firstName: "Marc", lastName: "KOFFI", email: "marc.koffi@gmail.com", phone: "+229 97 45 89 65", status: "RESPONSABLE", grade: "Serviteur", echelon: "C10", isActive: true, createdAt: new Date().toISOString() },
          { id: "2", firstName: "Awa", lastName: "DIALLO", email: "awa.diallo@outlook.com", phone: "+229 95 12 45 78", status: "MEMBRE", grade: null, echelon: null, isActive: true, createdAt: new Date().toISOString() },
          { id: "3", firstName: "Jean-Pierre", lastName: "TANO", email: "jp.tano@gmail.com", phone: "+229 61 23 56 89", status: "RESPONSABLE", grade: "Aspirant", echelon: "C5", isActive: true, createdAt: new Date().toISOString() },
          { id: "4", firstName: "Esther", lastName: "AMON", email: "esther.amon@live.fr", phone: "+229 97 78 96 54", status: "SYMPATHISANT", grade: null, echelon: null, isActive: true, createdAt: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      showNotification("Le prénom et le nom sont requis", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        status,
        grade: status === "RESPONSABLE" ? grade || null : null,
        echelon: status === "RESPONSABLE" ? echelon || null : null,
        churchId: "default-church-id",
        systemRole
      };

      const res = await fetch("/api/v1/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setMembers((prev) => [data.data, ...prev]);
        showNotification("Membre ajouté avec succès !", "success");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setStatus("MEMBRE");
        setGrade("");
        setEchelon("");
        setSystemRole("MEMBRE");
        setIsModalOpen(false);
      } else {
        const mockNewMember: Member = {
          id: String(Date.now()),
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          status,
          grade: status === "RESPONSABLE" ? grade || "Aspirant" : null,
          echelon: status === "RESPONSABLE" ? echelon || "C2" : null,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        setMembers((prev) => [mockNewMember, ...prev]);
        showNotification("Membre ajouté localement !", "success");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      showNotification("Erreur de connexion. Membre ajouté localement.", "success");
      const mockNewMember: Member = {
        id: String(Date.now()),
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        status,
        grade: status === "RESPONSABLE" ? grade || "Aspirant" : null,
        echelon: status === "RESPONSABLE" ? echelon || "C2" : null,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      setMembers((prev) => [mockNewMember, ...prev]);
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setEditFirstName(member.firstName);
    setEditLastName(member.lastName);
    setEditEmail(member.email || "");
    setEditPhone(member.phone || "");
    setEditStatus(member.status);
    setEditGrade(member.grade || "");
    setEditEchelon(member.echelon || "");
    setEditSystemRole(member.metadata?.systemRole || "MEMBRE");
    setIsEditModalOpen(true);
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/members/${editingMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail || null,
          phone: editPhone || null,
          status: editStatus,
          grade: editStatus === "RESPONSABLE" ? editGrade || null : null,
          echelon: editStatus === "RESPONSABLE" ? editEchelon || null : null,
          systemRole: editSystemRole
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) => prev.map((m) => m.id === editingMember.id ? data.data : m));
        showNotification("Membre mis à jour avec succès !", "success");
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

  // Archive modal states
  const [memberToArchive, setMemberToArchive] = useState<Member | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const triggerArchiveMember = (member: Member) => {
    setMemberToArchive(member);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!memberToArchive) return;
    try {
      setArchiving(true);
      const res = await fetch(`/api/v1/members/${memberToArchive.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) => prev.filter((m) => m.id !== memberToArchive.id));
        showNotification("Membre archivé avec succès.", "success");
      } else {
        showNotification(data.error || "Erreur lors de l'archivage", "error");
      }
    } catch {
      showNotification("Erreur de connexion", "error");
    } finally {
      setArchiving(false);
      setIsArchiveModalOpen(false);
      setMemberToArchive(null);
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.phone && member.phone.includes(searchTerm));
    const matchesStatus = statusFilter === "ALL" || member.status === statusFilter;
    const matchesGrade = gradeFilter === "ALL" || member.grade === gradeFilter;
    const matchesEchelon = echelonFilter === "ALL" || member.echelon === echelonFilter;
    return matchesSearch && matchesStatus && matchesGrade && matchesEchelon;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <DashboardLayout title="Gestion des Membres">
      <div className="w-full">
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

      {/* Header Cards stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registre</span>
            <div className="p-2.5 rounded-lg bg-primary/5 text-primary border border-primary/10">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{members.length}</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Membres et sympathisants actifs</p>
        </div>

        <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Responsables</span>
            <div className="p-2.5 rounded-lg bg-secondary/5 text-secondary border border-secondary/10">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">
            {members.filter(m => m.status === "RESPONSABLE").length}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Superviseurs, Serviteurs & Pasteurs</p>
        </div>

        <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sympathisants</span>
            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">
            {members.filter(m => m.status === "SYMPATHISANT").length}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Nouveaux arrivants et visiteurs</p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 mb-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, tél..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-700/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                if (e.target.value !== "RESPONSABLE") {
                  setGradeFilter("ALL");
                  setEchelonFilter("ALL");
                }
              }}
              className="pl-9 pr-8 py-2.5 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-all"
            >
              <option value="ALL">Tous les Statuts</option>
              <option value="RESPONSABLE">Responsables</option>
              <option value="MEMBRE">Membres</option>
              <option value="SYMPATHISANT">Sympathisants</option>
            </select>
          </div>

          {statusFilter === "RESPONSABLE" && (
            <>
              <div className="relative">
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-3 py-2.5 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-all"
                >
                  <option value="ALL">Tous les Grades</option>
                  <option value="ASPIRANT">Aspirant</option>
                  <option value="SERVITEUR">Serviteur</option>
                  <option value="GAGNEUR_AMES">Gagneur d&apos;âmes</option>
                  <option value="ASSISTANT_PASTEUR">Assistant Pasteur</option>
                  <option value="PASTEUR_ASSISTANT">Pasteur Assistant</option>
                  <option value="PASTEUR_TITULAIRE">Pasteur Titulaire</option>
                </select>
              </div>

              <div className="relative">
                <select
                  value={echelonFilter}
                  onChange={(e) => setEchelonFilter(e.target.value)}
                  className="px-3 py-2.5 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-all"
                >
                  <option value="ALL">Tous les Échelons</option>
                  <option value="C2">C2</option>
                  <option value="C5">C5</option>
                  <option value="C10">C10</option>
                  <option value="C20">C20</option>
                  <option value="GA_C50">GA C50</option>
                  <option value="GA_C100">GA C100</option>
                </select>
              </div>
            </>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Ajouter un membre</span>
          </button>
        </div>
      </div>

      {/* Members table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-700">Chargement du registre...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-12 h-12 text-slate-300 mb-4" />
            <h4 className="text-base font-bold text-slate-900">Aucun membre trouvé</h4>
            <p className="text-sm text-slate-500 mt-1">Essayez d&apos;ajuster vos critères de recherche ou de filtres.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Nom Complet</th>
                    <th className="py-4 px-6">Statut</th>
                    <th className="py-4 px-6">Hiérarchie</th>
                    <th className="py-4 px-6">Contact</th>
                    <th className="py-4 px-6">Date d&apos;inscription</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {paginatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center font-bold text-primary border border-primary/10">
                            {member.firstName[0]}{member.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{member.firstName} {member.lastName}</p>
                            <p className="text-xs text-slate-500">{member.email || "Pas d'email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
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
                      <td className="py-4 px-6">
                        {member.status === "RESPONSABLE" && member.grade ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded font-semibold text-primary border border-slate-200">
                              {member.grade}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded font-semibold text-secondary border border-slate-200">
                              {member.echelon}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-800 text-xs font-semibold">{member.phone || "Non renseigné"}</td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {new Date(member.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => setViewingMemberId(member.id)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-primary transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-secondary transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerArchiveMember(member)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs font-semibold text-slate-500">
                  Page {currentPage} sur {totalPages} ({filteredMembers.length} membres)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 bg-white rounded-xl border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Ajouter un Nouveau Membre</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Nom de Famille *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  placeholder="+229 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Statut Ecclésiastique *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "SYMPATHISANT" | "MEMBRE" | "RESPONSABLE")}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                >
                  <option value="SYMPATHISANT">Sympathisant (Visiteur)</option>
                  <option value="MEMBRE">Membre (Fidèle)</option>
                  <option value="RESPONSABLE">Responsable (Directeur / Berger / Pasteur)</option>
                </select>
              </div>

              {/* Conditional Responsable Fields */}
              {status === "RESPONSABLE" && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">Grade *</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Aspirant">Aspirant</option>
                      <option value="Serviteur">Serviteur</option>
                      <option value="Gagneur d'âmes">Gagneur d&apos;âmes</option>
                      <option value="Assistant Pasteur">Assistant Pasteur</option>
                      <option value="Pasteur Assistant">Pasteur Assistant</option>
                      <option value="Pasteur titulaire">Pasteur titulaire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">Échelon *</label>
                    <select
                      value={echelon}
                      onChange={(e) => setEchelon(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="C2">C2</option>
                      <option value="C5">C5</option>
                      <option value="C10">C10</option>
                      <option value="C20">C20</option>
                      <option value="GA C50">GA C50</option>
                      <option value="GA C100">GA C100</option>
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Rôle Système *</label>
                <select
                  value={systemRole}
                  onChange={(e) => setSystemRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                >
                  <option value="MEMBRE">Membre (Fidèle)</option>
                  <option value="RESPONSABLE_GEM">Responsable de GEM</option>
                  <option value="TRESORIER">Trésorier</option>
                  <option value="PASTEUR">Pasteur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
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
                  {submitting ? "Création..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 bg-white rounded-xl border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Modifier — {editingMember.firstName} {editingMember.lastName}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Prénom *</label>
                  <input type="text" required value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Nom *</label>
                  <input type="text" required value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Téléphone</label>
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Statut *</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as "SYMPATHISANT" | "MEMBRE" | "RESPONSABLE")} className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                  <option value="SYMPATHISANT">Sympathisant</option>
                  <option value="MEMBRE">Membre</option>
                  <option value="RESPONSABLE">Responsable</option>
                </select>
              </div>
              {editStatus === "RESPONSABLE" && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div>
                    <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">Grade *</label>
                    <select value={editGrade} onChange={(e) => setEditGrade(e.target.value)} required className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                      <option value="">Sélectionner...</option>
                      <option value="ASPIRANT">Aspirant</option>
                      <option value="SERVITEUR">Serviteur</option>
                      <option value="GAGNEUR_AMES">Gagneur d&apos;âmes</option>
                      <option value="ASSISTANT_PASTEUR">Assistant Pasteur</option>
                      <option value="PASTEUR_ASSISTANT">Pasteur Assistant</option>
                      <option value="PASTEUR_TITULAIRE">Pasteur Titulaire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">Échelon *</label>
                    <select value={editEchelon} onChange={(e) => setEditEchelon(e.target.value)} required className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                      <option value="">Sélectionner...</option>
                      <option value="C2">C2</option>
                      <option value="C5">C5</option>
                      <option value="C10">C10</option>
                      <option value="C20">C20</option>
                      <option value="GA_C50">GA C50</option>
                      <option value="GA_C100">GA C100</option>
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Rôle Système *</label>
                <select
                  value={editSystemRole}
                  onChange={(e) => setEditSystemRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                >
                  <option value="MEMBRE">Membre (Fidèle)</option>
                  <option value="RESPONSABLE_GEM">Responsable de GEM</option>
                  <option value="TRESORIER">Trésorier</option>
                  <option value="PASTEUR">Pasteur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all">Annuler</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium disabled:opacity-50">{submitting ? "Sauvegarde..." : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Archive Confirmation Modal */}
      {isArchiveModalOpen && memberToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-white rounded-xl border border-slate-100 shadow-premium text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4 animate-bounce">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-2">Archiver le membre ?</h3>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir archiver <span className="font-bold text-slate-800">{memberToArchive.firstName} {memberToArchive.lastName}</span> ? <br />
              Cette action est réversible, mais il ne sera plus visible dans la liste active.
            </p>

            <div className="flex items-center justify-center space-x-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsArchiveModalOpen(false);
                  setMemberToArchive(null);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={archiving}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-premium disabled:opacity-50"
              >
                {archiving ? "Archivage..." : "Archiver"}
              </button>
            </div>
          </div>
        </div>
      )}

      <MemberDetailsDrawer memberId={viewingMemberId} onClose={() => setViewingMemberId(null)} />
      </div>
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { MemberDetailsDrawer } from "../../../components/members/MemberDetailsDrawer";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { StatCard } from "../../../components/ui/stat-card";

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
        <div className={`fixed top-24 right-8 z-50 flex items-center px-4 py-3 rounded-2xl shadow-horizon-sm animate-fade-in-up ${
          notification.type === "success" 
            ? "bg-[#E6FAF5] text-[#01B574]" 
            : "bg-[#FEEFEE] text-[#EE5D50]"
        }`}>
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      {/* Header Cards stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Registre"
          value={String(members.length)}
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-[#F2EFFF] dark:bg-navy-700"
          iconColorClass="text-[#422AFB] dark:text-white"
        />

        <StatCard
          title="Responsables"
          value={String(members.filter(m => m.status === "RESPONSABLE").length)}
          icon={<ShieldAlert className="w-5 h-5" />}
          iconBg="bg-[#FFF6DA] dark:bg-navy-700"
          iconColorClass="text-[#FFB547] dark:text-[#FFB547]"
        />

        <StatCard
          title="Sympathisants"
          value={String(members.filter(m => m.status === "SYMPATHISANT").length)}
          icon={<UserPlus className="w-5 h-5" />}
          iconBg="bg-[#E6FAF5] dark:bg-navy-700"
          iconColorClass="text-[#01B574] dark:text-[#01B574]"
        />
      </div>

      {/* Control bar */}
      <div className="horizon-card flex flex-col md:flex-row items-center justify-between gap-4 p-5 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3AED0]" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, tél..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3AED0]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                if (e.target.value !== "RESPONSABLE") {
                  setGradeFilter("ALL");
                  setEchelonFilter("ALL");
                }
              }}
              className="pl-10 pr-8 py-2.5 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all [&>option]:bg-card [&>option]:text-foreground"
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
                  className="px-4 py-2.5 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all [&>option]:bg-card [&>option]:text-foreground"
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
                  className="px-4 py-2.5 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all [&>option]:bg-card [&>option]:text-foreground"
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
            className="btn-horizon btn-horizon-primary flex items-center justify-center space-x-2 rounded-full !py-2.5 !px-5"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un membre</span>
          </button>
        </div>
      </div>

      {/* Members table */}
      <div className="horizon-card overflow-hidden !p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-foreground">Chargement du registre...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h4 className="text-base font-bold text-foreground">Aucun membre trouvé</h4>
            <p className="text-sm text-muted-foreground mt-1">Essayez d&apos;ajuster vos critères de recherche ou de filtres.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-sm font-medium">
                    <th className="py-4 px-6">Nom Complet</th>
                    <th className="py-4 px-6">Statut</th>
                    <th className="py-4 px-6">Hiérarchie</th>
                    <th className="py-4 px-6">Contact</th>
                    <th className="py-4 px-6">Date d&apos;inscription</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm font-medium text-foreground">
                  {paginatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-background/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#F2EFFF] dark:bg-navy-700 flex items-center justify-center font-bold text-sm text-[#422AFB] dark:text-white flex-shrink-0">
                            {member.firstName[0]}{member.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-tight">{member.firstName} {member.lastName}</p>
                            <p className="text-xs font-normal text-[#A3AED0] mt-0.5">{member.email || "Pas d'email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                          member.status === "RESPONSABLE"
                            ? "bg-[#F2EFFF] text-[#422AFB] dark:bg-brand-400/10 dark:text-brand-400"
                            : member.status === "MEMBRE"
                            ? "bg-[#E6FAF5] text-[#01B574] dark:bg-green-500/10 dark:text-green-500"
                            : "bg-[#FFF6DA] text-[#FFB547] dark:bg-amber-500/10 dark:text-amber-500"
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {member.status === "RESPONSABLE" && member.grade ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] px-3 py-1 bg-[#F4F7FE] dark:bg-[#0B1437] text-foreground rounded-full font-bold">
                              {member.grade}
                            </span>
                            <span className="text-[11px] px-3 py-1 bg-primary/10 text-primary rounded-full font-bold">
                              {member.echelon}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#A3AED0] text-xs font-normal">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-foreground text-sm font-bold">{member.phone || "Non renseigné"}</td>
                      <td className="py-4 px-6 text-[#A3AED0] text-sm font-medium">
                        {new Date(member.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-1">
                          <button onClick={() => setViewingMemberId(member.id)} className="p-2 rounded-xl bg-transparent hover:bg-[#F2EFFF] dark:hover:bg-navy-700 text-[#A3AED0] hover:text-[#422AFB] dark:hover:text-white transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-2 rounded-xl bg-transparent hover:bg-[#FFF6DA] dark:hover:bg-navy-700 text-[#A3AED0] hover:text-[#FFB547] transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerArchiveMember(member)}
                            className="p-2 rounded-xl bg-transparent hover:bg-[#FEEFEE] dark:hover:bg-navy-700 text-[#A3AED0] hover:text-[#EE5D50] transition-all"
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
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Page {currentPage} sur {totalPages} ({filteredMembers.length} membres)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-background text-foreground hover:opacity-80 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-7 bg-card rounded-[20px] shadow-horizon-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-base font-extrabold text-foreground">Ajouter un Nouveau Membre</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Nom de Famille *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  placeholder="+229 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Statut Ecclésiastique *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "SYMPATHISANT" | "MEMBRE" | "RESPONSABLE")}
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all cursor-pointer [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white"
                >
                  <option value="SYMPATHISANT">Sympathisant (Visiteur)</option>
                  <option value="MEMBRE">Membre (Fidèle)</option>
                  <option value="RESPONSABLE">Responsable (Directeur / Berger / Pasteur)</option>
                </select>
              </div>

              {/* Conditional Responsable Fields */}
              {status === "RESPONSABLE" && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-3xl bg-[#F4F7FE]/50 dark:bg-[#0B1437]/50 border border-[#E0E5F2] dark:border-white/5 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Grade *</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                      className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all cursor-pointer [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white"
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
                    <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Échelon *</label>
                    <select
                      value={echelon}
                      onChange={(e) => setEchelon(e.target.value)}
                      required
                      className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all cursor-pointer [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white"
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
                <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Rôle Système *</label>
                <select
                  value={systemRole}
                  onChange={(e) => setSystemRole(e.target.value)}
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all cursor-pointer [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white"
                >
                  <option value="MEMBRE">Membre (Fidèle)</option>
                  <option value="RESPONSABLE_GEM">Responsable de GEM</option>
                  <option value="TRESORIER">Trésorier</option>
                  <option value="PASTEUR">Pasteur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-horizon btn-horizon-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-horizon btn-horizon-primary disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-7 bg-card rounded-[20px] shadow-horizon-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-base font-extrabold text-foreground">Modifier — {editingMember.firstName} {editingMember.lastName}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 rounded-xl hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
             <form onSubmit={handleEditMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Prénom *</label>
                  <input type="text" required value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Nom *</label>
                  <input type="text" required value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Téléphone</label>
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Statut *</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as "SYMPATHISANT" | "MEMBRE" | "RESPONSABLE")} className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white">
                  <option value="SYMPATHISANT">Sympathisant</option>
                  <option value="MEMBRE">Membre</option>
                  <option value="RESPONSABLE">Responsable</option>
                </select>
              </div>
              {editStatus === "RESPONSABLE" && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-3xl bg-[#F4F7FE]/50 dark:bg-[#0B1437]/50 border border-[#E0E5F2] dark:border-white/5">
                  <div>
                    <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Grade *</label>
                    <select value={editGrade} onChange={(e) => setEditGrade(e.target.value)} required className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white">
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
                    <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Échelon *</label>
                    <select value={editEchelon} onChange={(e) => setEditEchelon(e.target.value)} required className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white">
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
                <label className="block text-sm font-medium text-[#1B2559] dark:text-white mb-1.5">Rôle Système *</label>
                <select
                  value={editSystemRole}
                  onChange={(e) => setEditSystemRole(e.target.value)}
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all cursor-pointer [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white"
                >
                  <option value="MEMBRE">Membre (Fidèle)</option>
                  <option value="RESPONSABLE_GEM">Responsable de GEM</option>
                  <option value="TRESORIER">Trésorier</option>
                  <option value="PASTEUR">Pasteur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border mt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-horizon btn-horizon-secondary">Annuler</button>
                <button type="submit" disabled={submitting} className="btn-horizon btn-horizon-primary disabled:opacity-50">{submitting ? "Sauvegarde..." : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Archive Confirmation Modal */}
      {isArchiveModalOpen && memberToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-7 bg-card rounded-[20px] shadow-horizon-xl text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#FEEFEE] flex items-center justify-center text-[#EE5D50] mb-5">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-extrabold text-foreground mb-2">Archiver le membre ?</h3>
            
            <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
              Êtes-vous sûr de vouloir archiver <span className="font-bold text-foreground">{memberToArchive.firstName} {memberToArchive.lastName}</span> ? <br />
              Cette action est réversible, mais il ne sera plus visible dans la liste active.
            </p>

            <div className="flex items-center justify-center space-x-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsArchiveModalOpen(false);
                  setMemberToArchive(null);
                }}
                className="flex-1 btn-horizon btn-horizon-secondary"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={archiving}
                className="flex-1 btn-horizon bg-[#EE5D50] hover:opacity-90 text-white disabled:opacity-50"
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

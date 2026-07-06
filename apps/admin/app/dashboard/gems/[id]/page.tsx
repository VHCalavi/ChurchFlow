"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ArrowLeft, Users, Trash2, Building, Calendar, UserPlus, Search, X, Check } from "lucide-react";
import { HorizonCard } from "@/components/ui/horizon-card";

interface GemDetail {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  group: { id: string; name: string } | null;
  members: Array<{
    id: string;
    role: string;
    isLeader: boolean;
    member: {
      id: string;
      firstName: string;
      lastName: string;
      status: string;
    };
  }>;
  reports: Array<{
    id: string;
    title: string;
    type: string;
    content: string;
    submittedAt: string;
    author: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function GemDetailPage() {
  const params = useParams();
  const gemId = params.id as string;

  const [gem, setGem] = useState<GemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // All members + all gems (for memberGemMap)
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [allGems, setAllGems] = useState<any[]>([]);

  // Add member modal state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  // Notification & confirm
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Map memberId -> gem object from ALL gems data
  const memberGemMap = useMemo(() => {
    const map = new Map<string, any>();
    allGems.forEach(g => {
      (g.members || []).forEach((gm: any) => {
        if (gm.member?.id) map.set(gm.member.id, g);
      });
    });
    return map;
  }, [allGems]);

  useEffect(() => {
    loadGem();
    loadAllMembers();
    loadAllGems();
  }, [gemId]);

  async function loadGem() {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/gems/${gemId}`);
      const data = await res.json();
      if (data.success) setGem(data.data);
    } catch (err) {
      console.error("Error loading gem:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllMembers() {
    try {
      const res = await fetch("/api/v1/members");
      const data = await res.json();
      if (data.success) setAllMembers(data.data || []);
    } catch (err) {
      console.error("Error loading members:", err);
    }
  }

  async function loadAllGems() {
    try {
      const res = await fetch("/api/v1/gems");
      const data = await res.json();
      if (data.success) setAllGems(data.data || []);
    } catch (err) {
      console.error("Error loading gems:", err);
    }
  }

  const openAddMemberModal = () => {
    setSelectedMemberIds([]);
    setMemberSearch("");
    setIsAddMemberModalOpen(true);
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);

      const newMemberGem = memberGemMap.get(id);
      const existingGemInSelection = prev
        .map(selId => memberGemMap.get(selId))
        .find(g => g !== undefined);

      if (newMemberGem && existingGemInSelection && newMemberGem.id !== existingGemInSelection.id) {
        showNotification("Impossible de sélectionner des membres appartenant à des GEMs différents.", "error");
        return prev;
      }

      return [...prev, id];
    });
  };

  const handleAddMembers = async () => {
    if (selectedMemberIds.length === 0) return;
    setSubmitting(true);
    let addedCount = 0;
    let errorMsg = "";

    for (const memberId of selectedMemberIds) {
      try {
        const res = await fetch(`/api/v1/gems/${gemId}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, role: "MEMBER" })
        });
        const json = await res.json();
        if (json.success) {
          addedCount++;
        } else {
          errorMsg = json.error || "Erreur lors de l'ajout";
        }
      } catch {
        errorMsg = "Erreur réseau";
      }
    }

    setSubmitting(false);
    setIsAddMemberModalOpen(false);

    if (addedCount > 0) {
      showNotification(`${addedCount} membre${addedCount > 1 ? "s" : ""} ajouté${addedCount > 1 ? "s" : ""} avec succès`, "success");
    }
    if (errorMsg) {
      showNotification(errorMsg, "error");
    }

    await loadGem();
    await loadAllGems();
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    setConfirmDialog({
      message: `Voulez-vous vraiment retirer ${memberName} du GEM ?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/v1/gems/${gemId}/members?memberId=${memberId}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            showNotification("Membre retiré avec succès", "success");
            await loadGem();
            await loadAllGems();
          } else {
            showNotification(json.error || "Erreur lors du retrait", "error");
          }
        } catch {
          showNotification("Erreur réseau", "error");
        }
      }
    });
  };

  // Members already in this GEM
  const currentGemMemberIds = new Set((gem?.members || []).map(gm => gm.member.id));

  // Filtered list for modal: exclude current GEM members from list
  const filteredModalMembers = allMembers.filter(m =>
    !currentGemMemberIds.has(m.id) &&
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <DashboardLayout title="Détail du GEM">
      <button onClick={() => window.history.back()} className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-[#12BC7E] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /><span>Retour</span>
      </button>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#006C69] border-t-transparent rounded-full animate-spin" /></div>
      ) : gem ? (
        <div className="space-y-6">
          {/* Header */}
          <HorizonCard className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#1B2559]">{gem.name}</h1>
                {gem.group && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[#F4F7FE] text-[#006C69] border border-[#D6D1CE] mt-2 inline-block">
                    {gem.group.name}
                  </span>
                )}
                {gem.description && (
                  <p className="text-sm text-[#6D6E71] mt-3">{gem.description}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${gem.isActive ? "bg-[#006C69] text-white" : "bg-[#F4F7FE] text-[#6D6E71] border border-[#D6D1CE]"}`}>
                {gem.isActive ? "Actif" : "Inactif"}
              </span>
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#D6D1CE]">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-[#A3AED0]" />
                  <span className="text-[#6D6E71] font-bold">{gem.members.length} membre{gem.members.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[#A3AED0]" />
                  <span className="text-[#6D6E71] font-bold">{gem.reports.length} rapport{gem.reports.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </HorizonCard>

          {/* Members Section */}
          <HorizonCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1B2559]">Membres du GEM</h2>
              <button onClick={openAddMemberModal} className="btn-horizon btn-horizon-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                <span>Ajouter un membre</span>
              </button>
            </div>

            {gem.members.length > 0 ? (
              <div className="space-y-3">
                {gem.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#006C69]/10 text-[#006C69] flex items-center justify-center font-bold text-sm border border-[#006C69]/20">
                        {member.member.firstName[0]}{member.member.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1B2559]">{member.member.firstName} {member.member.lastName}</h3>
                        <p className="text-xs text-[#A3AED0] font-medium">{member.member.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.isLeader ? "bg-[#006C69] text-white" : "bg-[#F4F7FE] text-[#6D6E71] border border-[#D6D1CE]"}`}>
                        {member.isLeader ? "Leader" : "Membre"}
                      </span>
                      <button
                        onClick={() => handleRemoveMember(member.member.id, `${member.member.firstName} ${member.member.lastName}`)}
                        className="p-2 text-[#CD3C14] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#A3AED0] font-medium py-8">Aucun membre dans ce GEM.</p>
            )}
          </HorizonCard>

          {/* Reports Section */}
          <HorizonCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1B2559]">Rapports du GEM</h2>
              <button className="btn-horizon btn-horizon-primary">
                <Building className="w-4 h-4 mr-2" />
                <span>Nouveau rapport</span>
              </button>
            </div>
            {gem.reports.length > 0 ? (
              <div className="space-y-4">
                {gem.reports.map((report) => (
                  <div key={report.id} className="p-4 bg-[#F8F9FA] rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#1B2559] mb-2">{report.title}</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 rounded-full text-sm font-semibold border border-[#D6D1CE] text-[#6D6E71]">{report.type}</span>
                          <span className="text-sm text-[#6D6E71]">{new Date(report.submittedAt).toLocaleDateString("fr-FR")}</span>
                        </div>
                        <p className="text-sm text-[#6D6E71] line-clamp-3">{report.content}</p>
                        <p className="text-sm text-[#A3AED0] mt-2 font-medium">Par {report.author.firstName} {report.author.lastName}</p>
                      </div>
                      <button className="btn-horizon btn-horizon-secondary ml-4">Voir</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#A3AED0] font-medium py-8">Aucun rapport pour ce GEM.</p>
            )}
          </HorizonCard>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm font-medium">GEM non trouvé.</div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-[#E0E5F2] shrink-0">
              <h3 className="font-extrabold text-lg text-[#1B2559]">Ajouter un membre</h3>
              <button onClick={() => setIsAddMemberModalOpen(false)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Chips */}
              {selectedMemberIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedMemberIds.map(id => {
                    const m = allMembers.find((x: any) => x.id === id);
                    if (!m) return null;
                    return (
                      <span key={id} className="flex items-center gap-1 px-3 py-1 bg-[#006C69]/10 text-[#006C69] rounded-full text-xs font-bold">
                        {m.firstName} {m.lastName}
                        <button type="button" onClick={() => setSelectedMemberIds(prev => prev.filter(x => x !== id))} className="ml-1 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#A3AED0]" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Rechercher un membre..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#E0E5F2] focus:border-[#006C69] rounded-lg text-sm font-medium focus:outline-none"
                />
              </div>

              {/* Member List */}
              <div className="max-h-64 overflow-y-auto rounded-lg border border-[#E0E5F2] divide-y divide-[#F4F7FE]">
                {filteredModalMembers.length === 0 ? (
                  <p className="text-center text-[#A3AED0] text-sm py-6">Aucun membre disponible</p>
                ) : filteredModalMembers.map((m: any) => {
                  const isSelected = selectedMemberIds.includes(m.id);
                  const memberGem = memberGemMap.get(m.id);
                  const isAlreadyInGem = !!memberGem;
                  const isDisabled = isAlreadyInGem && !isSelected;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isDisabled && toggleMember(m.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed bg-[#F4F7FE]'
                          : isSelected
                          ? 'bg-[#006C69]/5'
                          : 'hover:bg-[#F4F7FE]'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? 'bg-[#006C69] text-white' : isDisabled ? 'bg-[#E0E5F2] text-[#A3AED0]' : 'bg-[#E0E5F2] text-[#1B2559]'
                      }`}>
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : `${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isDisabled ? 'text-[#A3AED0]' : 'text-[#1B2559]'}`}>{m.firstName} {m.lastName}</p>
                        {memberGem ? (
                          <p className="text-xs text-[#CEAD1E] font-semibold truncate">GEM : {memberGem.name}</p>
                        ) : m.email ? (
                          <p className="text-xs text-[#A3AED0] truncate">{m.email}</p>
                        ) : null}
                      </div>
                      {isDisabled && (
                        <span className="text-[10px] text-[#A3AED0] font-medium shrink-0">Déjà en GEM</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#E0E5F2] shrink-0">
              <button type="button" onClick={() => setIsAddMemberModalOpen(false)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddMembers}
                disabled={submitting || selectedMemberIds.length === 0}
                className="px-6 py-2 bg-[#006C69] hover:bg-[#005250] text-white rounded-full font-bold transition-colors disabled:opacity-50"
              >
                {submitting ? 'Ajout...' : `Ajouter${selectedMemberIds.length > 0 ? ` (${selectedMemberIds.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg z-[100] text-sm font-bold text-white flex items-center animate-fade-in ${notification.type === 'success' ? 'bg-[#006C69]' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-xl flex flex-col">
            <h3 className="font-extrabold text-lg text-[#1B2559] mb-2">Confirmation</h3>
            <p className="text-sm font-medium text-[#A3AED0] mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Annuler</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="px-6 py-2 bg-[#CEAD1E] hover:bg-[#b09319] text-white rounded-full font-bold transition-colors">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
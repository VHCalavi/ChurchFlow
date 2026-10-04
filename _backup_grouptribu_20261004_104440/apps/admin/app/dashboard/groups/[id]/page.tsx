"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "../../../../components/layout/dashboard-layout";
import { ArrowLeft, ArrowRight, Users, UserPlus, Trash2, Search, X, Check, Building, Layers, FileText, Shield, ChevronDown, Pencil } from "lucide-react";
import { HorizonCard } from "@/components/ui/horizon-card";

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  type: string;
  isActive: boolean;
  parent: { id: string; name: string; type: string } | null;
  children: { id: string; name: string; type: string }[];
  members: any[];
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState("members");
  const [gems, setGems] = useState<any[]>([]);

  // Add member modal state
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("Membre");
  const [memberSearch, setMemberSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    memberId: string;
    memberName: string;
  } | null>(null);

  // Role dropdown open state per member
  const [openRoleDropdownId, setOpenRoleDropdownId] = useState<string | null>(null);

  useEffect(() => {
    loadGroup();
    loadGems();
    loadAllMembers();
  }, [groupId]);

  async function loadGems() {
    try {
      const res = await fetch(`/api/v1/gems?groupId=${groupId}`);
      const data = await res.json();
      if (data.success) {
        setGems(data.data);
      }
    } catch (err) {
      console.error("Error loading gems:", err);
    }
  }

  async function loadGroup() {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/groups/${groupId}`);
      const data = await res.json();
      if (data.success) {
        setGroup(data.data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadAllMembers() {
    try {
      const res = await fetch("/api/v1/members");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAllMembers(data.data);
      }
    } catch (err) {
      console.error("Error loading all members:", err);
    }
  }

  function notify(message: string, type: "success" | "error") {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }

  // Filter members not yet in group
  const existingMemberIds = useMemo(() => {
    return new Set((group?.members || []).map((m: any) => m.memberId || m.member?.id));
  }, [group?.members]);

  const availableMembers = useMemo(() => {
    return allMembers
      .filter((m) => !existingMemberIds.has(m.id))
      .filter((m) => {
        if (!memberSearch.trim()) return true;
        const q = memberSearch.toLowerCase();
        return (
          m.firstName?.toLowerCase().includes(q) ||
          m.lastName?.toLowerCase().includes(q) ||
          m.phone?.includes(q) ||
          m.email?.toLowerCase().includes(q)
        );
      });
  }, [allMembers, existingMemberIds, memberSearch]);

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      notify("Veuillez sélectionner un membre", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMemberId,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify("Membre ajouté au groupe avec succès !", "success");
        setIsAddMemberModalOpen(false);
        setSelectedMemberId("");
        setSelectedRole("Membre");
        setMemberSearch("");
        await loadGroup();
      } else {
        notify(data.error || "Erreur lors de l'ajout du membre", "error");
      }
    } catch (err) {
      notify("Erreur de connexion au serveur", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Role options
  const ROLE_OPTIONS = [
    { value: "Membre", label: "Membre" },
    { value: "Responsable", label: "Responsable" },
    { value: "Co-responsable", label: "Co-responsable" },
    { value: "Assistant", label: "Assistant" },
    { value: "Leader", label: "Leader" },
  ];

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setOpenRoleDropdownId(null);
    // Optimistic update
    setGroup((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map((m: any) =>
          (m.memberId === memberId || m.member?.id === memberId)
            ? { ...m, role: newRole }
            : m
        ),
      };
    });

    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify(`Rôle mis à jour en "${newRole}" avec succès !`, "success");
      } else {
        notify(data.error || "Erreur lors du changement de rôle", "error");
        await loadGroup();
      }
    } catch (err) {
      notify("Erreur lors de la mise à jour du rôle", "error");
      await loadGroup();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/groups/${groupId}/members?memberId=${memberId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        notify("Membre retiré du groupe avec succès", "success");
        setConfirmDialog(null);
        setGroup((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            members: prev.members.filter(
              (m: any) => m.memberId !== memberId && m.member?.id !== memberId
            ),
          };
        });
      } else {
        notify(data.error || "Erreur lors du retrait du membre", "error");
      }
    } catch (err) {
      notify("Erreur lors de la suppression", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = group?.type === "DEPARTEMENT" ? "Département" : group?.type === "TRIBU" ? "Tribu" : "GEM";
  const typeColor = group?.type === "DEPARTEMENT"
    ? "bg-[#12BC7E]/10 text-[#12BC7E] border-[#12BC7E]/20"
    : group?.type === "TRIBU"
      ? "bg-[#CEAD1E]/10 text-[#CEAD1E] border-[#CEAD1E]/20"
      : "bg-[#12BC7E]/10 text-[#12BC7E] border-[#12BC7E]/20";

  return (
    <DashboardLayout title={group?.name || "Détail du Groupe"}>
      {notification && (
        <div className={`fixed top-24 right-8 z-50 flex items-center px-4 py-3 rounded-2xl shadow-horizon-xl animate-fade-in ${
          notification.type === "success"
            ? "bg-[#12BC7E]/10 text-[#12BC7E] border border-[#12BC7E]/20"
            : "bg-[#CD3C14]/10 text-[#CD3C14] border border-[#CD3C14]/20"
        }`}>
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-horizon-xl animate-scale-up border border-[#E9EDF7]">
            <h3 className="text-lg font-bold text-[#1B2559] mb-2">Confirmer le retrait</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir retirer <span className="font-semibold text-[#1B2559]">{confirmDialog.memberName}</span> de ce groupe ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-slate-100 rounded-xl transition-colors"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                onClick={() => handleRemoveMember(confirmDialog.memberId)}
                className="px-4 py-2 text-sm font-medium bg-[#CD3C14] text-white hover:bg-[#B33411] rounded-xl transition-colors flex items-center space-x-2"
                disabled={submitting}
              >
                {submitting ? "Retrait..." : "Retirer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-horizon-xl animate-scale-up border border-[#E9EDF7] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9EDF7] mb-4">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-[#12BC7E]" />
                <h3 className="text-lg font-bold text-[#1B2559]">Ajouter un membre au groupe</h3>
              </div>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-muted-foreground hover:text-[#1B2559] p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role selector inside modal */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#1B2559] uppercase tracking-wider mb-1.5">
                Rôle dans le groupe
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 text-sm font-medium rounded-xl border border-[#E9EDF7] bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#12BC7E]/25"
              >
                <option value="Membre">Membre</option>
                <option value="Responsable">Responsable</option>
                <option value="Co-responsable">Co-responsable</option>
                <option value="Assistant">Assistant</option>
                <option value="Leader">Leader</option>
              </select>
            </div>

            {/* Member search */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-[#1B2559] uppercase tracking-wider mb-1.5">
                Sélectionner le membre
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, téléphone, email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E9EDF7] bg-[#F4F7FE] focus:outline-none focus:ring-2 focus:ring-[#12BC7E]/25"
                />
              </div>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 mb-6 pr-1 max-h-60 border border-[#E9EDF7] rounded-xl p-2 bg-[#FAFCFE]">
              {availableMembers.length > 0 ? (
                availableMembers.map((m) => {
                  const isSelected = selectedMemberId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#12BC7E]/10 border border-[#12BC7E]/30"
                          : "hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? "bg-[#12BC7E] text-white" : "bg-[#F4F7FE] text-[#1B2559]"
                        }`}>
                          {m.firstName?.[0] || ""}{m.lastName?.[0] || ""}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1B2559]">{m.firstName} {m.lastName}</p>
                          <p className="text-xs text-muted-foreground">{m.phone || m.email || "Aucun contact"}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#12BC7E] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {allMembers.length === 0
                    ? "Chargement des membres..."
                    : "Aucun membre disponible à ajouter."}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-[#E9EDF7]">
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-slate-100 rounded-xl transition-colors"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={!selectedMemberId || submitting}
                className="px-5 py-2 text-sm font-medium bg-[#12BC7E] text-white hover:bg-[#0EA26C] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
              >
                {submitting ? "Ajout en cours..." : "Ajouter au groupe"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => router.push("/dashboard/groups")} className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-[#12BC7E] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /><span>Retour aux Groupes</span>
      </button>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm ${
            activeTab === "members"
              ? "bg-white text-[#006C69] border-t border-x border-[#D6D1CE]"
              : "text-[#6D6E71] hover:text-[#1B2559]"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Membres ({group?.members?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("gems")}
          className={`px-4 py-2 rounded-t-lg font-medium text-sm ${
            activeTab === "gems"
              ? "bg-white text-[#006C69] border-t border-x border-[#D6D1CE]"
              : "text-[#6D6E71] hover:text-[#1B2559]"
          }`}
        >
          <Layers className="w-4 h-4 inline mr-2" />
          GEMs ({gems.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#006C69] border-t-transparent rounded-full animate-spin" /></div>
      ) : group ? (
        <div className="space-y-6">
          <HorizonCard className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-xl font-semibold text-[#1B2559]">{group.name}</h2>
                  <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold border ${typeColor}`}>{typeLabel}</span>
                </div>
                {group.description && <p className="text-sm font-medium text-muted-foreground">{group.description}</p>}
                {group.parent && (
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    Sous-groupe de <span className="font-semibold text-[#1B2559]">{group.parent.name}</span>
                  </p>
                )}
              </div>
            </div>
          </HorizonCard>

          {activeTab === "members" && (
            <HorizonCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1B2559]">Membres du Groupe</h3>
                  <p className="text-xs text-muted-foreground">Gérez les membres et modifiez leurs rôles dans ce groupe</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMemberId("");
                    setSelectedRole("Membre");
                    setMemberSearch("");
                    setIsAddMemberModalOpen(true);
                  }}
                  className="btn-horizon btn-horizon-primary flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ajouter un membre</span>
                </button>
              </div>

              {group.members && group.members.length > 0 ? (
                <div className="divide-y divide-[#E9EDF7]">
                  {group.members.map((member: any) => {
                    const memberData = member.member || member;
                    const mId = member.memberId || memberData.id;
                    const role = member.role || "Membre";
                    const isLeader = role.toLowerCase().includes("responsable") || role.toLowerCase().includes("leader") || role.toLowerCase().includes("admin");
                    const isDropdownOpen = openRoleDropdownId === mId;

                    return (
                      <div key={mId} className="flex items-center justify-between py-3.5 hover:bg-[#F8F9FA] px-2 rounded-xl transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                            isLeader
                              ? "bg-[#CEAD1E]/10 text-[#CEAD1E] border-[#CEAD1E]/30"
                              : "bg-[#12BC7E]/10 text-[#12BC7E] border-[#12BC7E]/20"
                          }`}>
                            {memberData.firstName?.[0] || ""}{memberData.lastName?.[0] || ""}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-semibold text-[#1B2559]">
                                {memberData.firstName} {memberData.lastName}
                              </p>
                              {isLeader && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#CEAD1E]/10 text-[#CEAD1E] border border-[#CEAD1E]/20 flex items-center space-x-1">
                                  <Shield className="w-2.5 h-2.5 inline mr-1" />
                                  {role}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">
                              {memberData.status || "Statut standard"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Custom Role Selector Dropdown to fix UI rendering issues */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenRoleDropdownId(isDropdownOpen ? null : mId)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#E9EDF7] bg-[#F4F7FE] text-[#1B2559] hover:bg-[#EAEFFC] transition-colors flex items-center space-x-2 cursor-pointer"
                            >
                              <span>{role}</span>
                              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>

                            {isDropdownOpen && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-horizon-xl border border-[#E9EDF7] z-50 py-1 animate-scale-up">
                                {ROLE_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleRoleChange(mId, opt.value)}
                                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#F4F7FE] transition-colors flex items-center justify-between ${
                                      role === opt.value ? "text-[#12BC7E] font-bold bg-[#12BC7E]/5" : "text-[#1B2559]"
                                    }`}
                                  >
                                    <span>{opt.label}</span>
                                    {role === opt.value && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                memberId: mId,
                                memberName: `${memberData.firstName} ${memberData.lastName}`,
                              })
                            }
                            className="p-1.5 text-muted-foreground hover:text-[#CD3C14] hover:bg-[#CD3C14]/10 rounded-lg transition-colors"
                            title="Retirer du groupe"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-[#E9EDF7] rounded-2xl bg-[#FAFCFE]">
                  <Users className="w-10 h-10 mx-auto text-[#707EAE] mb-3 opacity-50" />
                  <p className="text-sm font-semibold text-[#1B2559] mb-1">Aucun membre dans ce groupe</p>
                  <p className="text-xs text-muted-foreground mb-4">Cliquez sur le bouton ci-dessous pour ajouter le premier membre.</p>
                  <button
                    onClick={() => {
                      setSelectedMemberId("");
                      setSelectedRole("Membre");
                      setMemberSearch("");
                      setIsAddMemberModalOpen(true);
                    }}
                    className="btn-horizon btn-horizon-primary text-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    <span>Ajouter un membre</span>
                  </button>
                </div>
              )}
            </HorizonCard>
          )}

          {/* GEMs Tab */}
          {activeTab === "gems" && (
            <HorizonCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1B2559]">GEMs associés</h3>
                <Link href={`/dashboard/gems?groupId=${groupId}`} className="btn-horizon btn-horizon-primary">
                  <Building className="w-4 h-4 mr-2" />
                  <span>Gérer les GEMs</span>
                </Link>
              </div>

              {gems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gems.map(gem => (
                    <Link
                      key={gem.id}
                      href={`/dashboard/gems/${gem.id}`}
                      className="horizon-card group hover:shadow-md transition-shadow p-4 rounded-xl border border-[#E9EDF7]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-bold text-[#1B2559]">{gem.name}</h4>
                          {gem.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{gem.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-[#6D6E71]">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{gem._count?.members || 0} membre{gem._count?.members !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{gem._count?.reports || 0} rapport{gem._count?.reports !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#707EAE] transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 mx-auto text-[#D6D1CE] mb-4" />
                  <p className="text-[#6D6E71]">Aucun GEM associé à ce groupe.</p>
                </div>
              )}
            </HorizonCard>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm font-medium">Groupe non trouvé.</div>
      )}
    </DashboardLayout>
  );
}
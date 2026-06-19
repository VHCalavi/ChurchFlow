"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "../../../../components/layout/dashboard-layout";
import { ArrowLeft, Users, UserPlus, Trash2, Search, X, Edit3, AlertTriangle } from "lucide-react";

interface GroupMember {
  memberId: string;
  role: string | null;
  joinedAt: string;
  member: { id: string; firstName: string; lastName: string; status: string };
}
interface GroupDetail {
  id: string; name: string; description: string | null; type: string; isActive: boolean;
  parent: { id: string; name: string; type: string } | null;
  children: { id: string; name: string; type: string }[];
  members: GroupMember[];
}
interface SearchableMember { id: string; firstName: string; lastName: string; status: string; }

const ROLES = ["responsable", "co-responsable", "assistant responsable", "membre"];

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Add member states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchableMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<SearchableMember | null>(null);
  const [selectedRole, setSelectedRole] = useState("Membre");
  const [addingMember, setAddingMember] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);

  // Edit group states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingGroup, setSavingGroup] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "danger" | "warning";
    onConfirm: () => void;
    confirmLabel?: string;
  }>({ open: false, title: "", message: "", variant: "danger", onConfirm: () => {} });

  useEffect(() => {
    loadGroup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  async function loadGroup() {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/groups/${groupId}`);
      const data = await res.json();
      if (data.success) {
        setGroup(data.data);
        setEditName(data.data.name);
        setEditDescription(data.data.description || "");
      }
    } finally {
      setLoading(false);
    }
  }

  function notify(message: string, type: "success" | "error") {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }

  // Search members to add
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/v1/members?churchId=default-church-id`);
      const data = await res.json();
      if (data.success) {
        const existing = new Set(group?.members.map(m => m.memberId) ?? []);
        setSearchResults(
          data.data.filter((m: SearchableMember) =>
            !existing.has(m.id) &&
            `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 6)
        );
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, group]);

  async function handleAddMember() {
    if (!selectedMember) return;
    try {
      setAddingMember(true);
      const res = await fetch(`/api/v1/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMember.id, role: selectedRole }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`${selectedMember.firstName} ajouté avec succès !`, "success");
        setSelectedMember(null); setSearchQuery(""); setSelectedRole("Membre"); setShowAddPanel(false);
        loadGroup();
      } else {
        notify(data.error || "Erreur", "error");
      }
    } catch { notify("Erreur de connexion", "error"); }
    finally { setAddingMember(false); }
  }

  function handleRemoveMember(memberId: string, name: string) {
    setConfirmModal({
      open: true,
      title: "Retirer du groupe",
      message: `Êtes-vous sûr de vouloir retirer ${name} de ce groupe ? Cette action peut être annulée en le réajoutant manuellement.`,
      variant: "warning",
      confirmLabel: "Retirer",
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, open: false }));
        const res = await fetch(`/api/v1/groups/${groupId}/members?memberId=${memberId}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) { notify(`${name} retiré du groupe.`, "success"); loadGroup(); }
        else notify(data.error || "Erreur", "error");
      },
    });
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        notify("Rôle mis à jour avec succès !", "success");
        loadGroup();
      } else {
        notify(data.error || "Erreur", "error");
        loadGroup();
      }
    } catch { notify("Erreur de connexion", "error"); }
  }

  async function handleUpdateGroup(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSavingGroup(true);
      const res = await fetch(`/api/v1/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      const data = await res.json();
      if (data.success) { notify("Groupe mis à jour !", "success"); setIsEditOpen(false); loadGroup(); }
      else notify(data.error || "Erreur", "error");
    } catch { notify("Erreur de connexion", "error"); }
    finally { setSavingGroup(false); }
  }

  function handleDeleteGroup() {
    setConfirmModal({
      open: true,
      title: "Supprimer le groupe",
      message: `Vous êtes sur le point de supprimer définitivement le groupe "${group?.name}". Cette action est irréversible et supprimera également toutes les associations de membres.`,
      variant: "danger",
      confirmLabel: "Supprimer définitivement",
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, open: false }));
        const res = await fetch(`/api/v1/groups/${groupId}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) router.push("/dashboard/groups");
        else notify(data.error || "Impossible de supprimer ce groupe", "error");
      },
    });
  }

  const typeLabel = group?.type === "DEPARTEMENT" ? "Département" : group?.type === "TRIBU" ? "Tribu" : "GEM";
  const typeColor = group?.type === "DEPARTEMENT" ? "bg-[#12BC7E]/10 text-[#12BC7E] border-[#12BC7E]/20" : group?.type === "TRIBU" ? "bg-[#CEAD1E]/10 text-[#CEAD1E] border-[#CEAD1E]/20" : "bg-[#12BC7E]/10 text-[#12BC7E] border-[#12BC7E]/20";

  return (
    <DashboardLayout title={group?.name || "Détail du Groupe"}>
      {notification && (
        <div className={`fixed top-24 right-8 z-50 flex items-center px-4 py-3 rounded-xl border shadow-premium animate-fade-in ${
          notification.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Back + Edit/Delete actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push("/dashboard/groups")} className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-[#12BC7E] transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>Retour aux Groupes</span>
        </button>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsEditOpen(true)} className="btn-horizon btn-horizon-secondary">
            <Edit3 className="w-3.5 h-3.5" /><span>Modifier</span>
          </button>
          <button onClick={handleDeleteGroup} className="btn-horizon btn-horizon-danger">
            <Trash2 className="w-3.5 h-3.5" /><span>Supprimer</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : group ? (
        <div className="space-y-6">
          {/* Group Info Card */}
          <div className="horizon-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-xl font-bold text-foreground">{group.name}</h2>
                  {/* Badge de type: ok de garder petit pour les badges */}
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${typeColor}`}>{typeLabel}</span>
                </div>
                {group.description && <p className="text-sm font-medium text-muted-foreground">{group.description}</p>}
                {group.parent && (
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    Sous-groupe de <span className="font-bold text-foreground">{group.parent.name}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{group.members.length}</p>
                  <p className="text-sm font-medium text-muted-foreground">Membres</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{group.children.length}</p>
                  <p className="text-sm font-medium text-muted-foreground">Sous-groupes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="horizon-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#12BC7E]" />
                <h3 className="text-sm font-bold text-foreground">Membres du Groupe</h3>
              </div>
              <button onClick={() => setShowAddPanel(!showAddPanel)} className="btn-horizon btn-horizon-primary">
                <UserPlus className="w-3.5 h-3.5" /><span>Ajouter un membre</span>
              </button>
            </div>

            {/* Add member panel */}
            {showAddPanel && (
              <div className="px-6 py-4 border-b border-border bg-background/50 space-y-3">
                <p className="text-sm font-medium text-foreground">Rechercher un membre de l&apos;église</p>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3AED0]" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Nom du fidèle..."
                      className="w-full px-5 !pl-10 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-[#12BC7E]/25"
                    />
                  </div>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className="px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#12BC7E]/25 [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white"
                  >
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                {searchResults.length > 0 && (
                  <div className="border border-border rounded-2xl overflow-hidden bg-card">
                    {searchResults.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedMember(m); setSearchQuery(`${m.firstName} ${m.lastName}`); setSearchResults([]); }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-background border-b border-border last:border-0 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#12BC7E]/10 text-[#12BC7E] flex items-center justify-center text-sm font-bold">
                          {m.firstName[0]}{m.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{m.firstName} {m.lastName}</p>
                          <p className="text-sm font-medium text-muted-foreground">{m.status}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedMember && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/5 border border-primary/10">
                    <span className="text-sm font-semibold text-primary">
                      {selectedMember.firstName} {selectedMember.lastName} — <span className="font-medium">{selectedRole}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => { setSelectedMember(null); setSearchQuery(""); }} className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleAddMember}
                        disabled={addingMember}
                        className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-full disabled:opacity-50 hover:opacity-90 transition-all"
                      >
                        {addingMember ? "..." : "Confirmer"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Members list */}
            {group.members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Aucun membre dans ce groupe.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {[...group.members]
                  .sort((a, b) => {
                    const roleA = a.role || "membre";
                    const roleB = b.role || "membre";
                    const indexA = ROLES.indexOf(roleA);
                    const indexB = ROLES.indexOf(roleB);
                    const pA = indexA === -1 ? ROLES.length : indexA;
                    const pB = indexB === -1 ? ROLES.length : indexB;
                    if (pA !== pB) return pA - pB;
                    return `${a.member.lastName} ${a.member.firstName}`.localeCompare(`${b.member.lastName} ${b.member.firstName}`);
                  })
                  .map(mg => (
                  <div key={mg.memberId} className="flex items-center justify-between px-6 py-3.5 hover:bg-background/60 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#12BC7E]/10 text-[#12BC7E] flex items-center justify-center font-bold text-sm border border-[#12BC7E]/20">
                        {mg.member.firstName[0]}{mg.member.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{mg.member.firstName} {mg.member.lastName}</p>
                        <p className="text-sm font-medium text-muted-foreground">{mg.member.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        value={mg.role || "membre"}
                        onChange={(e) => handleRoleChange(mg.memberId, e.target.value)}
                        className="px-3 py-1.5 text-sm font-medium rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#12BC7E]/25 cursor-pointer [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white"
                      >
                        {ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemoveMember(mg.memberId, `${mg.member.firstName} ${mg.member.lastName}`)}
                        className="p-1.5 rounded-lg border border-border hover:bg-red-50 hover:border-red-200 text-muted-foreground hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm font-medium">Groupe non trouvé.</div>
      )}

      {/* Edit Group Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-card rounded-[20px] shadow-horizon-xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Modifier le Groupe</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nom *</label>
                <input
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-[#12BC7E]/25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-5 py-3 text-sm font-semibold rounded-2xl border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-[#12BC7E]/25 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2 border-t border-border">
                <button type="button" onClick={() => setIsEditOpen(false)} className="btn-horizon btn-horizon-secondary">Annuler</button>
                <button type="submit" disabled={savingGroup} className="btn-horizon btn-horizon-primary disabled:opacity-50">{savingGroup ? "Sauvegarde..." : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-[20px] border border-border shadow-horizon-xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className={`flex items-center space-x-4 p-6 border-b border-border ${
              confirmModal.variant === "danger" ? "bg-red-50 dark:bg-red-950/20" : "bg-amber-50 dark:bg-amber-950/20"
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                confirmModal.variant === "danger" ? "bg-red-100 dark:bg-red-900/40" : "bg-amber-100 dark:bg-amber-900/40"
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  confirmModal.variant === "danger" ? "text-red-600" : "text-amber-600"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-bold ${
                  confirmModal.variant === "danger" ? "text-red-900 dark:text-red-300" : "text-amber-900 dark:text-amber-300"
                }`}>{confirmModal.title}</h3>
              </div>
              <button
                onClick={() => setConfirmModal(m => ({ ...m, open: false }))}
                className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="p-6">
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">{confirmModal.message}</p>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 pb-6">
              <button
                onClick={() => setConfirmModal(m => ({ ...m, open: false }))}
                className="btn-horizon btn-horizon-secondary"
              >
                Annuler
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`btn-horizon ${
                  confirmModal.variant === "danger" ? "btn-horizon-danger" : "bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-full font-bold text-sm"
                }`}
              >
                {confirmModal.confirmLabel || "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

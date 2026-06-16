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
        // Reset to previous role if update failed
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
  const typeColor = group?.type === "DEPARTEMENT" ? "bg-primary/10 text-primary border-primary/20" : group?.type === "TRIBU" ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";

  return (
    <DashboardLayout title={group?.name || "Détail du Groupe"}>
      {notification && (
        <div className={`fixed top-24 right-8 z-50 px-4 py-3 rounded-xl border shadow-premium text-sm font-semibold animate-fade-in ${notification.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {notification.message}
        </div>
      )}

      {/* Back + Edit/Delete actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push("/dashboard/groups")} className="flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>Retour aux Groupes</span>
        </button>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsEditOpen(true)} className="flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all">
            <Edit3 className="w-3.5 h-3.5" /><span>Modifier</span>
          </button>
          <button onClick={handleDeleteGroup} className="flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-all">
            <Trash2 className="w-3.5 h-3.5" /><span>Supprimer</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : group ? (
        <div className="space-y-6">
          {/* Group Info Card */}
          <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">{group.name}</h2>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${typeColor}`}>{typeLabel}</span>
                </div>
                {group.description && <p className="text-sm text-slate-500">{group.description}</p>}
                {group.parent && (
                  <p className="text-xs text-slate-400 mt-1">Sous-groupe de <span className="font-semibold text-slate-600">{group.parent.name}</span></p>
                )}
              </div>
              <div className="flex items-center space-x-6 text-center">
                <div><p className="text-2xl font-bold text-slate-900">{group.members.length}</p><p className="text-xs text-slate-500">Membres</p></div>
                <div><p className="text-2xl font-bold text-slate-900">{group.children.length}</p><p className="text-xs text-slate-500">Sous-groupes</p></div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-900">Membres du Groupe</h3>
              </div>
              <button onClick={() => setShowAddPanel(!showAddPanel)} className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all">
                <UserPlus className="w-3.5 h-3.5" /><span>Ajouter un membre</span>
              </button>
            </div>

            {/* Add member panel */}
            {showAddPanel && (
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Rechercher un membre de l&apos;église</p>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Nom du fidèle..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary">
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                {searchResults.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    {searchResults.map(m => (
                      <button key={m.id} onClick={() => { setSelectedMember(m); setSearchQuery(`${m.firstName} ${m.lastName}`); setSearchResults([]); }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{m.firstName[0]}{m.lastName[0]}</div>
                        <div><p className="text-sm font-semibold text-slate-800">{m.firstName} {m.lastName}</p><p className="text-xs text-slate-500">{m.status}</p></div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedMember && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-sm font-semibold text-primary">{selectedMember.firstName} {selectedMember.lastName} — <span className="font-normal">{selectedRole}</span></span>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => { setSelectedMember(null); setSearchQuery(""); }} className="p-1 rounded text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
                      <button onClick={handleAddMember} disabled={addingMember} className="px-3 py-1.5 text-xs font-bold text-white bg-primary rounded-lg disabled:opacity-50">{addingMember ? "..." : "Confirmer"}</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Members table */}
            {group.members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Aucun membre dans ce groupe.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
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
                  <div key={mg.memberId} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary flex items-center justify-center font-bold text-sm border border-primary/10">
                        {mg.member.firstName[0]}{mg.member.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{mg.member.firstName} {mg.member.lastName}</p>
                        <p className="text-xs text-slate-500">{mg.member.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select
                        value={mg.role || "membre"}
                        onChange={(e) => {
                          // Auto-save when role changes
                          const newRole = e.target.value;
                          handleRoleChange(mg.memberId, newRole);
                        }}
                        className="px-2.5 py-1 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>


                      <button onClick={() => handleRemoveMember(mg.memberId, `${mg.member.firstName} ${mg.member.lastName}`)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 transition-all">
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
        <div className="text-center py-20 text-slate-500">Groupe non trouvé.</div>
      )}

      {/* Edit Group Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-xl border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Modifier le Groupe</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Nom *</label>
                <input required value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Description</label>
                <textarea rows={3} value={editDescription} onChange={e => setEditDescription(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700">Annuler</button>
                <button type="submit" disabled={savingGroup} className="px-4 py-2.5 text-sm font-bold text-white bg-primary rounded-lg disabled:opacity-50">{savingGroup ? "Sauvegarde..." : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden animate-fade-in">
            {/* Header */}
            <div className={`flex items-center space-x-4 p-6 border-b border-slate-100 ${
              confirmModal.variant === "danger" ? "bg-red-50" : "bg-amber-50"
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                confirmModal.variant === "danger" ? "bg-red-100" : "bg-amber-100"
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  confirmModal.variant === "danger" ? "text-red-600" : "text-amber-600"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-bold ${
                  confirmModal.variant === "danger" ? "text-red-900" : "text-amber-900"
                }`}>{confirmModal.title}</h3>
              </div>
              <button
                onClick={() => setConfirmModal(m => ({ ...m, open: false }))}
                className="p-1.5 rounded-lg hover:bg-white/60 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed">{confirmModal.message}</p>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 pb-6">
              <button
                onClick={() => setConfirmModal(m => ({ ...m, open: false }))}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2.5 text-sm font-bold text-white rounded-lg transition-all shadow-sm ${
                  confirmModal.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-500 hover:bg-amber-600"
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

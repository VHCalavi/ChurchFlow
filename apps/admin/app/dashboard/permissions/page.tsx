"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import {
  Check, X, Lock, Save, Loader2, Plus, Trash2, Edit3,
  ShieldCheck, Users as UsersIcon, Grid3x3, AlertCircle, ChevronDown,
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isDefault: boolean;
  churchId: string | null;
  permissions: { permission: Permission }[];
  _count?: { users: number };
}

interface Permission {
  id: string;
  action: string;
  resource: string;
  scope: string | null;
  category: string | null;
  description: string | null;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  roles: { role: { id: string; name: string; description: string | null } }[];
}

type Tab = "matrix" | "roles" | "users";

export default function PermissionsPage() {
  const [tab, setTab] = useState<Tab>("matrix");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "matrix", label: "Matrice des permissions", icon: <Grid3x3 className="w-4 h-4" /> },
    { id: "roles",  label: "Gestion des rôles",       icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "users",  label: "Utilisateurs & rôles",    icon: <UsersIcon className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout title="Permissions & Droits d'Accès">
      {notification && (
        <div className={`fixed top-24 right-8 z-50 flex items-center px-4 py-3 rounded-xl border shadow-premium animate-fade-in ${
          notification.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      <div className="horizon-card mb-6 p-6">
        <div className="flex items-center space-x-3.5 mb-6">
          <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Contrôle d&apos;Accès (RBAC)</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez les permissions granulaires, les rôles personnalisés et leurs assignations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap border-t border-border pt-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
                tab === t.id ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-background"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "matrix" && <MatrixTab onNotify={showNotification} />}
      {tab === "roles"  && <RolesTab  onNotify={showNotification} />}
      {tab === "users"  && <UsersTab  onNotify={showNotification} />}
    </DashboardLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MATRICE
// ═══════════════════════════════════════════════════════════════════════════
function MatrixTab({ onNotify }: { onNotify: (m: string, t: "success" | "error") => void }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [mappings, setMappings] = useState<{ roleId: string; permissionId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [pRes, rRes] = await Promise.all([
          fetch("/api/v1/permissions"),
          fetch("/api/v1/roles"),
        ]);
        const pJson = await pRes.json();
        const rJson = await rRes.json();
        if (pJson.success) {
          setPermissions(pJson.data.permissions || []);
          setMappings(pJson.data.rolePermissions || []);
        }
        if (rJson.success) setRoles(rJson.data);
      } catch (e) {
        console.error(e);
        onNotify("Erreur lors du chargement", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [onNotify]);

  const systemRoles = useMemo(() => roles.filter((r) => r.isSystem), [roles]);

  const grouped = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    permissions.forEach((p) => {
      const cat = p.category || "Autres";
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [permissions]);

  const isGranted = (roleId: string, permId: string) =>
    mappings.some((m) => m.roleId === roleId && m.permissionId === permId);

  const toggle = (role: Role, perm: Permission) => {
    if (role.isSystem && role.name === "ADMIN" && perm.action === "manage" && perm.resource === "roles") {
      onNotify("Impossible de retirer ce droit au rôle ADMIN.", "error");
      return;
    }
    setMappings((prev) => {
      const exists = prev.some((m) => m.roleId === role.id && m.permissionId === perm.id);
      return exists
        ? prev.filter((m) => !(m.roleId === role.id && m.permissionId === perm.id))
        : [...prev, { roleId: role.id, permissionId: perm.id }];
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      const systemRoleIds = new Set(systemRoles.map((r) => r.id));
      const payload = mappings.filter((m) => systemRoleIds.has(m.roleId));
      const res = await fetch("/api/v1/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rolePermissions: payload }),
      });
      const json = await res.json();
      if (json.success) onNotify("Matrice enregistrée !", "success");
      else onNotify(json.error || "Erreur", "error");
    } catch {
      onNotify("Erreur réseau", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 horizon-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="horizon-card !p-0 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border bg-background/50">
        <div>
          <h4 className="text-sm font-bold text-foreground">Matrice des rôles système</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Les rôles personnalisés se configurent dans l&apos;onglet « Gestion des rôles ».
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn-horizon btn-horizon-primary flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Enregistrement…" : "Enregistrer"}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs font-bold">
              <th className="py-4 px-6 min-w-[200px] sticky left-0 bg-card z-10">Rôle</th>
              {systemRoles.map((r) => (
                <th key={r.id} className="py-4 px-4 text-center min-w-[100px]">
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([category, perms]) => (
              <React.Fragment key={category}>
                <tr className="bg-background/50">
                  <td colSpan={systemRoles.length + 1} className="py-2 px-6 text-xs font-bold text-primary uppercase tracking-wider">
                    {category}
                  </td>
                </tr>
                {perms.map((perm) => (
                  <tr key={perm.id} className="hover:bg-background/40 border-b border-border/50">
                    <td className="py-3 px-6 text-xs font-medium text-foreground sticky left-0 bg-card">
                      <div className="flex flex-col">
                        <span className="font-bold">
                          {perm.action}:{perm.resource}
                          {perm.scope && <span className="text-primary">.{perm.scope}</span>}
                        </span>
                        {perm.description && (
                          <span className="text-[10px] text-muted-foreground mt-0.5">{perm.description}</span>
                        )}
                      </div>
                    </td>
                    {systemRoles.map((role) => {
                      const granted = isGranted(role.id, perm.id);
                      return (
                        <td key={role.id} className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggle(role, perm)}
                            className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition-all ${
                              granted
                                ? "bg-primary border border-primary text-white shadow-sm"
                                : "bg-background border border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {granted ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RÔLES
// ═══════════════════════════════════════════════════════════════════════════
function RolesTab({ onNotify }: { onNotify: (m: string, t: "success" | "error") => void }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPermissionIds, setFormPermissionIds] = useState<string[]>([]);
  const [formIsDefault, setFormIsDefault] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [rRes, pRes] = await Promise.all([
        fetch("/api/v1/roles"),
        fetch("/api/v1/permissions"),
      ]);
      const rJson = await rRes.json();
      const pJson = await pRes.json();
      if (rJson.success) setRoles(rJson.data);
      if (pJson.success) setPermissions(pJson.data.permissions || []);
    } catch {
      onNotify("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormDescription("");
    setFormPermissionIds([]);
    setFormIsDefault(false);
    setShowModal(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setFormName(role.name);
    setFormDescription(role.description || "");
    setFormPermissionIds(role.permissions.map((p) => p.permission.id));
    setFormIsDefault(role.isDefault);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/roles/${editing.id}` : "/api/v1/roles";
      const method = editing ? "PUT" : "POST";
      const body: Record<string, unknown> = {
        description: formDescription,
        permissionIds: formPermissionIds,
        isDefault: formIsDefault,
      };
      if (!editing) body.name = formName.toUpperCase().replace(/\s+/g, "_");

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        onNotify(editing ? "Rôle modifié !" : "Rôle créé !", "success");
        setShowModal(false);
        load();
      } else {
        onNotify(json.error || "Erreur", "error");
      }
    } catch {
      onNotify("Erreur réseau", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/v1/roles/${confirmDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        onNotify("Rôle supprimé.", "success");
        setConfirmDelete(null);
        load();
      } else {
        onNotify(json.error || "Erreur", "error");
      }
    } catch {
      onNotify("Erreur réseau", "error");
    }
  };

  const grouped = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    permissions.forEach((p) => {
      const cat = p.category || "Autres";
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [permissions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 horizon-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-foreground">Rôles ({roles.length})</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Les rôles système ne sont pas modifiables. Créez des rôles personnalisés pour affiner les droits.
          </p>
        </div>
        <button onClick={openCreate} className="btn-horizon btn-horizon-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Nouveau rôle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="horizon-card p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="text-base font-bold text-foreground">{role.name}</h5>
                  {role.isSystem && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      SYSTÈME
                    </span>
                  )}
                  {role.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      DÉFAUT
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {role.description || "Aucune description"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
              <span>{role.permissions.length} permissions</span>
              <span>•</span>
              <span>{role._count?.users ?? 0} utilisateurs</span>
            </div>

            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
              <button
                onClick={() => openEdit(role)}
                disabled={role.isSystem}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-colors ${
                  role.isSystem
                    ? "bg-background text-muted-foreground cursor-not-allowed"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {role.isSystem ? "Verrouillé" : "Modifier"}
              </button>
              <button
                onClick={() => setConfirmDelete(role)}
                disabled={role.isSystem}
                className={`p-2 rounded-lg transition-colors ${
                  role.isSystem
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-red-600 hover:bg-red-50"
                }`}
                title={role.isSystem ? "Rôle système non supprimable" : "Supprimer"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal create/edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-card rounded-2xl shadow-horizon-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                {editing ? `Modifier le rôle "${editing.name}"` : "Créer un nouveau rôle"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {!editing && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Nom du rôle *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="ex: RESPONSABLE_EVANGELISATION"
                      className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-[#F4F7FE] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Majuscules et underscores uniquement.
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="À quoi sert ce rôle ?"
                    className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-[#F4F7FE] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <input
                      type="checkbox"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span>Rôle par défaut (attribué automatiquement aux nouveaux comptes)</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Permissions ({formPermissionIds.length} sélectionnées)
                  </label>
                  <div className="max-h-[45vh] overflow-y-auto border border-border rounded-lg p-3 space-y-4 bg-background/30">
                    {Object.entries(grouped).map(([category, perms]) => (
                      <div key={category}>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
                          {category}
                        </div>
                        <div className="space-y-1.5">
                          {perms.map((perm) => {
                            const checked = formPermissionIds.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                                  checked ? "bg-primary/5" : "hover:bg-background"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    setFormPermissionIds((prev) =>
                                      e.target.checked
                                        ? [...prev, perm.id]
                                        : prev.filter((id) => id !== perm.id)
                                    );
                                  }}
                                  className="mt-0.5 rounded text-primary focus:ring-primary"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-foreground">
                                    {perm.action}:{perm.resource}
                                    {perm.scope && <span className="text-primary">.{perm.scope}</span>}
                                  </div>
                                  {perm.description && (
                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                      {perm.description}
                                    </div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-horizon btn-horizon-secondary text-sm font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!editing && !formName.trim())}
                  className="btn-horizon btn-horizon-primary flex items-center gap-2 text-sm font-bold disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{submitting ? "Enregistrement…" : "Enregistrer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 bg-card rounded-2xl shadow-horizon-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-foreground">Supprimer ce rôle ?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Le rôle <strong>{confirmDelete.name}</strong> sera supprimé définitivement.
              {confirmDelete._count && confirmDelete._count.users > 0 && (
                <span className="block mt-2 text-red-600 font-bold">
                  ⚠️ Ce rôle est assigné à {confirmDelete._count.users} utilisateur(s). Retirez-le d&apos;abord.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-horizon btn-horizon-secondary text-sm font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="btn-horizon bg-red-600 hover:bg-red-700 text-white text-sm font-bold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILISATEURS
// ═══════════════════════════════════════════════════════════════════════════
function UsersTab({ onNotify }: { onNotify: (m: string, t: "success" | "error") => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<UserRow | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, rRes] = await Promise.all([
        fetch("/api/v1/users"),
        fetch("/api/v1/roles"),
      ]);
      const uJson = await uRes.json();
      const rJson = await rRes.json();
      if (uJson.success) setUsers(uJson.data);
      if (rJson.success) setRoles(rJson.data);
    } catch {
      onNotify("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => { load(); }, [load]);

  const openAssign = (user: UserRow) => {
    setAssigning(user);
    setSelectedRoleIds(user.roles.map((r) => r.role.id));
  };

  const handleSave = async () => {
    if (!assigning) return;
    if (selectedRoleIds.length === 0) {
      onNotify("Au moins un rôle est requis", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/users/${assigning.id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: selectedRoleIds, mode: "replace" }),
      });
      const json = await res.json();
      if (json.success) {
        onNotify("Rôles mis à jour !", "success");
        setAssigning(null);
        load();
      } else {
        onNotify(json.error || "Erreur", "error");
      }
    } catch {
      onNotify("Erreur réseau", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 horizon-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-base font-bold text-foreground">Utilisateurs ({users.length})</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Assignez un ou plusieurs rôles à chaque utilisateur. Les permissions sont calculées à partir de tous ses rôles.
        </p>
      </div>

      <div className="horizon-card !p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Utilisateur</th>
              <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Rôles actuels</th>
              <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Statut</th>
              <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-background/40 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {(user.name || user.email).split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{user.name || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">Aucun</span>
                    ) : (
                      user.roles.map((ur) => (
                        <span
                          key={ur.role.id}
                          className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {ur.role.name}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                    user.isActive ? "text-emerald-600" : "text-red-600"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                    {user.isActive ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => openAssign(user)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Gérer les rôles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-card rounded-2xl shadow-horizon-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Rôles de {assigning.name || assigning.email}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Sélectionnez les rôles à attribuer.</p>
              </div>
              <button onClick={() => setAssigning(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-2">
              {roles.map((role) => {
                const checked = selectedRoleIds.includes(role.id);
                return (
                  <label
                    key={role.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      checked
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-background"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedRoleIds((prev) =>
                          e.target.checked
                            ? [...prev, role.id]
                            : prev.filter((id) => id !== role.id)
                        );
                      }}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">{role.name}</span>
                        {role.isSystem && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            SYSTÈME
                          </span>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {role.permissions.length} permissions
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border">
              <button
                onClick={() => setAssigning(null)}
                className="btn-horizon btn-horizon-secondary text-sm font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-horizon btn-horizon-primary flex items-center gap-2 text-sm font-bold disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? "Enregistrement…" : "Enregistrer"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { 
  Check, 
  X,
  Lock,
  UserCheck,
  Save,
  Loader2
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface Permission {
  id: string;
  action: string;
  resource: string;
  description: string | null;
}

interface RolePermissionMapping {
  roleId: string;
  permissionId: string;
}

export default function PermissionsPage() {
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [mappings, setMappings] = useState<RolePermissionMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/permissions`);
        const json = await res.json();
        if (json.success && json.data) {
          setRoles(json.data.roles || []);
          setPermissions(json.data.permissions || []);
          setMappings(json.data.rolePermissions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const isPermissionGranted = (roleId: string, permissionId: string) => {
    return mappings.some(m => m.roleId === roleId && m.permissionId === permissionId);
  };

  const handleTogglePermission = (roleId: string, permissionId: string, roleName: string, action: string, resource: string) => {
    if (roleName === "ADMIN" && action === "manage" && resource === "roles") {
      showNotification("Impossible de désactiver les droits d'administration de l'Admin Général", "error");
      return;
    }

    setMappings(prev => {
      const exists = prev.some(m => m.roleId === roleId && m.permissionId === permissionId);
      if (exists) {
        return prev.filter(m => !(m.roleId === roleId && m.permissionId === permissionId));
      } else {
        return [...prev, { roleId, permissionId }];
      }
    });
  };

  const handleSaveMatrix = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/v1/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rolePermissions: mappings })
      });
      const json = await res.json();
      if (json.success) {
        showNotification("Matrice de droits enregistrée avec succès !", "success");
      } else {
        showNotification("Erreur lors de la sauvegarde: " + json.error, "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  // Helper translation map for labels
  const getPermissionLabel = (action: string, resource: string) => {
    const key = `${action}:${resource}`;
    const labels: Record<string, string> = {
      "read:members": "Lecture Membres",
      "write:members": "Écriture Membres",
      "read:groups": "Lecture Groupes",
      "write:groups": "Écriture Groupes",
      "read:meetings": "Lecture Réunions",
      "write:meetings": "Écriture Réunions",
      "read:finances": "Lecture Finances",
      "write:finances": "Écriture Finances",
      "manage:roles": "Gestion Rôles & Permissions"
    };
    return labels[key] || `${action} ${resource}`;
  };

  return (
    <DashboardLayout title="Permissions & Droits d'Accès">
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

      {/* Intro visual header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 mb-8 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-lg bg-primary/5 text-primary border border-primary/10">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Matrice d&apos;Autorisations (RBAC)</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">Configurez les droits d&apos;accès granulaires pour chaque profil utilisateur de ChurchFlow.</p>
          </div>
        </div>

        <button
          onClick={handleSaveMatrix}
          disabled={loading || saving}
          className="flex items-center justify-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium w-full md:w-auto disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
          ) : (
            <Save className="w-4.5 h-4.5" />
          )}
          <span>Enregistrer les modifications</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-500">Chargement de la matrice d&apos;autorisations...</p>
        </div>
      ) : (
        /* RBAC Table Matrix */
        <div className="rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-5 px-6 min-w-[240px]">Profils / Rôles</th>
                  {permissions.map((p) => (
                    <th key={p.id} className="py-5 px-4 text-center text-[10px] font-bold tracking-wider max-w-[120px]">
                      {getPermissionLabel(p.action, p.resource)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {roles.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-5 px-6 font-semibold text-slate-900 flex items-center space-x-3.5">
                      <UserCheck className="w-5 h-5 text-slate-400" />
                      <span>{row.name}</span>
                    </td>
                    
                    {permissions.map((perm) => {
                      const isGranted = isPermissionGranted(row.id, perm.id);
                      return (
                        <td key={perm.id} className="py-5 px-4 text-center">
                          <button
                            onClick={() => handleTogglePermission(row.id, perm.id, row.name, perm.action, perm.resource)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                              isGranted
                                ? "bg-primary/10 border border-primary/20 text-primary shadow-sm scale-105"
                                : "bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-400 hover:bg-slate-100/50"
                            }`}
                          >
                            {isGranted ? (
                              <Check className="w-4.5 h-4.5 stroke-[3]" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

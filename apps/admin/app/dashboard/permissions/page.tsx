"use client";

import React, { useState } from "react";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { 
  Check, 
  X,
  Lock,
  UserCheck,
  Save
} from "lucide-react";

interface RolePermission {
  role: string;
  permissions: {
    [key: string]: boolean;
  };
}

export default function PermissionsPage() {
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const permissionKeys = [
    { key: "read_members", label: "Lecture Membres" },
    { key: "write_members", label: "Écriture/Modif Membres" },
    { key: "read_groups", label: "Lecture Groupes/GEM" },
    { key: "write_groups", label: "Écriture Groupes/GEM" },
    { key: "read_formations", label: "Lecture Écoles/Formations" },
    { key: "write_formations", label: "Écriture Écoles/Formations" },
    { key: "read_finances", label: "Lecture Finances" },
    { key: "write_finances", label: "Écriture/Saisie Finances" },
    { key: "manage_roles", label: "Gestion Rôles & Permissions" }
  ];

  const [roleMatrix, setRoleMatrix] = useState<RolePermission[]>([
    {
      role: "Administrateur Général",
      permissions: {
        read_members: true, write_members: true,
        read_groups: true, write_groups: true,
        read_formations: true, write_formations: true,
        read_finances: true, write_finances: true,
        manage_roles: true
      }
    },
    {
      role: "Pasteur Titulaire",
      permissions: {
        read_members: true, write_members: true,
        read_groups: true, write_groups: true,
        read_formations: true, write_formations: true,
        read_finances: true, write_finances: false,
        manage_roles: false
      }
    },
    {
      role: "Berger de GEM",
      permissions: {
        read_members: true, write_members: false,
        read_groups: true, write_groups: false,
        read_formations: false, write_formations: false,
        read_finances: false, write_finances: false,
        manage_roles: false
      }
    },
    {
      role: "Responsable Département",
      permissions: {
        read_members: true, write_members: false,
        read_groups: true, write_groups: true,
        read_formations: false, write_formations: false,
        read_finances: false, write_finances: false,
        manage_roles: false
      }
    },
    {
      role: "Trésorier",
      permissions: {
        read_members: false, write_members: false,
        read_groups: false, write_groups: false,
        read_formations: false, write_formations: false,
        read_finances: true, write_finances: true,
        manage_roles: false
      }
    }
  ]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleTogglePermission = (roleIndex: number, permKey: string) => {
    if (roleMatrix[roleIndex].role === "Administrateur Général" && permKey === "manage_roles") {
      showNotification("Impossible de désactiver les droits d'administration de l'Admin Général", "error");
      return;
    }

    setRoleMatrix(prev => {
      const copy = [...prev];
      copy[roleIndex] = {
        ...copy[roleIndex],
        permissions: {
          ...copy[roleIndex].permissions,
          [permKey]: !copy[roleIndex].permissions[permKey]
        }
      };
      return copy;
    });
  };

  const handleSaveMatrix = () => {
    showNotification("Matrice de droits enregistrée avec succès !", "success");
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
          className="flex items-center justify-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium w-full md:w-auto"
        >
          <Save className="w-4.5 h-4.5" />
          <span>Enregistrer les modifications</span>
        </button>
      </div>

      {/* RBAC Table Matrix */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-5 px-6 min-w-[240px]">Profils / Rôles</th>
                {permissionKeys.map((p) => (
                  <th key={p.key} className="py-5 px-4 text-center text-[10px] font-bold tracking-wider max-w-[120px]">
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {roleMatrix.map((row, roleIdx) => (
                <tr key={row.role} className="hover:bg-slate-50/30 transition-colors">
                  <td className="py-5 px-6 font-semibold text-slate-900 flex items-center space-x-3.5">
                    <UserCheck className="w-5 h-5 text-slate-400" />
                    <span>{row.role}</span>
                  </td>
                  
                  {permissionKeys.map((perm) => {
                    const isGranted = row.permissions[perm.key];
                    return (
                      <td key={perm.key} className="py-5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePermission(roleIdx, perm.key)}
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
    </DashboardLayout>
  );
}

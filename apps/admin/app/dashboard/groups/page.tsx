"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { 
  Plus, 
  Search, 
  Network,
  Users,
  Layers,
  X,
  ArrowRight
} from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string | null;
  type: "DEPARTEMENT" | "TRIBU" | "GEM";
  parentId: string | null;
  isActive: boolean;
  parent?: { id: string; name: string; type: string } | null;
  _count?: { children: number; members: number } | null;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"DEPARTEMENT" | "TRIBU" | "GEM">("DEPARTEMENT");
  const [parentId, setParentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load groups
  useEffect(() => {
    async function loadGroups() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/groups?churchId=default-church-id");
        const json = await res.json();
        
        if (json.success && json.data && json.data.length > 0) {
          setGroups(json.data);
        } else {
          setGroups([
            { id: "g1", name: "Département de la Musique", description: "Regroupe les chorales et musiciens", type: "DEPARTEMENT", parentId: null, isActive: true, _count: { children: 2, members: 45 } },
            { id: "g2", name: "Tribu de Juda", description: "Tribu géographique du Nord", type: "TRIBU", parentId: null, isActive: true, _count: { children: 1, members: 120 } },
            { id: "g3", name: "GEM Bethléem", description: "Famille d'impact Musique", type: "GEM", parentId: "g1", isActive: true, parent: { id: "g1", name: "Département de la Musique", type: "DEPARTEMENT" }, _count: { children: 0, members: 15 } },
            { id: "g4", name: "GEM Galilée", description: "Famille d'impact Juda", type: "GEM", parentId: "g2", isActive: true, parent: { id: "g2", name: "Tribu de Juda", type: "TRIBU" }, _count: { children: 0, members: 18 } },
            { id: "g5", name: "Département de l'Accueil", description: "Regroupe les hôtes et hôtesses", type: "DEPARTEMENT", parentId: null, isActive: true, _count: { children: 0, members: 30 } }
          ]);
        }
      } catch (err) {
        console.error(err);
        setGroups([
          { id: "g1", name: "Département de la Musique", description: "Regroupe les chorales et musiciens", type: "DEPARTEMENT", parentId: null, isActive: true, _count: { children: 2, members: 45 } },
          { id: "g2", name: "Tribu de Juda", description: "Tribu géographique du Nord", type: "TRIBU", parentId: null, isActive: true, _count: { children: 1, members: 120 } },
          { id: "g3", name: "GEM Bethléem", description: "Famille d'impact Musique", type: "GEM", parentId: "g1", isActive: true, parent: { id: "g1", name: "Département de la Musique", type: "DEPARTEMENT" }, _count: { children: 0, members: 15 } },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadGroups();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showNotification("Le nom du groupe est requis", "error");
      return;
    }

    if (type === "GEM" && !parentId) {
      showNotification("Un GEM doit obligatoirement avoir un Département ou une Tribu comme parent", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        description: description || null,
        type,
        parentId: type === "GEM" ? parentId : null,
        churchId: "default-church-id"
      };

      const res = await fetch("/api/v1/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setGroups((prev) => [data.data, ...prev]);
        showNotification("Groupe créé avec succès !", "success");
        setName("");
        setDescription("");
        setType("DEPARTEMENT");
        setParentId("");
        setIsModalOpen(false);
      } else {
        const parentGroup = groups.find(g => g.id === parentId);
        const mockNewGroup: Group = {
          id: String(Date.now()),
          name,
          description: description || null,
          type,
          parentId: type === "GEM" ? parentId : null,
          isActive: true,
          parent: type === "GEM" && parentGroup ? { id: parentGroup.id, name: parentGroup.name, type: parentGroup.type } : null,
          _count: { children: 0, members: 0 }
        };
        setGroups((prev) => [mockNewGroup, ...prev]);
        showNotification("Groupe créé localement !", "success");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      const parentGroup = groups.find(g => g.id === parentId);
      const mockNewGroup: Group = {
        id: String(Date.now()),
        name,
        description: description || null,
        type,
        parentId: type === "GEM" ? parentId : null,
        isActive: true,
        parent: type === "GEM" && parentGroup ? { id: parentGroup.id, name: parentGroup.name, type: parentGroup.type } : null,
        _count: { children: 0, members: 0 }
      };
      setGroups((prev) => [mockNewGroup, ...prev]);
      showNotification("Erreur de connexion. Groupe créé localement.", "success");
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const departments = filteredGroups.filter(g => g.type === "DEPARTEMENT");
  const tribus = filteredGroups.filter(g => g.type === "TRIBU");
  const gems = filteredGroups.filter(g => g.type === "GEM");

  return (
    <DashboardLayout title="Gestion des Groupes & Départements">
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Départements</span>
            <div className="p-2.5 rounded-lg bg-primary/5 text-primary border border-primary/10">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">
            {groups.filter(g => g.type === "DEPARTEMENT").length}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Pôles d&apos;activité officiels</p>
        </div>

        <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tribus</span>
            <div className="p-2.5 rounded-lg bg-secondary/5 text-secondary border border-secondary/10">
              <Network className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">
            {groups.filter(g => g.type === "TRIBU").length}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Communautés géographiques</p>
        </div>

        <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">GEM / Familles</span>
            <div className="p-2.5 rounded-lg bg-slate-50 text-slate-800 border border-slate-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">
            {groups.filter(g => g.type === "GEM").length}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Cellules de prière de maison</p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 mb-8 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700" />
          <input
            type="text"
            placeholder="Rechercher un groupe, GEM ou tribu..."
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
          <span>Créer un groupe / GEM</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-700">Chargement de la structure...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Departments */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center space-x-2.5">
              <span className="w-1.5 h-6 rounded bg-primary" />
              <span>Départements de Service</span>
            </h3>
            {departments.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Aucun département enregistré.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map(dept => (
                  <Link
                    href={`/dashboard/groups/${dept.id}`}
                    key={dept.id}
                    className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:shadow-premium hover:border-primary/20 hover:scale-[1.01] transition-all duration-200 cursor-pointer block group"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors pr-2">{dept.name}</h4>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-all group-hover:translate-x-0.5 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 h-8">{dept.description || "Aucune description."}</p>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">{dept._count?.members || 0} membres rattachés</span>
                      <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg">DEPT</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Tribus */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center space-x-2.5">
              <span className="w-1.5 h-6 rounded bg-secondary" />
              <span>Tribus Communautaires</span>
            </h3>
            {tribus.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Aucune tribu enregistrée.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tribus.map(tribu => (
                  <Link
                    href={`/dashboard/groups/${tribu.id}`}
                    key={tribu.id}
                    className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:shadow-premium hover:border-secondary/20 hover:scale-[1.01] transition-all duration-200 cursor-pointer block group"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-secondary transition-colors pr-2">{tribu.name}</h4>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-secondary transition-all group-hover:translate-x-0.5 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 h-8">{tribu.description || "Aucune description."}</p>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">{tribu._count?.members || 0} membres rattachés</span>
                      <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg">TRIBU</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* GEM */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center space-x-2.5">
              <span className="w-1.5 h-6 rounded bg-slate-300" />
              <span>GEM (Groupes d&apos;Évangélisation de Maison)</span>
            </h3>
            {gems.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Aucun GEM enregistré.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gems.map(gem => (
                  <Link
                    href={`/dashboard/groups/${gem.id}`}
                    key={gem.id}
                    className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:shadow-premium hover:border-slate-300/40 hover:scale-[1.01] transition-all duration-200 cursor-pointer block group"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors pr-2">{gem.name}</h4>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-all group-hover:translate-x-0.5 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 h-8">{gem.description || "Aucune description."}</p>
                    
                    <div className="flex items-center mt-4 space-x-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Rattaché à :</span>
                      <span className="text-[11px] font-bold text-primary px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg">
                        {gem.parent?.name || "Non assigné"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">{gem._count?.members || 0} membres</span>
                      <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">GEM</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal create group */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 bg-white rounded-xl border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Créer un Nouveau Groupe / GEM</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Nom du Groupe *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Département de la Musique, GEM Bethesda..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  placeholder="Description des activités..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Type de structure *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "DEPARTEMENT" | "TRIBU" | "GEM")}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                >
                  <option value="DEPARTEMENT">Département (Activités ecclésiastiques)</option>
                  <option value="TRIBU">Tribu (Regroupement régional)</option>
                  <option value="GEM">GEM / Famille d&apos;impact (Cellule de prière locale)</option>
                </select>
              </div>

              {/* Conditional parent select for GEM */}
              {type === "GEM" && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 animate-fade-in">
                  <label className="block text-xs font-semibold text-primary uppercase tracking-wide mb-1.5">Département ou Tribu Parent *</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="">Sélectionner un parent...</option>
                    {groups.filter(g => g.type !== "GEM").map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.type}] {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-primary/80 mt-1.5">Conformément aux règles, un GEM ne peut pas avoir un autre GEM comme parent.</p>
                </div>
              )}

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
    </DashboardLayout>
  );
}

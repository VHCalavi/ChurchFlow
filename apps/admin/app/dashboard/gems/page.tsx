"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Search, Plus, ArrowRight, Users, FileText, Building, X, Check } from "lucide-react";
import { HorizonCard } from "@/components/ui/horizon-card";

export default function GemsPage() {
  const [gems, setGems] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [gemName, setGemName] = useState("");
  const [gemDescription, setGemDescription] = useState("");
  const [gemGroupId, setGemGroupId] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  // Map memberId -> gem object for logic and display
  const memberGemMap = new Map<string, any>();
  gems.forEach(gem => {
    (gem.members || []).forEach((gm: any) => {
      if (gm.member?.id) memberGemMap.set(gm.member.id, gem);
    });
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [gemsRes, groupsRes, membersRes] = await Promise.all([
          fetch(`/api/v1/gems`),
          fetch(`/api/v1/groups`),
          fetch(`/api/v1/members`),
        ]);
        const gemsJson = await gemsRes.json();
        const groupsJson = await groupsRes.json();
        const membersJson = await membersRes.json();
        if (gemsJson.success) setGems(gemsJson.data || []);
        if (groupsJson.success) setGroups(groupsJson.data || []);
        if (membersJson.success) setAllMembers(membersJson.data || []);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredGems = gems.filter(gem =>
    gem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gem.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModalMembers = allMembers.filter(m =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openModal = () => {
    setGemName("");
    setGemDescription("");
    setGemGroupId("");
    setSelectedMemberIds([]);
    setMemberSearch("");
    setIsModalOpen(true);
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);

      const newMemberGem = memberGemMap.get(id);
      
      // Check for conflict
      const existingGemInSelection = prev
        .map(selId => memberGemMap.get(selId))
        .find(gem => gem !== undefined);

      if (newMemberGem && existingGemInSelection && newMemberGem.id !== existingGemInSelection.id) {
        showNotification("Impossible de sélectionner des membres appartenant à des GEMs différents.", "error");
        return prev;
      }

      // Autofill if a member with a GEM is selected
      if (newMemberGem) {
         setGemName(newMemberGem.name);
         setGemDescription(newMemberGem.description || "");
         setGemGroupId(newMemberGem.groupId || "");
      }

      return [...prev, id];
    });
  };

  const handleCreateGem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gemName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/gems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: gemName,
          description: gemDescription || undefined,
          groupId: gemGroupId || undefined,
          isActive: true,
          memberIds: selectedMemberIds,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        const reloadRes = await fetch("/api/v1/gems");
        const reloadJson = await reloadRes.json();
        if (reloadJson.success) setGems(reloadJson.data);

        if (json.isExisting) {
          showNotification(`Membres ajoutés avec succès au GEM ${json.data.name} !`, "success");
        } else {
          showNotification("GEM créé avec succès !", "success");
        }
      } else {
        showNotification(json.error || "Erreur lors de la création", "error");
      }
    } catch {
      showNotification("Erreur réseau", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Gestion des GEMs">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-8 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        } animate-fade-in`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <HorizonCard className="p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2559]">Gestion des GEMs</h1>
            <p className="text-[#6D6E71] mt-2">Gérer vos Groupes d&apos;Évangélisation et de Maison</p>
          </div>
          <button onClick={openModal} className="btn-horizon btn-horizon-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau GEM
          </button>
        </div>
      </HorizonCard>

      {/* Search */}
      <HorizonCard className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#A3AED0]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un GEM..."
            className="w-full pl-10 pr-4 py-3 bg-[#F4F7FE] rounded-full text-sm font-medium text-[#1B2559] focus:outline-none"
          />
        </div>
      </HorizonCard>

      {/* GEM List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#006C69] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredGems.length > 0 ? (
          filteredGems.map(gem => (
            <HorizonCard key={gem.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-[#006C69]/10 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-[#006C69]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1B2559] truncate">{gem.name}</h3>
                    {gem.description && (
                      <p className="text-sm text-[#6D6E71] truncate">{gem.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-[#A3AED0]">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {gem._count?.members ?? gem.members?.length ?? 0} membre{(gem._count?.members ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {gem._count?.reports ?? gem.reports?.length ?? 0} rapport{(gem._count?.reports ?? 0) !== 1 ? 's' : ''}
                      </span>
                      {gem.group && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {gem.group.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    gem.isActive !== false ? 'bg-[#006C69]/10 text-[#006C69]' : 'bg-[#F4F7FE] text-[#6D6E71]'
                  }`}>
                    {gem.isActive !== false ? 'Actif' : 'Inactif'}
                  </span>
                  <Link href={`/dashboard/gems/${gem.id}`} className="p-2 text-[#A3AED0] hover:text-[#006C69] hover:bg-[#006C69]/10 rounded-full transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </HorizonCard>
          ))
        ) : (
          <HorizonCard className="p-12">
            <div className="text-center">
              <Building className="w-12 h-12 mx-auto text-[#D6D1CE] mb-4" />
              <p className="text-[#6D6E71]">Aucun GEM trouvé. Créez votre premier GEM pour commencer.</p>
            </div>
          </HorizonCard>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-lg bg-white rounded-[20px] shadow-horizon-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[#E0E5F2] shrink-0">
              <h3 className="text-base font-bold text-[#1B2559]">Créer un nouveau GEM</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreateGem} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Nom */}
                <div>
                  <label className="text-sm font-bold text-[#1B2559] block mb-2">Nom du GEM *</label>
                  <input
                    type="text"
                    value={gemName}
                    onChange={e => setGemName(e.target.value)}
                    placeholder="Ex: GEM Victoire"
                    className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-bold text-[#1B2559] block mb-2">Description</label>
                  <input
                    type="text"
                    value={gemDescription}
                    onChange={e => setGemDescription(e.target.value)}
                    placeholder="Description du GEM"
                    className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
                  />
                </div>

                {/* Groupe parent */}
                <div>
                  <label className="text-sm font-bold text-[#1B2559] block mb-2">Groupe parent</label>
                  <select
                    value={gemGroupId}
                    onChange={e => setGemGroupId(e.target.value)}
                    className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#006C69]/25"
                  >
                    <option value="">Aucun (GEM indépendant)</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}{g.type ? ` (${g.type})` : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Sélection des membres */}
                <div>
                  <label className="text-sm font-bold text-[#1B2559] block mb-2">
                    Membres du GEM
                    {selectedMemberIds.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-[#006C69]/10 text-[#006C69] rounded-full text-xs">
                        {selectedMemberIds.length} sélectionné{selectedMemberIds.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </label>
                  {/* Membres sélectionnés (chips) */}
                  {selectedMemberIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedMemberIds.map(id => {
                        const m = allMembers.find(x => x.id === id);
                        if (!m) return null;
                        return (
                          <span key={id} className="flex items-center gap-1 px-3 py-1 bg-[#006C69]/10 text-[#006C69] rounded-full text-xs font-bold">
                            {m.firstName} {m.lastName}
                            <button type="button" onClick={() => toggleMember(id)} className="ml-1 hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {/* Recherche membre */}
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-[#A3AED0]" />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      placeholder="Rechercher un membre..."
                      className="w-full pl-9 pr-4 py-2.5 bg-[#F4F7FE] rounded-xl text-sm font-medium text-[#1B2559] focus:outline-none"
                    />
                  </div>
                  {/* Liste */}
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-[#E0E5F2] divide-y divide-[#F4F7FE]">
                    {filteredModalMembers.length === 0 ? (
                      <p className="text-center text-xs text-[#A3AED0] py-4">Aucun membre trouvé</p>
                    ) : filteredModalMembers.map(m => {
                      const isSelected = selectedMemberIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleMember(m.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? 'bg-[#006C69]/5' : 'hover:bg-[#F4F7FE]'}`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'bg-[#006C69] text-white' : 'bg-[#E0E5F2] text-[#1B2559]'}`}>
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : `${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1B2559] truncate">{m.firstName} {m.lastName}</p>
                            {memberGemMap.has(m.id) ? (
                              <p className="text-xs text-[#CEAD1E] font-semibold truncate">GEM : {memberGemMap.get(m.id).name}</p>
                            ) : m.email ? (
                              <p className="text-xs text-[#A3AED0] truncate">{m.email}</p>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 border-t border-[#E0E5F2] flex gap-3 shrink-0">
                <button
                  type="submit"
                  disabled={submitting || !gemName.trim()}
                  className="flex-1 btn-horizon btn-horizon-primary disabled:opacity-50"
                >
                  {submitting ? 'Création...' : 'Créer le GEM'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-bold rounded-full border border-[#E0E5F2] bg-white text-[#6D6E71] hover:bg-[#F4F7FE] transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
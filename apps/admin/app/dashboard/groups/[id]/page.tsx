"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "../../../../components/layout/dashboard-layout";
import { ArrowLeft, ArrowRight, Users, UserPlus, Trash2, Search, X, Edit3, AlertTriangle, Building, Layers } from "lucide-react";
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

  useEffect(() => {
    loadGroup();
    loadGems();
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

  function notify(message: string, type: "success" | "error") {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }

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
          Membres
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
          GEMs
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

          <HorizonCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1B2559]">Membres du Groupe</h3>
              <button className="btn-horizon btn-horizon-primary">
                <UserPlus className="w-3.5 h-3.5" /><span>Ajouter un membre</span>
              </button>
            </div>

            {group.members.length > 0 ? (
              <div className="space-y-2">
                {group.members.map((member: any) => (
                  <div key={member.memberId} className="flex items-center justify-between px-6 py-3.5 hover:bg-[#F8F9FA] transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#12BC7E]/10 text-[#12BC7E] flex items-center justify-center font-semibold text-sm border border-[#12BC7E]/20">
                        {member.member.firstName[0]}{member.member.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1B2559]">{member.member.firstName} {member.member.lastName}</p>
                        <p className="text-sm font-medium text-muted-foreground">{member.member.status}</p>
                      </div>
                    </div>
                    <select
                      value={member.role || "membre"}
                      className="px-3 py-1.5 text-sm font-medium rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#12BC7E]/25 cursor-pointer"
                    >
                      <option value="membre">Membre</option>
                      <option value="responsable">Responsable</option>
                      <option value="co-responsable">Co-responsable</option>
                      <option value="assistant">Assistant</option>
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#6D6E71]">Aucun membre dans ce groupe.</p>
            )}
          </HorizonCard>

          <HorizonCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1B2559]">GEMs associés</h3>
              <Link href={`/dashboard/gems?groupId=${groupId}`} className="btn-horizon btn-horizon-primary">
                <Building className="w-4 h-4 mr-2" />
                <span>Gérer les GEMs</span>
              </Link>
            </div>

            {group.children.filter(c => c.type === 'CELLULE').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.children
                  .filter(c => c.type === 'CELLULE')
                  .map(gem => (
                    <Link
                      key={gem.id}
                      href={`/dashboard/gems/${gem.id}`}
                      className="horizon-card group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-bold text-[#1B2559]">{gem.name}</h4>
                          <p className="text-sm text-muted-foreground mt-2">GEM - Cellule d'évangélisation</p>
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
                      className="horizon-card group"
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
                              <span>{gem._count.members} membre{gem._count.members !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{gem._count.reports} rapport{gem._count.reports !== 1 ? 's' : ''}</span>
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
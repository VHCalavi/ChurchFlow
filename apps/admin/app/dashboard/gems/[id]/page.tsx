"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ArrowLeft, Users, UserPlus, Trash2, Building, Calendar } from "lucide-react";
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

  useEffect(() => {
    loadGem();
  }, [gemId]);

  async function loadGem() {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/gems/${gemId}`);
      const data = await res.json();
      if (data.success) {
        setGem(data.data);
      }
    } catch (err) {
      console.error("Error loading gem:", err);
    } finally {
      setLoading(false);
    }
  }

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
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[#F4F7FE] text-[#006C69] border border-[#D6D1CE] mt-2">
                    {gem.group.name}
                  </span>
                )}
                {gem.description && (
                  <p className="text-sm text-[#6D6E71] mt-3">{gem.description}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                gem.isActive
                  ? "bg-[#006C69] text-white"
                  : "bg-[#F4F7FE] text-[#6D6E71] border border-[#D6D1CE]"
              }`}>
                {gem.isActive ? "Actif" : "Inactif"}
              </span>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#D6D1CE]">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-[#A3AED0]" />
                  <span className="text-[#6D6E71] font-bold">
                    {gem.members.length} membre{gem.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[#A3AED0]" />
                  <span className="text-[#6D6E71] font-bold">
                    {gem.reports.length} rapport{gem.reports.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </HorizonCard>

          {/* Members Section */}
          <HorizonCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1B2559]">Membres du GEM</h2>
              <button className="btn-horizon btn-horizon-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                <span>Ajouter un membre</span>
              </button>
            </div>

            {gem.members.length > 0 ? (
              <div className="space-y-4">
                {gem.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#12BC7E]/10 text-[#12BC7E] flex items-center justify-center font-semibold text-sm border border-[#12BC7E]/20">
                        {member.member.firstName[0]}{member.member.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1B2559]">
                          {member.member.firstName} {member.member.lastName}
                        </h3>
                        <p className="text-sm text-[#6D6E71]">{member.member.status}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        member.isLeader
                          ? "bg-[#006C69] text-white"
                          : "bg-[#F4F7FE] text-[#6D6E71] border border-[#D6D1CE]"
                      }`}>
                        {member.isLeader ? "Leader" : "Membre"}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold border border-[#D6D1CE] text-[#6D6E71]">
                        {member.role}
                      </span>
                      <button className="p-2 text-[#CD3C14] hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#6D6E71] py-8">Aucun membre dans ce GEM.</p>
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
                          <span className="px-3 py-1 rounded-full text-sm font-semibold border border-[#D6D1CE] text-[#6D6E71]">
                            {report.type}
                          </span>
                          <span className="text-sm text-[#6D6E71]">
                            {new Date(report.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-[#6D6E71] line-clamp-3">
                          {report.content}
                        </p>

                        <p className="text-sm text-[#6D6E71] mt-2">
                          Par {report.author.firstName} {report.author.lastName}
                        </p>
                      </div>

                      <button className="btn-horizon btn-horizon-secondary ml-4">
                        Voir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#6D6E71] py-8">Aucun rapport pour ce GEM.</p>
            )}
          </HorizonCard>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm font-medium">GEM non trouvé.</div>
      )}
    </DashboardLayout>
  );
}
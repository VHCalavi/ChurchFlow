"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Network, Users, Building, FileText } from "lucide-react";

export default function GraphPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout title="Graphiques">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B2559] mb-4">Vue d'ensemble de l'église</h1>
        <p className="text-[#6D6E71]">Visualisation interactive des données de l'église</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="horizon-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#6D6E71]">Total Membres</p>
              <p className="text-2xl font-bold text-[#006C69]">4</p>
            </div>
            <Users className="w-8 h-8 text-[#12BC7E]" />
          </div>
        </div>

        <div className="horizon-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#6D6E71]">Groupes</p>
              <p className="text-2xl font-bold text-[#006C69]">3</p>
            </div>
            <Network className="w-8 h-8 text-[#12BC7E]" />
          </div>
        </div>

        <div className="horizon-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#6D6E71]">GEMs</p>
              <p className="text-2xl font-bold text-[#006C69]">2</p>
            </div>
            <Building className="w-8 h-8 text-[#12BC7E]" />
          </div>
        </div>

        <div className="horizon-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#6D6E71]">Rapports</p>
              <p className="text-2xl font-bold text-[#006C69]">5</p>
            </div>
            <FileText className="w-8 h-8 text-[#12BC7E]" />
          </div>
        </div>
      </div>

      {/* Graph Visualization Placeholder */}
      <div className="horizon-card p-6">
        <h2 className="text-xl font-bold text-[#1B2559] mb-4">Graphique d'organisation</h2>
        <div className="h-[500px] bg-[#F4F7FE] rounded-xl flex items-center justify-center">
          <div className="text-center">
            <Network className="w-16 h-16 mx-auto text-[#D6D1CE] mb-4" />
            <p className="text-[#6D6E71] text-lg">Visualisation interactive</p>
            <p className="text-[#6D6E71] text-sm mt-2">Fonctionnalité en cours de développement</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
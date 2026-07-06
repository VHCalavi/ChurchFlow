"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Network, Settings, Download } from "lucide-react";
import { HorizonCard } from "@/components/ui/horizon-card";

interface GraphNode {
  id: string;
  type: 'member' | 'group' | 'gem';
  position: { x: number; y: number };
  data: {
    label: string;
    photo?: string;
    memberCount?: number;
    groupCount?: number;
    gemCount?: number;
  };
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'supervises' | 'belongs_to' | 'member_of';
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    showPastoral: true,
    showGroups: true,
    showGems: true,
    showFamily: true,
    showMembers: false,
  });

  useEffect(() => {
    loadGraphData();
  }, []);

  async function loadGraphData() {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/graph");
      const json = await res.json();
      if (json.success) {
        setGraphData(json.data);
      }
    } catch (err) {
      console.error("Error loading graph data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Simuler un graphique simple pour le moment
  const renderGraph = () => {
    if (!graphData) return null;

    return (
      <div className="relative w-full h-[600px] bg-[#F8F9FA] rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          {/* Dessiner les connexions */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {graphData.edges.map((edge) => {
              const sourceNode = graphData.nodes.find(n => n.id === edge.source);
              const targetNode = graphData.nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              return (
                <line
                  key={edge.id}
                  x1={sourceNode.position.x}
                  y1={sourceNode.position.y}
                  x2={targetNode.position.x}
                  y2={targetNode.position.y}
                  stroke="#D6D1CE"
                  strokeWidth={1}
                  strokeDasharray={edge.type === 'supervises' ? "5,5" : "0"}
                />
              );
            })}
          </svg>

          {/* Dessiner les nœuds */}
          {graphData.nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute cursor-pointer transition-all duration-200 hover:scale-110 ${
                node.type === 'member' ? 'bg-white border-2 border-[#006C69]' :
                node.type === 'group' ? 'bg-[#F4F7FE] border-2 border-[#CEAD1E]' :
                'bg-[#E8F5E9] border-2 border-[#12BC7E]'
              } rounded-xl p-3 shadow-md`}
              style={{
                left: node.position.x - 75,
                top: node.position.y - 25,
                width: 150,
                height: 50
              }}
              onClick={() => {
                // Navigation vers la détail de l'entité
                if (node.type === 'member') {
                  window.location.href = `/dashboard/members/${node.id}`;
                } else if (node.type === 'group') {
                  window.location.href = `/dashboard/groups/${node.id.replace('group-', '')}`;
                } else if (node.type === 'gem') {
                  window.location.href = `/dashboard/gems/${node.id.replace('gem-', '')}`;
                }
              }}
            >
              <div className="flex items-center gap-2">
                {node.data.photo && (
                  <img
                    src={node.data.photo}
                    alt={node.data.label}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1B2559] truncate">
                    {node.data.label}
                  </p>
                  <p className="text-xs text-[#6D6E71]">
                    {node.type === 'member' ? `${node.data.memberCount || 0} supervisés` :
                     node.type === 'group' ? `${node.data.memberCount || 0} membres` :
                     `${node.data.memberCount || 0} membres`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-white border-2 border-[#006C69] rounded"></div>
            <span className="text-xs font-medium">Membre</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-[#F4F7FE] border-2 border-[#CEAD1E] rounded"></div>
            <span className="text-xs font-medium">Groupe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#E8F5E9] border-2 border-[#12BC7E] rounded"></div>
            <span className="text-xs font-medium">GEM</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Graphique Organisationnel">
      {/* Header */}
      <HorizonCard className="p-5 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2559]">Graphique Organisationnel</h1>
            <p className="text-[#6D6E71] mt-2">Visualiser la structure de l'église</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-horizon btn-horizon-secondary">
              <Download className="w-4 h-4 mr-2" />
              <span>Exporter</span>
            </button>
            <button className="btn-horizon btn-horizon-primary">
              <Settings className="w-4 h-4 mr-2" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
      </HorizonCard>

      {/* Filtres */}
      <HorizonCard className="p-5 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(filters).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                className="rounded border-[#D6D1CE] text-[#006C69] focus:ring-[#006C69]"
              />
              <span className="text-sm font-medium text-[#1B2559]">
                {key === 'showPastoral' && 'Hiérarchie'}
                {key === 'showGroups' && 'Groupes'}
                {key === 'showGems' && 'GEMs'}
                {key === 'showFamily' && 'Familles'}
                {key === 'showMembers' && 'Membres'}
              </span>
            </label>
          ))}
        </div>
      </HorizonCard>

      {/* Graphique */}
      <HorizonCard className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-[600px]">
            <div className="w-8 h-8 border-4 border-[#006C69] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          renderGraph()
        )}
      </HorizonCard>
    </DashboardLayout>
  );
}
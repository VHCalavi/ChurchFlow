"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Settings, Download, RotateCcw } from "lucide-react";
import { HorizonCard } from "@/components/ui/horizon-card";
import { ReactFlow, Background, Controls, Node, Edge, Position, MarkerType, Handle, useNodesState, useEdgesState, ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useRouter } from 'next/navigation';

const CustomEntityNode = ({ data }: any) => {
  const getStyle = () => {
    if (data.type === 'member') return { bg: 'bg-white', border: 'border-[#006C69]', iconBg: 'bg-[#006C69]' };
    if (data.type === 'group') return { bg: 'bg-[#F4F7FE]', border: 'border-[#CEAD1E]', iconBg: 'bg-[#CEAD1E]' };
    return { bg: 'bg-[#E8F5E9]', border: 'border-[#12BC7E]', iconBg: 'bg-[#12BC7E]' };
  };

  const style = getStyle();

  return (
    <div className={`flex items-center ${style.bg} border-2 ${style.border} rounded-full p-1 pr-4 shadow-sm min-w-[200px]`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className={`w-10 h-10 rounded-full ${style.iconBg} text-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm mr-3`}>
        {data.photo ? (
          <img src={data.photo} alt={data.label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold">{data.label.substring(0, 2).toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#1B2559] truncate">{data.label}</p>
        <p className="text-[10px] text-[#A3AED0] uppercase">
          {data.type === 'member' ? `${data.memberCount || 0} supervisés` :
           data.type === 'group' ? `${data.memberCount || 0} membres` :
           `${data.memberCount || 0} membres`}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = { entityNode: CustomEntityNode };

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const nodeWidth = 220;
  const nodeHeight = 60;
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, edgesep: 30, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function GraphPage() {
  const router = useRouter();
  const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    showPastoral: true,
    showGroups: true,
    showGems: true,
    showFamily: true,
    showMembers: false, // Inutilisé en backend (tout est ramené ou non)
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  const resetLayout = useCallback(() => {
    if (!graphData) return;
    const rfNodes: Node[] = graphData.nodes.map((n: any) => ({
      id: n.id,
      type: 'entityNode',
      position: { x: 0, y: 0 },
      data: { ...n.data, type: n.type },
    }));
    const rfEdges: Edge[] = graphData.edges.map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.type,
      animated: e.type !== 'supervises',
      style: { stroke: '#A3AED0', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#A3AED0' },
      labelStyle: { fill: '#1B2559', fontWeight: 700, fontSize: 10 },
      labelBgStyle: { fill: '#F4F7FE', fillOpacity: 0.9 },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
    }));
    const { nodes: ln, edges: le } = getLayoutedElements(rfNodes, rfEdges);
    setNodes(ln);
    setEdges(le);
    setTimeout(() => rfInstanceRef.current?.fitView({ padding: 0.1 }), 50);
  }, [graphData, setNodes, setEdges]);

  const exportPng = useCallback(async () => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null;
    if (!viewport) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(viewport, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'graphique-organisationnel.png';
      link.click();
    } catch (err) {
      console.error('Export PNG failed:', err);
    }
  }, []);

  const loadGraphData = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        showPastoral: filters.showPastoral.toString(),
        showGroups: filters.showGroups.toString(),
        showGems: filters.showGems.toString(),
        showFamily: filters.showFamily.toString(),
        showMembers: filters.showMembers.toString(),
      });
      const res = await fetch(`/api/v1/graph?${query}`);
      const json = await res.json();
      if (json.success) {
        setGraphData(json.data);
      }
    } catch (err) {
      console.error("Error loading graph data:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  useEffect(() => {
    if (!graphData) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const rfNodes: Node[] = graphData.nodes.map((n: any) => ({
      id: n.id,
      type: 'entityNode',
      position: { x: 0, y: 0 },
      data: {
        ...n.data,
        type: n.type,
      }
    }));

    const getEdgeLabel = (type: string) => {
      const labels: Record<string, string> = {
        supervises: 'Superviseur',
        belongs_to: 'Département',
        member_of: 'Membre',
        PARENT: 'Parent',
        ENFANT: 'Enfant',
        SPOUSE: 'Conjoint(e)',
        SIBLING: 'Frère/Sœur',
        GEM_PARTNER: 'Partenaire GEM',
      };
      return labels[type] || type;
    };

    const rfEdges: Edge[] = graphData.edges.map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: getEdgeLabel(e.type),
      animated: e.type !== 'supervises',
      style: { stroke: '#A3AED0', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#A3AED0' },
      labelStyle: { fill: '#1B2559', fontWeight: 700, fontSize: 10 },
      labelBgStyle: { fill: '#F4F7FE', fillOpacity: 0.9 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [graphData, setNodes, setEdges]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    if (node.data.type === 'member') {
      router.push(`/dashboard/members/${node.id}`);
    } else if (node.data.type === 'group') {
      router.push(`/dashboard/groups/${node.id.replace('group-', '')}`);
    } else if (node.data.type === 'gem') {
      router.push(`/dashboard/gems/${node.id.replace('gem-', '')}`);
    }
  };

  return (
    <DashboardLayout title="Graphique Organisationnel">
      <HorizonCard className="p-5 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2559]">Graphique Organisationnel</h1>
            <p className="text-[#6D6E71] mt-2">Visualiser la structure de l'église (Groupes, GEMs, Hiérarchie pastorale)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetLayout}
              className="btn-horizon flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-[#F4F7FE] text-[#1B2559] hover:bg-[#E0E5F2] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
            <button
              onClick={exportPng}
              className="btn-horizon flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-[#F4F7FE] text-[#1B2559] hover:bg-[#E0E5F2] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter PNG</span>
            </button>
          </div>
        </div>
      </HorizonCard>

      <HorizonCard className="p-5 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(filters).filter(([k]) => k !== 'showMembers').map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 cursor-pointer p-2 bg-[#F4F7FE] rounded-lg">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                className="w-4 h-4 rounded border-[#D6D1CE] text-[#006C69] focus:ring-[#006C69]"
              />
              <span className="text-sm font-bold text-[#1B2559]">
                {key === 'showPastoral' && 'Hiérarchie Pastorale'}
                {key === 'showGroups' && 'Groupes & Départements'}
                {key === 'showGems' && 'GEMs / Partenaires'}
                {key === 'showFamily' && 'Relations Familiales'}
              </span>
            </label>
          ))}
        </div>
      </HorizonCard>

      <HorizonCard className="p-6 relative">
        <div className="absolute top-8 right-8 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-4 border border-[#E0E5F2]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-4 bg-[#006C69] rounded-full"></div>
            <span className="text-xs font-bold text-[#1B2559]">Membre</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-4 bg-[#CEAD1E] rounded-full"></div>
            <span className="text-xs font-bold text-[#1B2559]">Groupe</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-[#12BC7E] rounded-full"></div>
            <span className="text-xs font-bold text-[#1B2559]">GEM</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[600px] bg-[#F8F9FA] rounded-2xl">
            <div className="w-8 h-8 border-4 border-[#006C69] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E0E5F2] shadow-sm h-[600px] w-full overflow-hidden bg-[#F8F9FA] relative">
            {nodes.length > 0 ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onInit={(instance) => { rfInstanceRef.current = instance; }}
                fitView
                minZoom={0.1}
                maxZoom={2}
                attributionPosition="bottom-right"
              >
                <Background color="#A3AED0" gap={16} size={1} />
                <Controls className="!bg-white !border-[#E0E5F2] !shadow-sm" />
              </ReactFlow>
            ) : (
              <div className="flex items-center justify-center h-full text-[#A3AED0] font-bold">
                Aucune donnée à afficher pour ces filtres.
              </div>
            )}
          </div>
        )}
      </HorizonCard>
    </DashboardLayout>
  );
}
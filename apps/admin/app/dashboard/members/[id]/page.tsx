"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "../../../../components/layout/dashboard-layout";
import { ArrowLeft, User, Users, Calendar, FileText, File, Network, Circle, X, Plus, Search, Eye, Pencil, Trash2, Camera, FileText as FileTextIcon } from "lucide-react";
import { ReactFlow, Background, Controls, Node, Edge, Position, MarkerType, Handle, BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

const MemberNode = ({ data }: any) => {
  return (
    <div className={`flex items-center bg-white border-2 ${data.isCenter ? 'border-[#006C69]' : 'border-[#E0E5F2]'} rounded-full p-1 pr-4 shadow-sm min-w-[180px]`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className={`w-8 h-8 rounded-full ${data.isCenter ? 'bg-[#006C69]' : 'bg-[#1B2559]'} text-white flex items-center justify-center text-xs mr-3 shadow-sm font-bold shrink-0`}>
        {data.initials}
      </div>
      <div>
        <p className="text-xs font-bold text-[#1B2559] whitespace-nowrap">{data.label}</p>
        {data.subLabel && <p className="text-[10px] text-[#A3AED0] uppercase">{data.subLabel}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};
const nodeTypes = { memberNode: MemberNode };

const RELATION_LABELS: Record<string, string> = {
  PARENT: 'Parent',
  ENFANT: 'Enfant',
  SIBLING: 'Frère / Sœur',
  SPOUSE: 'Conjoint(e)',
  GEM_PARTNER: 'Partenaire GEM',
};
const toFr = (type: string) => RELATION_LABELS[type] ?? type;

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
  animated,
}: EdgeProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calcul standard
  let [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Appliquer le décalage (offset) de courbure si fourni
  const curvatureOffset = data?.curvature as number || 0;
  if (curvatureOffset !== 0) {
    // Calcul de points de contrôle décalés pour écarter les traits
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Vecteur normal perpendiculaire
    const nx = -dy / distance;
    const ny = dx / distance;
    const offset = curvatureOffset * 40; // force du décalage

    const c1X = sourceX + (dx * 0.25) + nx * offset;
    const c1Y = sourceY + (dy * 0.25) + ny * offset;
    const c2X = sourceX + (dx * 0.75) + nx * offset;
    const c2Y = sourceY + (dy * 0.75) + ny * offset;

    edgePath = `M ${sourceX},${sourceY} C ${c1X},${c1Y} ${c2X},${c2Y} ${targetX},${targetY}`;
    // Approximation du centre
    labelX = sourceX + (dx * 0.5) + nx * (offset * 0.75);
    labelY = sourceY + (dy * 0.5) + ny * (offset * 0.75);
  }

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-path cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ ...style, stroke: isHovered ? '#006C69' : style.stroke, strokeWidth: isHovered ? 2 : style.strokeWidth }} 
        className={animated ? 'react-flow__edge-animated' : ''}
      />
      <EdgeLabelRenderer>
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#F4F7FE',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#1B2559',
            pointerEvents: 'all', // Important pour capter les clics
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: isHovered ? 9999 : 0,
            boxShadow: isHovered ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
          }}
          className="nodrag nopan transition-shadow"
        >
          {label as React.ReactNode}
          {data?.onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof data.onDelete === 'function') data.onDelete(data.relationId);
              }}
              className="hover:text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors"
              title="Supprimer la relation"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
const edgeTypes = { custom: CustomEdge };


const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const nodeWidth = 200;
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

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [interviews, setInterviews] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [memberReports, setMemberReports] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  
  // Tree Filters
  const [showFamily, setShowFamily] = useState(true);
  const [showGem, setShowGem] = useState(true);

  // Lists for dropdowns
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [allGems, setAllGems] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  // Modals & Forms
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showRelModal, setShowRelModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGemModal, setShowGemModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Notification & Confirm
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showNotification = (message: string, type: "success" | "error" = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // GEM creation state (from Arbre tab)
  const [gemModalName, setGemModalName] = useState('');
  const [gemModalDescription, setGemModalDescription] = useState('');
  const [gemModalSearch, setGemModalSearch] = useState('');
  const [gemModalMemberIds, setGemModalMemberIds] = useState<string[]>([]);

  const memberGemMap = useMemo(() => {
    const map = new Map<string, any>();
    allGems.forEach(gem => {
      (gem.members || []).forEach((gm: any) => {
        if (gm.member?.id) map.set(gm.member.id, gem);
      });
    });
    return map;
  }, [allGems]);

  const isCurrentMemberInGem = member ? memberGemMap.has(member.id) : false;

  const handleToggleGemModalMember = (id: string) => {
    setGemModalMemberIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);

      const newMemberGem = memberGemMap.get(id);
      const existingGemInSelection = prev
        .map(selId => memberGemMap.get(selId))
        .find(gem => gem !== undefined);

      if (newMemberGem && existingGemInSelection && newMemberGem.id !== existingGemInSelection.id) {
        showNotification("Impossible de sélectionner des membres appartenant à des GEMs différents.", "error");
        return prev;
      }

      if (newMemberGem) {
        setGemModalName(newMemberGem.name);
        setGemModalDescription(newMemberGem.description || "");
      }

      return [...prev, id];
    });
  };

  // View/Edit detail modals
  const [viewingInterview, setViewingInterview] = useState<any>(null);
  const [editingInterview, setEditingInterview] = useState<any>(null);
  const [viewingDoc, setViewingDoc] = useState<any>(null);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteRelation = useCallback((relationId: string) => {
    setConfirmDialog({
      message: "Voulez-vous vraiment supprimer cette relation ?",
      onConfirm: async () => {
        try {
          if (relationId.startsWith('gem_virtual_')) {
            const parts = relationId.split('_');
            const gemId = parts[2];
            const relativeId = parts[3];
            const res = await fetch(`/api/v1/gems/${gemId}/members?memberId=${relativeId}`, { method: 'DELETE' });
            if (res.ok) setRelations(prev => prev.filter(r => r.id !== relationId));
            else showNotification("Erreur lors de la suppression du membre du GEM", "error");
          } else {
            const res = await fetch(`/api/v1/members/${params.id}/family-relations/${relationId}`, { method: 'DELETE' });
            if (res.ok) setRelations(prev => prev.filter(r => r.id !== relationId));
            else showNotification("Erreur lors de la suppression de la relation familiale", "error");
          }
        } catch (e) { console.error(e); }
      }
    });
  }, [params.id, setRelations]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!member) return { nodes: [], edges: [] };
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const addedNodes = new Set<string>();
    addedNodes.add(member.id);

    // Nœud central
    nodes.push({
      id: member.id,
      type: 'memberNode',
      position: { x: 0, y: 0 },
      data: {
        label: `${member.firstName} ${member.lastName}`,
        subLabel: 'Moi',
        initials: `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`,
        isCenter: true,
      }
    });

    // Pour chaque paire, compter combien de relations existent et assigners un offset différent
    const pairCounts = new Map<string, number>();
    relations.forEach(r => {
      if (!r.relative) return;
      const key = [member.id, r.relative.id].sort().join('-');
      pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
    });

    const pairIndexes = new Map<string, number>();

    // Nœuds liés + edges
    relations.forEach((r, i) => {
      if (!r.relative) return;

      if (!addedNodes.has(r.relative.id)) {
        nodes.push({
          id: r.relative.id,
          type: 'memberNode',
          position: { x: 0, y: 0 },
          data: {
            label: `${r.relative.firstName} ${r.relative.lastName}`,
            subLabel: toFr(r.relationType),
            initials: `${r.relative.firstName?.[0] || ''}${r.relative.lastName?.[0] || ''}`,
            isCenter: false,
          }
        });
        addedNodes.add(r.relative.id);
      } else {
        const existingNode = nodes.find(n => n.id === r.relative.id);
        const frLabel = toFr(r.relationType);
        if (existingNode && !String(existingNode.data.subLabel).includes(frLabel)) {
          existingNode.data.subLabel = `${existingNode.data.subLabel}, ${frLabel}`;
        }
      }

      const pairKey = [member.id, r.relative.id].sort().join('-');
      const total = pairCounts.get(pairKey) || 1;
      const currentIdx = pairIndexes.get(pairKey) || 0;
      pairIndexes.set(pairKey, currentIdx + 1);

      // Curvature offsets: pour 1 lien c=0, pour 2 liens: 0.4 et -0.4, pour 3: 0.5, 0, -0.5
      const offsets = total === 1
        ? [0]
        : total === 2
          ? [0.5, -0.5]
          : [0.6, 0, -0.6];
      const curvature = offsets[currentIdx % offsets.length];

      let color = '#A3AED0';
      switch (r.relationType) {
        case 'GEM_PARTNER': color = '#006C69'; break; // Vert
        case 'PARENT': color = '#4318FF'; break;      // Bleu
        case 'ENFANT': color = '#FF9800'; break;      // Orange
        case 'SIBLING': color = '#CEAD1E'; break;     // Jaune/Or
        case 'SPOUSE': color = '#E31A1A'; break;      // Rouge
      }

      edges.push({
        id: `e-${member.id}-${r.relative.id}-${i}`,
        source: member.id,
        target: r.relative.id,
        label: toFr(r.relationType),
        type: 'custom',
        animated: true,
        style: { stroke: color, strokeWidth: 2 },
        labelStyle: { fill: '#1B2559', fontWeight: 700, fontSize: 10 },
        labelBgStyle: { fill: '#F4F7FE', fillOpacity: 0.9 },
        labelBgPadding: [4, 6] as [number, number],
        data: { curvature, relationId: r.id, onDelete: handleDeleteRelation },
        markerEnd: { type: MarkerType.ArrowClosed, color: color },
      });
    });

    return getLayoutedElements(nodes, edges, 'TB');
  }, [member, relations, handleDeleteRelation]);

  useEffect(() => {
    // Fetch dependencies for dropdowns (Groups, Members)
    const fetchDependencies = async () => {
      try {
        const [gRes, mRes, gemRes] = await Promise.all([
          fetch('/api/v1/groups'),
          fetch('/api/v1/members'),
          fetch('/api/v1/gems')
        ]);
        const gJson = await gRes.json();
        const mJson = await mRes.json();
        const gemJson = await gemRes.json();
        if (gJson.success) setAllGroups(gJson.data || []);
        if (mJson.success) setAllMembers(mJson.data || []);
        if (gemJson.success) setAllGems(gemJson.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDependencies();
  }, []);

  // Fetch gems when type switches to 'gem' in the modal
  // (removed - GEM association is done via Arbre tab)

  useEffect(() => {
    const fetchTab = async (url: string, setter: any) => {
      setLoadingTab(true);
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) setter(json.data || []);
      } catch (err) {
        console.error("Erreur chargement onglet", err);
      } finally {
        setLoadingTab(false);
      }
    };

    if (activeTab === "entretiens" && interviews.length === 0) {
      fetchTab(`/api/v1/members/${params.id}/interviews`, setInterviews);
    } else if (activeTab === "documents" && documents.length === 0) {
      fetchTab(`/api/v1/members/${params.id}/documents`, setDocuments);
    } else if (activeTab === "arbre") {
      fetchTab(`/api/v1/members/${params.id}/family-relations?includeFamily=${showFamily}&includeGem=${showGem}`, setRelations);
    } else if (activeTab === "groupes" && groups.length === 0) {
      fetchTab(`/api/v1/members/${params.id}/groups`, setGroups);
    } else if (activeTab === "presences" && attendances.length === 0) {
      fetchTab(`/api/v1/members/${params.id}/attendance`, setAttendances);
    } else if (activeTab === "reports" && memberReports.length === 0) {
      fetchTab(`/api/v1/reports?authorId=${params.id}`, setMemberReports);
    } else if (activeTab === "activities" && activities.length === 0) {
      fetchTab(`/api/v1/members/${params.id}/activities`, setActivities);
    }
  }, [activeTab, params.id, showFamily, showGem]);

  useEffect(() => {
    async function loadMember() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/members/${params.id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setMember(json.data);
        } else {
          // Si le membre n'existe pas en base de données, on le signale.
          setErrorMsg("Ce membre n'existe pas ou vous n'avez pas l'autorisation d'y accéder.");
        }
      } catch (err) {
        setErrorMsg("Erreur lors de la récupération du membre.");
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, [params.id]);

  const toggleActiveStatus = async () => {
    if (!member) return;
    setIsToggling(true);
    try {
      const res = await fetch(`/api/v1/members/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !member.isActive })
      });
      const json = await res.json();
      if (json.success) {
        setMember({ ...member, isActive: !member.isActive });
      } else {
        showNotification("Erreur lors de la mise à jour: " + json.error, "error");
      }
    } catch (e) {
      showNotification("Erreur de connexion.", "error");
    } finally {
      setIsToggling(false);
    }
  };

  const handleEditMember = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      firstName: e.target.firstName.value,
      lastName: e.target.lastName.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      gender: e.target.gender.value,
      address: e.target.address.value,
    };
    try {
      const res = await fetch(`/api/v1/members/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setMember({ ...member, ...data });
        setShowEditModal(false);
      } else {
        showNotification("Erreur d'édition: " + json.error, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddInterview = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      title: e.target.title.value,
      type: e.target.type.value,
      content: e.target.content.value || "Aucun contenu renseigné.",
      date: e.target.date.value ? new Date(e.target.date.value).toISOString() : new Date().toISOString(),
      interviewerId: e.target.interviewerId.value,
    };
    
    try {
      const res = await fetch(`/api/v1/members/${params.id}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setInterviews([json.data, ...interviews]);
        setShowInterviewModal(false);
      } else {
        showNotification("Erreur: " + json.error, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDocument = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      type: "OTHER", // Always OTHER or REPORT for generic texts
      fileName: e.target.fileName.value,
      content: e.target.content.value, 
    };
    try {
      const res = await fetch(`/api/v1/members/${params.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setDocuments([json.data, ...documents]);
        setShowDocModal(false);
      } else {
        showNotification("Erreur: " + json.error, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRelation = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      relationType: e.target.type.value,
      relativeId: e.target.relativeId.value,
    };
    try {
      const res = await fetch(`/api/v1/members/${params.id}/family-relations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setRelations([json.data, ...relations]);
        setShowRelModal(false);
      } else {
        showNotification("Erreur: " + json.error, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddGroup = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const groupId = e.target.groupId.value;
    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: params.id, role: "MEMBER" })
      });
      const json = await res.json();
      if (json.success) {
        const gRes = await fetch(`/api/v1/members/${params.id}/groups`);
        const gJson = await gRes.json();
        if (gJson.success) setGroups(gJson.data);
        setShowGroupModal(false);
      } else {
        showNotification("Erreur: " + json.error, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };



  const handleRemoveFromGroup = (groupId: string) => {
    setConfirmDialog({
      message: "Voulez-vous vraiment retirer le membre de ce groupe ?",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/v1/groups/${groupId}/members?memberId=${params.id}`, { method: 'DELETE' });
          if (res.ok) setGroups(groups.filter(g => g.groupId !== groupId));
        } catch (e) { console.error(e); }
      }
    });
  };

  const handleDeleteInterview = (interviewId: string) => {
    setConfirmDialog({
      message: "Voulez-vous vraiment supprimer cet entretien ?",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/v1/members/${params.id}/interviews/${interviewId}`, { method: 'DELETE' });
          if (res.ok) {
            setInterviews(interviews.filter(i => i.id !== interviewId));
            setViewingInterview(null);
          }
        } catch (e) { console.error(e); }
      }
    });
  };

  const handleUpdateInterview = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      title: e.target.title.value,
      type: e.target.type.value,
      content: e.target.content.value || "Aucun contenu renseigné.",
      date: e.target.date.value ? new Date(e.target.date.value).toISOString() : undefined,
      interviewerId: e.target.interviewerId.value,
    };
    try {
      const res = await fetch(`/api/v1/members/${params.id}/interviews/${editingInterview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setInterviews(interviews.map(i => i.id === editingInterview.id ? json.data : i));
        setEditingInterview(null);
      } else showNotification("Erreur: " + json.error, "error");
    } finally { setSubmitting(false); }
  };

  const handleDeleteDocument = (documentId: string) => {
    setConfirmDialog({
      message: "Voulez-vous vraiment supprimer ce document ?",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/v1/members/${params.id}/documents/${documentId}`, { method: 'DELETE' });
          if (res.ok) {
            setDocuments(documents.filter(d => d.id !== documentId));
            setViewingDoc(null);
          }
        } catch (e) { console.error(e); }
      }
    });
  };

  const handleUpdateDocument = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const data = {
      fileName: e.target.fileName.value,
      content: e.target.content.value,
    };
    try {
      const res = await fetch(`/api/v1/members/${params.id}/documents/${editingDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setDocuments(documents.map(d => d.id === editingDoc.id ? json.data : d));
        setEditingDoc(null);
      } else showNotification("Erreur: " + json.error, "error");
    } finally { setSubmitting(false); }
  };

  const handlePhotoUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload to S3/Cloudinary here.
    // For now, we'll convert to base64 for simplicity since it's an avatar.
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch(`/api/v1/members/${params.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoUrl: base64String })
        });
        const json = await res.json();
        if (json.success) {
          setMember({ ...member, photoUrl: base64String });
        }
      } catch (err) {
        console.error("Erreur lors de l'upload de la photo", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: "general", label: "Général", icon: <User className="w-4 h-4" /> },
    { id: "groupes", label: "Groupes", icon: <Users className="w-4 h-4" /> },
    { id: "presences", label: "Présences", icon: <Calendar className="w-4 h-4" /> },
    { id: "entretiens", label: "Entretiens", icon: <FileText className="w-4 h-4" /> },
    { id: "reports", label: "Rapports", icon: <FileText className="w-4 h-4" /> },
    { id: "documents", label: "Documents", icon: <File className="w-4 h-4" /> },
    { id: "activities", label: "Activités", icon: <Calendar className="w-4 h-4" /> },
    { id: "arbre", label: "Arbre", icon: <Network className="w-4 h-4" /> },
  ];

  const filteredMembers = allMembers.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase()) && 
    m.id !== params.id
  );

  if (loading) {
    return (
      <DashboardLayout title="Détail du Membre">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-[#006C69] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (errorMsg) {
    return (
      <DashboardLayout title="Erreur">
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-[#CD3C14] font-bold text-lg mb-4">{errorMsg}</p>
          <button onClick={() => router.push('/dashboard/members')} className="btn-horizon btn-horizon-secondary">Retour aux membres</button>
        </div>
      </DashboardLayout>
    );
  }

  if (!member) return null;

  return (
    <DashboardLayout title="Profil Membre">
      <div className="w-full max-w-6xl mx-auto pb-10">
        <button 
          onClick={() => router.push('/dashboard/members')}
          className="flex items-center text-[#A3AED0] hover:text-[#1B2559] font-bold text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux membres
        </button>

        <div className="horizon-card p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group w-24 h-24 rounded-full bg-[#006C69] flex items-center justify-center text-3xl font-bold text-white shadow-horizon-xl overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => photoInputRef.current?.click()}>
              {member.photoUrl ? (
                <img src={member.photoUrl} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span>{member.firstName?.[0]}{member.lastName?.[0]}</span>
              )}
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" ref={photoInputRef} onChange={handlePhotoUpload} />
            </div>
            
            <div>
              <h1 className="text-2xl font-extrabold text-[#1B2559]">
                {member.firstName} {member.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm font-medium text-[#A3AED0]">
                <span>{member.email || "Aucun email"}</span>
                <span>•</span>
                <span>{member.phone || "Aucun téléphone"}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  member.status === "RESPONSABLE" ? "bg-[#CEAD1E] text-white" : 
                  member.status === "MEMBRE" ? "bg-[#006C69] text-white" : "bg-[#A3AED0] text-[#1B2559]"
                }`}>
                  {member.status}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F7FE] text-xs font-bold">
                  <Circle className={`w-2 h-2 fill-current ${member.isActive ? "text-[#006C69]" : "text-[#CD3C14]"}`} />
                  <span className={member.isActive ? "text-[#006C69]" : "text-[#CD3C14]"}>
                    {member.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button onClick={() => setShowEditModal(true)} className="btn-horizon btn-horizon-secondary text-sm font-bold w-full sm:w-auto">Éditer le profil</button>
            <button 
              onClick={toggleActiveStatus} 
              disabled={isToggling}
              className="btn-horizon btn-horizon-primary text-sm font-bold w-full sm:w-auto flex items-center justify-center"
            >
              {isToggling ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : null}
              {member.isActive ? "Marquer inactif" : "Marquer actif"}
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 border-b border-[#E0E5F2] pb-px scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#006C69] text-[#006C69]"
                  : "border-transparent text-[#A3AED0] hover:text-[#1B2559]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="horizon-card p-6 min-h-[400px]">
          {/* GENERAL */}
          {activeTab === "general" && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-bold text-[#1B2559] mb-4">Informations Générales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 rounded-2xl bg-[#F4F7FE]">
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-1">Date d'inscription</p>
                  <p className="text-sm font-bold text-[#1B2559]">{new Date(member.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F7FE]">
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-1">Date de naissance</p>
                  <p className="text-sm font-bold text-[#1B2559]">{member.birthDate ? new Date(member.birthDate).toLocaleDateString('fr-FR') : "Non renseignée"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F7FE]">
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-1">Date de baptême</p>
                  <p className="text-sm font-bold text-[#1B2559]">{member.baptismDate ? new Date(member.baptismDate).toLocaleDateString('fr-FR') : "Non renseignée"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F7FE]">
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-1">Sexe</p>
                  <p className="text-sm font-bold text-[#1B2559]">{member.gender === 'HOMME' ? 'Homme' : 'Femme'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F7FE]">
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-1">Adresse</p>
                  <p className="text-sm font-bold text-[#1B2559]">{member.address || "Non renseignée"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F7FE]">
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-1">Statut marital</p>
                  <p className="text-sm font-bold text-[#1B2559]">{member.maritalStatus || "Non renseigné"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F7FE]">
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-1">Profession</p>
                  <p className="text-sm font-bold text-[#1B2559]">{member.occupation || "Non renseignée"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F7FE]">
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-1">Nationalité</p>
                  <p className="text-sm font-bold text-[#1B2559]">{member.nationality || "Non renseignée"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F7FE]">
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-1">CNI / Passeport</p>
                  <p className="text-sm font-bold text-[#1B2559]">{member.nationalId || "Non renseigné"}</p>
                </div>
              </div>
            </div>
          )}

          {/* GROUPES */}
          {activeTab === "groupes" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559]">Groupes d'appartenance</h3>
                <button onClick={() => { setShowGroupModal(true); }} className="btn-horizon btn-horizon-primary text-sm font-bold flex items-center"><Plus className="w-4 h-4 mr-1"/> Ajouter à un groupe</button>
              </div>
              {loadingTab ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#006C69] border-t-transparent rounded-full animate-spin" /></div>
              ) : groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#A3AED0] bg-[#F4F7FE] rounded-2xl border border-dashed border-[#A3AED0]">
                  <Users className="w-10 h-10 mb-3 opacity-50" />
                  <p className="font-bold text-sm">Le membre n'est dans aucun groupe.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {groups.map((g: any, i: number) => (
                    <div key={g.groupId || i} className="p-4 border border-[#E0E5F2] rounded-2xl hover:shadow-horizon-md transition-all bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-1 bg-[#F4F7FE] text-[#1B2559] rounded-full">{g.group?.type || "Groupe"}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#A3AED0]">{new Date(g.joinedAt).toLocaleDateString('fr-FR')}</span>
                          <button onClick={() => handleRemoveFromGroup(g.groupId)} className="p-1 text-[#CD3C14] bg-[#CD3C14]/10 rounded-md hover:bg-[#CD3C14]/20 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-base font-extrabold text-[#1B2559]">{g.group?.name || "Groupe introuvable"}</p>
                      <p className="text-sm font-medium text-[#006C69] mt-1">{g.role}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PRESENCES */}
          {activeTab === "presences" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559]">Historique des Présences</h3>
              </div>
              {loadingTab ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#006C69] border-t-transparent rounded-full animate-spin" /></div>
              ) : attendances.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#A3AED0] bg-[#F4F7FE] rounded-2xl border border-dashed border-[#A3AED0]">
                  <Calendar className="w-10 h-10 mb-3 opacity-50" />
                  <p className="font-bold text-sm">Aucune présence enregistrée.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-[#E0E5F2] ml-4 space-y-6 py-4">
                  {attendances.map((a: any, idx: number) => (
                    <div key={a.meetingId || idx} className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-[#006C69] rounded-full -left-[9px] top-1 border-4 border-white shadow-sm" />
                      <div>
                        <p className="text-sm font-bold text-[#A3AED0] mb-0.5">{new Date(a.meeting?.date).toLocaleDateString('fr-FR')}</p>
                        <div className="p-4 bg-[#F4F7FE] rounded-xl inline-block shadow-sm">
                          <p className="text-base font-extrabold text-[#1B2559]">{a.meeting?.title}</p>
                          <span className="text-xs px-2 py-0.5 bg-white text-[#1B2559] rounded-full mt-2 inline-block font-bold">{a.meeting?.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ENTRETIENS */}
          {activeTab === "entretiens" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559]">Historique des entretiens</h3>
                <button onClick={() => setShowInterviewModal(true)} className="btn-horizon btn-horizon-primary text-sm font-bold flex items-center"><Plus className="w-4 h-4 mr-1"/> Nouveau</button>
              </div>
              {loadingTab ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#006C69] border-t-transparent rounded-full animate-spin" /></div>
              ) : interviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#A3AED0] bg-[#F4F7FE] rounded-2xl border border-dashed border-[#A3AED0]">
                  <FileText className="w-10 h-10 mb-3 opacity-50" />
                  <p className="font-bold text-sm">Aucun entretien enregistré.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#E0E5F2] shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F4F7FE] text-[#A3AED0]">
                      <tr>
                        <th className="px-4 py-3 font-bold">Date</th>
                        <th className="px-4 py-3 font-bold">Objet / Titre</th>
                        <th className="px-4 py-3 font-bold">Type</th>
                        <th className="px-4 py-3 font-bold">Interviewer</th>
                        <th className="px-4 py-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E5F2] text-[#1B2559] font-medium">
                      {interviews.map(i => (
                        <tr key={i.id} className="hover:bg-[#F8F9FA] transition-colors">
                          <td className="px-4 py-3">{new Date(i.date).toLocaleDateString('fr-FR')}</td>
                          <td className="px-4 py-3 font-bold">{i.title}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-[#006C69]/10 text-[#006C69] rounded-full text-xs font-bold">{i.type}</span>
                          </td>
                          <td className="px-4 py-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#F4F7FE] flex items-center justify-center text-xs font-bold text-[#A3AED0]">
                              <User className="w-3 h-3" />
                            </div>
                            {i.interviewer?.firstName || i.interviewerName || "Non assigné"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setViewingInterview(i)} className="p-1.5 text-[#006C69] bg-[#006C69]/10 rounded-md hover:bg-[#006C69]/20 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingInterview(i)} className="p-1.5 text-[#CEAD1E] bg-[#CEAD1E]/10 rounded-md hover:bg-[#CEAD1E]/20 transition-colors">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteInterview(i.id)} className="p-1.5 text-[#CD3C14] bg-[#CD3C14]/10 rounded-md hover:bg-[#CD3C14]/20 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="animate-fade-in">
               <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559]">Documents et Rapports</h3>
                <button onClick={() => setShowDocModal(true)} className="btn-horizon btn-horizon-primary text-sm font-bold flex items-center"><Plus className="w-4 h-4 mr-1"/> Ajouter un rapport</button>
              </div>
              {loadingTab ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#006C69] border-t-transparent rounded-full animate-spin" /></div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#A3AED0] bg-[#F4F7FE] rounded-2xl border border-dashed border-[#A3AED0]">
                  <File className="w-10 h-10 mb-3 opacity-50" />
                  <p className="font-bold text-sm">Aucun document n'a été enregistré.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {documents.map(d => (
                    <div key={d.id} className="flex flex-col p-5 border border-[#E0E5F2] rounded-2xl bg-white shadow-sm hover:shadow-horizon-md transition-all">
                      <div className="flex items-center justify-between mb-3 border-b border-[#E0E5F2] pb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#F4F7FE] text-[#CEAD1E] flex items-center justify-center mr-3">
                            <File className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-base font-extrabold text-[#1B2559]">{d.fileName || "Rapport sans titre"}</p>
                            <p className="text-xs font-medium text-[#A3AED0]">{new Date(d.uploadedAt).toLocaleDateString('fr-FR')} • par {d.uploadedBy || "Admin"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewingDoc(d)} className="p-1.5 text-[#006C69] bg-[#006C69]/10 rounded-md hover:bg-[#006C69]/20 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingDoc(d)} className="p-1.5 text-[#CEAD1E] bg-[#CEAD1E]/10 rounded-md hover:bg-[#CEAD1E]/20 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteDocument(d.id)} className="p-1.5 text-[#CD3C14] bg-[#CD3C14]/10 rounded-md hover:bg-[#CD3C14]/20 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-[#F8F9FA] rounded-xl text-sm text-[#1B2559] font-medium leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                        {d.fileUrl}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REPORTS */}
          {activeTab === "reports" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559]">Rapports du membre</h3>
                <Link href={`/dashboard/reports?authorId=${params.id}`} className="btn-horizon btn-horizon-primary text-sm font-bold flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>Voir tous</span>
                </Link>
              </div>
              {loadingTab ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#006C69] border-t-transparent rounded-full animate-spin" /></div>
              ) : memberReports.length > 0 ? (
                <div className="space-y-4">
                  {memberReports.map((report: any) => (
                      <div key={report.id} className="horizon-card p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-[#1B2559]">{report.title}</h4>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="px-2 py-1 rounded-full text-xs font-semibold border border-[#D6D1CE] text-[#6D6E71]">
                                {report.type || 'ACTIVITY'}
                              </span>
                              <span className="text-sm text-[#6D6E71]">
                                {new Date(report.submittedAt).toLocaleDateString()}
                              </span>
                              {report.gem && (
                                <span className="text-xs px-2 py-1 bg-[#006C69]/10 text-[#006C69] rounded-full">
                                  {report.gem.name}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#6D6E71] mt-2 line-clamp-2">
                              {report.content}
                            </p>
                          </div>
                          <Link href={`/dashboard/reports/${report.id}`} className="btn-horizon btn-horizon-secondary ml-4">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-[#A3AED0] bg-[#F4F7FE] rounded-2xl border border-dashed border-[#A3AED0]">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[#6D6E71]">Aucun rapport soumis par ce membre.</p>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559]">Documents du membre</h3>
                <button onClick={() => setShowDocModal(true)} className="btn-horizon btn-horizon-primary text-sm font-bold flex items-center"><Plus className="w-4 h-4 mr-1"/> Nouveau</button>
              </div>
              {loadingTab ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#006C69] border-t-transparent rounded-full animate-spin" /></div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#A3AED0] bg-[#F4F7FE] rounded-2xl border border-dashed border-[#A3AED0]">
                  <File className="w-10 h-10 mb-3 opacity-50" />
                  <p className="font-bold text-sm">Aucun document enregistré.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#E0E5F2] shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F4F7FE] text-[#A3AED0]">
                      <tr>
                        <th className="px-4 py-3 font-bold">Type</th>
                        <th className="px-4 py-3 font-bold">Fichier</th>
                        <th className="px-4 py-3 font-bold">Date</th>
                        <th className="px-4 py-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E5F2] text-[#1B2559] font-medium">
                      {documents.map(d => (
                        <tr key={d.id} className="hover:bg-[#F8F9FA] transition-colors">
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-[#006C69]/10 text-[#006C69] rounded-full text-xs font-bold">{d.type}</span>
                          </td>
                          <td className="px-4 py-3 font-bold">{d.fileName || 'Sans nom'}</td>
                          <td className="px-4 py-3">{new Date(d.uploadedAt).toLocaleDateString('fr-FR')}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setViewingDoc(d)} className="p-1.5 text-[#006C69] bg-[#006C69]/10 rounded-md hover:bg-[#006C69]/20 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingDoc(d)} className="p-1.5 text-[#CEAD1E] bg-[#CEAD1E]/10 rounded-md hover:bg-[#CEAD1E]/20 transition-colors">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteDocument(d.id)} className="p-1.5 text-[#CD3C14] bg-[#CD3C14]/10 rounded-md hover:bg-[#CD3C14]/20 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ACTIVITIES */}
          {activeTab === "activities" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559]">Timeline des Activités</h3>
              </div>
              {loadingTab ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#006C69] border-t-transparent rounded-full animate-spin" /></div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#A3AED0] bg-[#F4F7FE] rounded-2xl border border-dashed border-[#A3AED0]">
                  <Calendar className="w-10 h-10 mb-3 opacity-50" />
                  <p className="font-bold text-sm">Aucune activité enregistrée.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-[#E0E5F2] ml-4 space-y-6 py-4">
                  {activities.map((a: any) => (
                    <div key={a.id} className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-[#CEAD1E] rounded-full -left-[9px] top-1 border-4 border-white shadow-sm" />
                      <div>
                        <p className="text-sm font-bold text-[#A3AED0] mb-0.5">
                          {new Date(a.date).toLocaleDateString('fr-FR')} à {new Date(a.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <div className="p-4 bg-[#F4F7FE] rounded-xl inline-block shadow-sm mt-1">
                          <p className="text-sm font-bold text-[#1B2559]">{a.activityType}</p>
                          <p className="text-sm text-[#1B2559] mt-1">{a.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ARBRE */}
          {activeTab === "arbre" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1B2559]">Arbre des relations</h3>
                <div className="flex gap-2">
                  <label className="flex items-center space-x-2 text-sm text-[#1B2559] font-semibold bg-[#F4F7FE] px-3 py-1.5 rounded-full cursor-pointer">
                    <input type="checkbox" checked={showFamily} onChange={(e) => setShowFamily(e.target.checked)} className="rounded text-[#006C69] focus:ring-[#006C69]" />
                    <span>Famille</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-[#1B2559] font-semibold bg-[#F4F7FE] px-3 py-1.5 rounded-full cursor-pointer mr-4">
                    <input type="checkbox" checked={showGem} onChange={(e) => setShowGem(e.target.checked)} className="rounded text-[#006C69] focus:ring-[#006C69]" />
                    <span>GEM / Partenaires</span>
                  </label>
                  <button
                    onClick={() => {
                      if (isCurrentMemberInGem) {
                        showNotification("Ce membre appartient déjà à un GEM. Retirez-le de son GEM actuel avant de l'ajouter à un autre.", "error");
                        return;
                      }
                      setGemModalName('');
                      setGemModalDescription('');
                      setGemModalSearch('');
                      setGemModalMemberIds(member ? [member.id] : []);
                      setShowGemModal(true);
                    }}
                    className={`btn-horizon text-sm font-bold flex items-center px-4 py-2 rounded-full transition-colors ${
                      isCurrentMemberInGem
                        ? 'bg-[#E0E5F2] text-[#A3AED0] cursor-not-allowed'
                        : 'bg-[#006C69]/10 text-[#006C69] hover:bg-[#006C69]/20'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-1"/> Ajouter à un GEM
                  </button>
                  <button onClick={() => setShowRelModal(true)} className="btn-horizon btn-horizon-primary text-sm font-bold flex items-center">
                    <Plus className="w-4 h-4 mr-1"/> Lier un membre
                  </button>
                </div>
              </div>
              {loadingTab ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#006C69] border-t-transparent rounded-full animate-spin" /></div>
              ) : relations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#A3AED0] bg-[#F4F7FE] rounded-2xl border border-dashed border-[#A3AED0]">
                  <Network className="w-10 h-10 mb-3 opacity-50" />
                  <p className="font-bold text-sm">Aucune relation enregistrée.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#E0E5F2] shadow-sm h-[600px] w-full overflow-hidden bg-[#F8F9FA] relative">
                  <ReactFlow
                    nodes={layoutedNodes}
                    edges={layoutedEdges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    minZoom={0.2}
                    maxZoom={2}
                    attributionPosition="bottom-right"
                  >
                    <Background color="#A3AED0" gap={16} size={1} />
                    <Controls className="!bg-white !border-[#E0E5F2] !shadow-sm" />
                  </ReactFlow>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- MODALS --- */}
        
        {/* EDIT PROFILE MODAL */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-[#E0E5F2] pb-3">
                <h3 className="font-extrabold text-lg text-[#1B2559]">Éditer le profil</h3>
                <button onClick={() => setShowEditModal(false)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleEditMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Prénom</label>
                    <input name="firstName" defaultValue={member.firstName} required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Nom</label>
                    <input name="lastName" defaultValue={member.lastName} required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Email</label>
                  <input name="email" type="email" defaultValue={member.email} className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Téléphone</label>
                  <input name="phone" defaultValue={member.phone} className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Sexe</label>
                    <select name="gender" defaultValue={member.gender} className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium">
                      <option value="HOMME">Homme</option>
                      <option value="FEMME">Femme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Date de naissance</label>
                    <input name="birthDate" type="date" defaultValue={member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : ''} className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Adresse</label>
                  <input name="address" defaultValue={member.address} className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Statut Marital</label>
                    <select name="maritalStatus" defaultValue={member.maritalStatus || ""} className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium">
                      <option value="">Non renseigné</option>
                      <option value="CELIBATAIRE">Célibataire</option>
                      <option value="MARIE">Marié(e)</option>
                      <option value="VEUF">Veuf / Veuve</option>
                      <option value="DIVORCE">Divorcé(e)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Profession</label>
                    <input name="occupation" defaultValue={member.occupation} placeholder="Ex: Informaticien" className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Nationalité</label>
                    <input name="nationality" defaultValue={member.nationality} placeholder="Ex: Ivoirienne" className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">CNI / Passeport</label>
                    <input name="nationalId" defaultValue={member.nationalId} placeholder="Numéro de pièce" className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E0E5F2]">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#006C69] hover:bg-[#005250] text-white rounded-full font-bold transition-colors">
                    {submitting ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* INTERVIEW MODAL */}
        {showInterviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-[#E0E5F2] pb-3">
                <h3 className="font-extrabold text-lg text-[#1B2559]">Nouvel Entretien</h3>
                <button onClick={() => setShowInterviewModal(false)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddInterview} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Objet / Titre de l'entretien</label>
                  <input name="title" required placeholder="Ex: Entretien de suivi pastoral..." className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Date (Passée ou Future)</label>
                    <input name="date" type="datetime-local" required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Type</label>
                    <select name="type" required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium">
                      <option value="INITIAL">Initial</option>
                      <option value="FOLLOWUP">Suivi</option>
                      <option value="ANNUAL">Annuel</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Interviewer (Personne en charge)</label>
                  <select name="interviewerId" required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium">
                    <option value="">Sélectionner un responsable...</option>
                    {allMembers.filter(m => m.status === "RESPONSABLE" || m.status === "PASTEUR").map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                    {/* Fallback au cas où il n'y a pas de responsable pour tester */}
                    {allMembers.length > 0 && <option disabled>--- Tous les membres ---</option>}
                    {allMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Contenu du compte-rendu (Optionnel)</label>
                  <textarea name="content" rows={4} placeholder="Peut être rempli plus tard..." className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium"></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E0E5F2]">
                  <button type="button" onClick={() => setShowInterviewModal(false)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#006C69] hover:bg-[#005250] text-white rounded-full font-bold transition-colors">
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DOCUMENTS MODAL */}
        {showDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b border-[#E0E5F2] pb-3">
                <h3 className="font-extrabold text-lg text-[#1B2559]">Ajouter un document / rapport</h3>
                <button onClick={() => setShowDocModal(false)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Nom du document / rapport</label>
                  <input name="fileName" required placeholder="Ex: Rapport d'évaluation 2024" className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Contenu directement</label>
                  <textarea name="content" required rows={8} placeholder="Saisir le texte de votre rapport ici..." className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium leading-relaxed"></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E0E5F2]">
                  <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#006C69] hover:bg-[#005250] text-white rounded-full font-bold transition-colors">
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RELATION MODAL */}
        {showRelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-[#E0E5F2] pb-3">
                <h3 className="font-extrabold text-lg text-[#1B2559]">Lier un membre</h3>
                <button onClick={() => setShowRelModal(false)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddRelation} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Type de relation</label>
                  <select name="type" required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium">
                    <option value="PARENT">Parent</option>
                    <option value="ENFANT">Enfant</option>
                    <option value="SPOUSE">Conjoint(e)</option>
                    <option value="SIBLING">Frère/Sœur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Rechercher un membre à lier</label>
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-[#A3AED0]" />
                    <input 
                      type="text" 
                      placeholder="Taper un nom pour filtrer..." 
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-[#E0E5F2] focus:border-[#006C69] rounded-lg text-sm font-medium"
                    />
                  </div>
                  <select name="relativeId" required size={5} className="w-full p-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium h-32">
                    {filteredMembers.length === 0 ? (
                      <option disabled>Aucun membre trouvé.</option>
                    ) : (
                      filteredMembers.map(m => (
                         <option key={m.id} value={m.id} className="p-2 hover:bg-white cursor-pointer border-b border-[#E0E5F2]">
                           {m.firstName} {m.lastName} ({m.email || 'Sans email'})
                         </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E0E5F2]">
                  <button type="button" onClick={() => setShowRelModal(false)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#006C69] hover:bg-[#005250] text-white rounded-full font-bold transition-colors">
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* GEM CREATION MODAL (depuis l'onglet Arbre) */}
        {showGemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 pb-4 border-b border-[#E0E5F2] shrink-0">
                <h3 className="font-extrabold text-lg text-[#1B2559]">Ajouter à un GEM</h3>
                <button onClick={() => setShowGemModal(false)} className="text-[#A3AED0] hover:text-[#1B2559]"><X className="w-5 h-5" /></button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!gemModalName.trim()) return;
                  setSubmitting(true);
                  try {
                    const res = await fetch('/api/v1/gems', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: gemModalName,
                        description: gemModalDescription || undefined,
                        isActive: true,
                        memberIds: gemModalMemberIds,
                      }),
                    });
                    const json = await res.json();
                    if (json.success) {
                      setShowGemModal(false);
                      if (json.isExisting) {
                        showNotification(`Membres ajoutés avec succès au GEM ${json.data.name} !`, "success");
                      } else {
                        showNotification('GEM créé avec succès !', "success");
                      }
                      // Recharger les relations pour que les partenaires GEM apparaissent
                      const relRes = await fetch(`/api/v1/members/${params.id}/family-relations?includeFamily=true&includeGem=true`);
                      const relJson = await relRes.json();
                      if (relJson.success) setRelations(relJson.data || []);
                    } else {
                      showNotification(json.error || 'Erreur lors de la création du GEM', "error");
                    }
                  } catch {
                    showNotification('Erreur réseau', "error");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Nom du GEM *</label>
                    <input
                      type="text"
                      value={gemModalName}
                      onChange={e => setGemModalName(e.target.value)}
                      placeholder="Ex: GEM Victoire"
                      className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent rounded-lg text-sm font-medium focus:outline-none focus:border-[#006C69]"
                      required
                    />
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Description</label>
                    <input
                      type="text"
                      value={gemModalDescription}
                      onChange={e => setGemModalDescription(e.target.value)}
                      placeholder="Description optionnelle"
                      className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent rounded-lg text-sm font-medium focus:outline-none focus:border-[#006C69]"
                    />
                  </div>
                  {/* Membres */}
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">
                      Membres du GEM
                      {gemModalMemberIds.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-[#006C69]/10 text-[#006C69] rounded-full text-xs">
                          {gemModalMemberIds.length} sélectionné{gemModalMemberIds.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </label>
                    {/* Chips des membres sélectionnés */}
                    {gemModalMemberIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {gemModalMemberIds.map(id => {
                          const m = id === member?.id ? member : allMembers.find((x: any) => x.id === id);
                          if (!m) return null;
                          const isCurrentMember = id === member?.id;
                          return (
                            <span key={id} className="flex items-center gap-1 px-3 py-1 bg-[#006C69]/10 text-[#006C69] rounded-full text-xs font-bold">
                              {m.firstName} {m.lastName}
                              {isCurrentMember && <span className="text-[10px] opacity-60">(vous)</span>}
                              {!isCurrentMember && (
                                <button type="button" onClick={() => setGemModalMemberIds(ids => ids.filter(x => x !== id))} className="ml-1 hover:text-red-500">
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {/* Recherche */}
                    <div className="relative mb-2">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-[#A3AED0]" />
                      <input
                        type="text"
                        value={gemModalSearch}
                        onChange={e => setGemModalSearch(e.target.value)}
                        placeholder="Rechercher un membre à ajouter..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-[#E0E5F2] focus:border-[#006C69] rounded-lg text-sm font-medium focus:outline-none"
                      />
                    </div>
                    {/* Liste */}
                    <div className="max-h-44 overflow-y-auto rounded-lg border border-[#E0E5F2] divide-y divide-[#F4F7FE]">
                      {allMembers
                        .filter((m: any) =>
                          m.id !== member?.id &&
                          `${m.firstName} ${m.lastName}`.toLowerCase().includes(gemModalSearch.toLowerCase())
                        )
                        .map((m: any) => {
                          const isSelected = gemModalMemberIds.includes(m.id);
                          const memberGem = memberGemMap.get(m.id);
                          const isAlreadyInGem = !!memberGem;
                          const isDisabled = isAlreadyInGem && !isSelected;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => !isDisabled && handleToggleGemModalMember(m.id)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                isDisabled
                                  ? 'opacity-50 cursor-not-allowed bg-[#F4F7FE]'
                                  : isSelected
                                  ? 'bg-[#006C69]/5'
                                  : 'hover:bg-[#F4F7FE]'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected ? 'bg-[#006C69] text-white' : isDisabled ? 'bg-[#E0E5F2] text-[#A3AED0]' : 'bg-[#E0E5F2] text-[#1B2559]'
                              }`}>
                                {isSelected ? <Check className="w-3.5 h-3.5" /> : `${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`}
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className={`text-sm font-bold truncate ${isDisabled ? 'text-[#A3AED0]' : 'text-[#1B2559]'}`}>
                                  {m.firstName} {m.lastName}
                                  {isAlreadyInGem && (
                                    <span className="ml-2 text-xs text-[#CEAD1E] font-semibold">({memberGem.name})</span>
                                  )}
                                </p>
                                {m.email ? (
                                  <p className="text-xs text-[#A3AED0] truncate">{m.email}</p>
                                ) : null}
                              </div>
                              {isDisabled && (
                                <span className="text-[10px] text-[#A3AED0] font-medium shrink-0">Déjà en GEM</span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#E0E5F2] shrink-0">
                  <button type="button" onClick={() => setShowGemModal(false)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Annuler</button>
                  <button type="submit" disabled={submitting || !gemModalName.trim()} className="px-6 py-2 bg-[#006C69] hover:bg-[#005250] text-white rounded-full font-bold transition-colors disabled:opacity-50">
                    {submitting ? 'Création...' : 'Créer le GEM'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* GROUP MODAL */}
        {showGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b border-[#E0E5F2] pb-3">
                <h3 className="font-extrabold text-lg text-[#1B2559]">Ajouter à un groupe</h3>
                <button onClick={() => setShowGroupModal(false)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Sélectionner un groupe</label>
                  <select
                    name="groupId"
                    required
                    className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent rounded-lg text-sm font-medium focus:outline-none focus:border-[#006C69]"
                  >
                    <option value="">Choisir...</option>
                    {allGroups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E0E5F2]">
                  <button type="button" onClick={() => setShowGroupModal(false)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Annuler</button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 text-white rounded-full font-bold transition-colors disabled:opacity-60 bg-[#006C69] hover:bg-[#005250]"
                  >
                    {submitting ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW INTERVIEW MODAL */}
        {viewingInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-[#E0E5F2] pb-3">
                <h3 className="font-extrabold text-lg text-[#1B2559]">Détails de l'entretien</h3>
                <button onClick={() => setViewingInterview(null)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#A3AED0] font-bold uppercase">Objet / Titre</p>
                  <p className="text-base font-bold text-[#1B2559]">{viewingInterview.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#A3AED0] font-bold uppercase">Date</p>
                    <p className="text-sm font-bold text-[#1B2559]">{new Date(viewingInterview.date).toLocaleDateString('fr-FR')} à {new Date(viewingInterview.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#A3AED0] font-bold uppercase">Type</p>
                    <p className="text-sm font-bold text-[#1B2559]">{viewingInterview.type}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#A3AED0] font-bold uppercase">Interviewer</p>
                  <p className="text-sm font-bold text-[#1B2559]">{viewingInterview.interviewer?.firstName || viewingInterview.interviewerName || "Non assigné"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-2">Contenu / Notes</p>
                  <div className="p-4 bg-[#F4F7FE] rounded-lg text-sm text-[#1B2559] whitespace-pre-wrap">
                    {viewingInterview.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT INTERVIEW MODAL */}
        {editingInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-[#E0E5F2] pb-3">
                <h3 className="font-extrabold text-lg text-[#1B2559]">Modifier l'entretien</h3>
                <button onClick={() => setEditingInterview(null)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateInterview} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Objet / Titre</label>
                  <input name="title" defaultValue={editingInterview.title} required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Date</label>
                    <input name="date" type="datetime-local" defaultValue={new Date(editingInterview.date).toISOString().slice(0, 16)} required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Type</label>
                    <select name="type" defaultValue={editingInterview.type} required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium">
                      <option value="PASTORAL">Suivi Pastoral</option>
                      <option value="AFFECTION">Affection / Visite</option>
                      <option value="DISCIPLINE">Discipline</option>
                      <option value="BAPTEME">Préparation Baptême</option>
                      <option value="MARIAGE">Préparation Mariage</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Interviewer</label>
                  <select name="interviewerId" defaultValue={editingInterview.interviewerId} required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium">
                    <option value="">Sélectionner l'interviewer...</option>
                    {allMembers.filter(m => m.status === 'RESPONSABLE').map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Contenu / Notes de l'entretien</label>
                  <textarea name="content" defaultValue={editingInterview.content} rows={4} className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium resize-none" />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E0E5F2]">
                  <button type="button" onClick={() => setEditingInterview(null)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#CEAD1E] hover:bg-[#b09319] text-white rounded-full font-bold transition-colors">
                    {submitting ? 'Modification...' : 'Modifier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW DOCUMENT MODAL */}
        {viewingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-[#E0E5F2] pb-3">
                <h3 className="font-extrabold text-lg text-[#1B2559]">Lecture du rapport</h3>
                <button onClick={() => setViewingDoc(null)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#A3AED0] font-bold uppercase">Titre</p>
                  <p className="text-xl font-extrabold text-[#1B2559]">{viewingDoc.fileName}</p>
                </div>
                <div className="flex gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[#A3AED0] font-bold uppercase">Date</p>
                    <p className="text-sm font-bold text-[#1B2559]">{new Date(viewingDoc.uploadedAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#A3AED0] font-bold uppercase">Auteur</p>
                    <p className="text-sm font-bold text-[#1B2559]">{viewingDoc.uploadedBy || "Admin"}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-[#A3AED0] font-bold uppercase mb-2">Contenu</p>
                  <div className="p-6 bg-[#F8F9FA] rounded-xl text-[#1B2559] whitespace-pre-wrap text-sm leading-relaxed border border-[#E0E5F2]">
                    {viewingDoc.fileUrl}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT DOCUMENT MODAL */}
        {editingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl p-6 bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b border-[#E0E5F2] pb-3">
                <h3 className="font-extrabold text-lg text-[#1B2559]">Modifier le rapport</h3>
                <button onClick={() => setEditingDoc(null)} className="text-[#A3AED0] hover:text-[#1B2559] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Titre du document / rapport</label>
                  <input name="fileName" defaultValue={editingDoc.fileName} required className="w-full px-4 py-2 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-[#A3AED0]">Contenu du rapport</label>
                  <textarea name="content" defaultValue={editingDoc.fileUrl} required rows={10} className="w-full px-4 py-3 bg-[#F4F7FE] border border-transparent focus:border-[#006C69] rounded-lg text-sm font-medium resize-none leading-relaxed" />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E0E5F2]">
                  <button type="button" onClick={() => setEditingDoc(null)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Annuler</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#CEAD1E] hover:bg-[#b09319] text-white rounded-full font-bold transition-colors">
                    {submitting ? 'Modification...' : 'Modifier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg z-[100] text-sm font-bold text-white flex items-center animate-fade-in ${notification.type === 'success' ? 'bg-[#006C69]' : 'bg-red-500'}`}>
            {notification.message}
          </div>
        )}

        {/* CONFIRMATION MODAL */}
        {confirmDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-xl flex flex-col">
              <h3 className="font-extrabold text-lg text-[#1B2559] mb-2">Confirmation</h3>
              <p className="text-sm font-medium text-[#A3AED0] mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 rounded-full font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Annuler</button>
                <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="px-6 py-2 bg-[#CEAD1E] hover:bg-[#b09319] text-white rounded-full font-bold transition-colors">Confirmer</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

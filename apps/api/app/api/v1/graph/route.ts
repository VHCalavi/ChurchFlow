import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { getAuthUser } from '../../../lib/auth';
import { prisma } from '@churchflow/database';
import { requireAuth } from '../../../src/lib/rbac';

export interface GraphNode {
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

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'supervises' | 'belongs_to' | 'member_of';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Générer une position aléatoire pour les nœuds
function generatePosition(index: number, total: number): { x: number; y: number } {
  const radius = 300;
  const angle = (index / total) * 2 * Math.PI;
  const x = Math.cos(angle) * radius + 400;
  const y = Math.sin(angle) * radius + 300;
  return { x, y };
}

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Récupérer toutes les données nécessaires en parallèle
    const [members, groups, gems, familyRelations, memberGroups, memberGems, memberReports] = await Promise.all([
      prisma.member.findMany({
        where: {
          churchId: user.churchId,
          // Exclure les comptes administratifs
          userId: { not: null }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          supervisorId: true,
          photoUrl: true,
          _count: { select: { supervisedMembers: true, reportsWritten: true } }
        },
        orderBy: { firstName: 'asc' }
      }),
      prisma.group.findMany({
        where: { churchId: user.churchId },
        include: {
          _count: { select: { members: true, gems: true } }
        }
      }),
      prisma.gem.findMany({
        where: { churchId: user.churchId },
        include: {
          _count: { select: { members: true, reports: true } }
        }
      }),
      prisma.familyRelation.findMany({
        where: {
          member: { churchId: user.churchId }
        }
      }),
      prisma.memberGroup.findMany({
        where: {
          member: { churchId: user.churchId }
        }
      }),
      prisma.gemMember.findMany({
        where: {
          member: { churchId: user.churchId }
        }
      }),
      prisma.report.findMany({
        where: {
          churchId: user.churchId
        }
      })
    ]);

    // Construire les nœuds
    const nodes: GraphNode[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Nœuds de membres
    members.forEach((member, index) => {
      const node: GraphNode = {
        id: member.id,
        type: 'member',
        position: generatePosition(index, members.length),
        data: {
          label: `${member.firstName} ${member.lastName}`,
          photo: member.photoUrl,
          memberCount: member._count.supervisedMembers,
          groupCount: memberGroups.filter(mg => mg.memberId === member.id).length,
          gemCount: memberGems.filter(mg => mg.memberId === member.id).length
        }
      };
      nodes.push(node);
      nodeMap.set(member.id, node);
    });

    // Nœuds de groupes
    groups.forEach(group => {
      const node: GraphNode = {
        id: `group-${group.id}`,
        type: 'group',
        position: generatePosition(nodes.length, members.length + groups.length + gems.length),
        data: {
          label: group.name,
          memberCount: group._count.members,
          gemCount: group._count.gems
        }
      };
      nodes.push(node);
      nodeMap.set(`group-${group.id}`, node);
    });

    // Nœuds de GEMs
    gems.forEach(gem => {
      const node: GraphNode = {
        id: `gem-${gem.id}`,
        type: 'gem',
        position: generatePosition(nodes.length, members.length + groups.length + gems.length),
        data: {
          label: gem.name,
          memberCount: gem._count.members,
          groupCount: group._count?.reports || 0
        }
      };
      nodes.push(node);
      nodeMap.set(`gem-${gem.id}`, node);
    });

    // Construire les connexions (arêtes)
    const edges: GraphEdge[] = [];

    // Connexions superviseur → subordonné
    members.forEach(member => {
      if (member.supervisorId && nodeMap.has(member.supervisorId)) {
        edges.push({
          id: `edge-${member.supervisorId}-${member.id}`,
          source: member.supervisorId,
          target: member.id,
          type: 'supervises'
        });
      }
    });

    // Connexions membre → groupe
    memberGroups.forEach(mg => {
      const source = mg.memberId;
      const target = `group-${mg.groupId}`;
      if (nodeMap.has(source) && nodeMap.has(target)) {
        edges.push({
          id: `edge-${source}-${target}`,
          source,
          target,
          type: 'belongs_to'
        });
      }
    });

    // Connexions membre → GEM
    memberGems.forEach(mg => {
      const source = mg.memberId;
      const target = `gem-${mg.gemId}`;
      if (nodeMap.has(source) && nodeMap.has(target)) {
        edges.push({
          id: `edge-${source}-${target}`,
          source,
          target,
          type: 'member_of'
        });
      }
    });

    // Familles
    familyRelations.forEach(relation => {
      const source = relation.memberId;
      const target = relation.relatedMemberId;
      if (nodeMap.has(source) && nodeMap.has(target)) {
        edges.push({
          id: `edge-family-${source}-${target}`,
          source,
          target,
          type: 'member_of' // Utiliser le même type pour l'instant
        });
      }
    });

    // Filtrer selon les rôles
    let filteredNodes = nodes;
    let filteredEdges = edges;

    if (!user.roles.includes('ADMIN')) {
      // Pour les non-admins, ne montrer que les éléments pertinents
      const visibleNodeIds = new Set<string>();

      // Ajouter les membres supervisés
      members.filter(m => m.supervisorId === user.id || m.id === user.id).forEach(m => {
        visibleNodeIds.add(m.id);
      });

      // Ajouter les groupes associés
      memberGroups.filter(mg => visibleNodeIds.has(mg.memberId)).forEach(mg => {
        visibleNodeIds.add(`group-${mg.groupId}`);
      });

      // Ajouter les GEMs associés
      memberGems.filter(mg => visibleNodeIds.has(mg.memberId)).forEach(mg => {
        visibleNodeIds.add(`gem-${mg.gemId}`);
      });

      filteredNodes = nodes.filter(n => visibleNodeIds.has(n.id));

      // Filtrer les edges pour ne garder que celles entre nœuds visibles
      filteredEdges = edges.filter(e =>
        visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
      );
    }

    const graphData: GraphData = {
      nodes: filteredNodes,
      edges: filteredEdges
    };

    return NextResponse.json({ success: true, data: graphData });

  } catch (error) {
    console.error('Error generating graph data:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la génération des données du graphique" },
      { status: 500 }
    );
  }
}
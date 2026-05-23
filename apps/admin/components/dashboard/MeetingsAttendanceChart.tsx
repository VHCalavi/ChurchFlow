"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, Loader2, AlertCircle, Tag, X, Check } from "lucide-react";
import { MeetingType } from "@churchflow/types";

interface DataPoint {
  label: string;
  value: number;
  presentCount: number;
  totalRecorded: number;
}

interface RawMeeting {
  id: string;
  title: string;
  date: string;
  type: MeetingType;
  tags: string[];
  attendees: Array<{
    memberId: string;
    isPresent: boolean;
    member: {
      groups: {
        groupId: string;
      }[];
    };
  }>;
}

// Couleurs pour les types de réunions
const TYPE_COLORS: Record<MeetingType, string> = {
  CULTE: "#006C69",           // Vert VH
  TEMPS_DE_PRIERE: "#CEAD1E", // Gold
  REPETITION: "#527EDB",     // Bleu
  AGAPE: "#12BC7E",          // Vert sarcelle clair
  AUTRE: "#D6D1CE",          // Warm Grey
};

const TYPE_LABELS: Record<MeetingType, string> = {
  CULTE: "Culte",
  TEMPS_DE_PRIERE: "Prière",
  REPETITION: "Répétition",
  AGAPE: "Agapé",
  AUTRE: "Autre",
};

export function MeetingsAttendanceChart() {
  const [allMeetings, setAllMeetings] = useState<RawMeeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<RawMeeting[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<MeetingType[]>(Object.keys(TYPE_COLORS) as MeetingType[]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchTag, setSearchTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);

  // Extraire tous les tags uniques
  useEffect(() => {
    const tagSet = new Set<string>();
    allMeetings.forEach(meeting => {
      meeting.tags.forEach(tag => tagSet.add(tag));
    });
    setAllTags(Array.from(tagSet));
  }, [allMeetings]);

  // Charger les données
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Charger les réunions
        const meetingsRes = await fetch("/api/v1/meetings");
        const meetingsData = await meetingsRes.json();

        if (!meetingsData.success || !Array.isArray(meetingsData.data)) {
          throw new Error("Impossible de charger les données des réunions");
        }

        // Charger les groupes
        const groupsRes = await fetch("/api/v1/groups");
        const groupsData = await groupsRes.json();

        if (groupsData.success && Array.isArray(groupsData.data)) {
          setGroups(groupsData.data.map((g: { id: string; name: string }) => ({ id: g.id, name: g.name })));
        }

        setAllMeetings(meetingsData.data as RawMeeting[]);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Appliquer les filtres
  const applyFilters = useCallback((meetings: RawMeeting[]) => {
    let filtered = meetings;

    // Filtre par type
    if (filteredTypes.length > 0) {
      filtered = filtered.filter(m => filteredTypes.includes(m.type));
    }

    // Filtre par groupe
    if (selectedGroup !== "all") {
      filtered = filtered.filter(m =>
        m.attendees.some(a =>
          a.member.groups.some(g => g.groupId === selectedGroup)
        )
      );
    }

    // Filtre par tags
    if (filteredTags.length > 0) {
      filtered = filtered.filter(m =>
        filteredTags.some(tag => m.tags.includes(tag))
      );
    }

    setFilteredMeetings(filtered);
  }, [filteredTypes, selectedGroup, filteredTags]);

  useEffect(() => {
    applyFilters(allMeetings);
  }, [allMeetings, filteredTypes, selectedGroup, filteredTags, applyFilters]);

  // Générer les données pour le graphique
  const generateChartData = () => {
    const dataByType: Record<MeetingType, DataPoint[]> = {} as Record<MeetingType, DataPoint[]>;

    // Initialiser
    Object.keys(TYPE_COLORS).forEach(type => {
      dataByType[type as MeetingType] = [];
    });

    // Calculer pour chaque réunion
    filteredMeetings.forEach(meeting => {
      // Filtrer par type
      if (!filteredTypes.includes(meeting.type)) return;

      // Filtrer par groupe
      if (selectedGroup !== "all") {
        const groupMembers = new Set(
          meeting.attendees
            .filter(a => a.member.groups.some(g => g.groupId === selectedGroup))
            .map(a => a.memberId)
        );
        if (groupMembers.size === 0) return;
      }

      // Filtrer par tags
      if (filteredTags.length > 0 && !meeting.tags.some(tag => filteredTags.includes(tag))) {
        return;
      }

      // Calculer la présence
      let totalCount = 0;
      let presentCount = 0;

      if (selectedGroup !== "all") {
        // Compter seulement les membres du groupe sélectionné
        meeting.attendees.forEach(a => {
          if (a.member.groups.some(g => g.groupId === selectedGroup)) {
            totalCount++;
            if (a.isPresent) presentCount++;
          }
        });
      } else {
        // Compter tous les participants
        totalCount = meeting.attendees.length;
        presentCount = meeting.attendees.filter(a => a.isPresent).length;
      }

      // Créer le point de données
      const date = new Date(meeting.date);
      const label = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
      const value = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

      dataByType[meeting.type].push({
        label,
        value,
        presentCount,
        totalRecorded: totalCount,
      });
    });

    // Trier par date et prendre les 10 derniers
    Object.keys(dataByType).forEach(type => {
      dataByType[type as MeetingType].sort((a, b) =>
        new Date(a.label).getTime() - new Date(b.label).getTime()
      );
      dataByType[type as MeetingType] = dataByType[type as MeetingType].slice(-10);
    });

    return dataByType;
  };

  const chartData = generateChartData();

  // Calculer la date minimale/maximale pour le graphique
  const allLabels = Array.from(
    new Set(
      Object.values(chartData).flat().map(d => d.label)
    )
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Helper functions
  const toggleType = (type: MeetingType) => {
    if (filteredTypes.includes(type)) {
      setFilteredTypes(filteredTypes.filter(t => t !== type));
    } else {
      setFilteredTypes([...filteredTypes, type]);
    }
  };

  const toggleTag = (tag: string) => {
    if (filteredTags.includes(tag)) {
      setFilteredTags(filteredTags.filter(t => t !== tag));
    } else {
      setFilteredTags([...filteredTags, tag]);
    }
  };

  const addSearchTag = () => {
    if (searchTag.trim() && !allTags.includes(searchTag.trim())) {
      setAllTags([...allTags, searchTag.trim()]);
    }
    if (searchTag.trim() && !filteredTags.includes(searchTag.trim())) {
      setFilteredTags([...filteredTags, searchTag.trim()]);
    }
    setSearchTag("");
  };

  const removeFilterTag = (tag: string) => {
    setFilteredTags(filteredTags.filter(t => t !== tag));
  };

  // Render
  const width = 800;
  const height = 350;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 40;
  const paddingBottom = 60;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const allValues = Object.values(chartData).flat().map(d => d.value);
  const minVal = Math.max(0, Math.min(...allValues) - 10);
  const maxVal = Math.min(100, Math.max(...allValues) + 5);

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal || 1);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (allLabels.length - 1 || 1)) * chartWidth;
  };

  const yGridLevels = Array.from({ length: 6 }, (_, i) =>
    Math.round(minVal + (i / 5) * (maxVal - minVal))
  );

  return (
    <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:shadow-premium transition-all duration-300">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
          Présences
        </h3>
        <p className="text-xs font-medium text-slate-500">
          Filtrer par type de réunion, groupe et tags pour analyser l&apos;assiduité
        </p>
      </div>

      {/* Filtres */}
      <div className="space-y-4 mb-6">
        {/* Types de réunions */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Types de réunions</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <button
                key={type}
                onClick={() => toggleType(type as MeetingType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  filteredTypes.includes(type as MeetingType)
                    ? "text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                style={{
                  backgroundColor: filteredTypes.includes(type as MeetingType)
                    ? TYPE_COLORS[type as MeetingType]
                    : undefined,
                }}
              >
                {filteredTypes.includes(type as MeetingType) && (
                  <Check className="w-3.5 h-3.5 animate-[scale-in_0.15s_ease-out]" strokeWidth={3} />
                )}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sélecteur de groupe */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Groupe</h4>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Tous les groupes</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filteredTags.includes(tag)
                    ? "text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                style={{
                  backgroundColor: filteredTags.includes(tag) ? "#12BC7E" : undefined,
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Ajout de tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              placeholder="Ajouter un tag..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              onKeyPress={(e) => e.key === "Enter" && addSearchTag()}
            />
            <button
              onClick={addSearchTag}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Ajouter
            </button>
          </div>

          {/* Tags sélectionnés */}
          {filteredTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {filteredTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {tag}
                  <button
                    onClick={() => removeFilterTag(tag)}
                    className="hover:text-primary/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* États */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400 space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Chargement des données...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-3 py-8 px-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && Object.keys(chartData).some(type => chartData[type as MeetingType].length > 0) && (
        <>
          {/* Graphique SVG */}
          <div className="relative w-full overflow-hidden mb-6">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              {/* Définitions des dégradés */}
              {Object.entries(TYPE_COLORS).map(([type, color]) => {
                const gradientId = `gradient-${type}`;
                const lineGradientId = `line-gradient-${type}`;
                return (
                  <defs key={type}>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.00" />
                    </linearGradient>
                    <linearGradient id={lineGradientId} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={color} />
                      <stop offset="100%" stopColor={color} />
                    </linearGradient>
                  </defs>
                );
              })}

              {/* Grille Y */}
              {yGridLevels.map((level) => (
                <g key={level} className="opacity-40">
                  <line
                    x1={paddingLeft} y1={getY(level)}
                    x2={width - paddingRight} y2={getY(level)}
                    stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4,4"
                  />
                  <text x={paddingLeft - 10} y={getY(level) + 4}
                    textAnchor="end" fontSize="9" fontWeight="600" fill="#94a3b8">
                    {level}%
                  </text>
                </g>
              ))}

              {/* Courbes */}
              {Object.entries(chartData).map(([type, data]) => {
                if (data.length === 0) return null;

                const color = TYPE_COLORS[type as MeetingType];
                let linePath = "";

                if (data.length === 1) {
                  linePath = `M ${getX(0)} ${getY(data[0].value)}`;
                } else {
                  linePath = `M ${getX(0)} ${getY(data[0].value)}`;
                  for (let i = 0; i < data.length - 1; i++) {
                    const x1 = getX(i);
                    const y1 = getY(data[i].value);
                    const x2 = getX(i + 1);
                    const y2 = getY(data[i + 1].value);
                    const cpx = chartWidth / data.length / 2;
                    linePath += ` C ${x1 + cpx} ${y1}, ${x2 - cpx} ${y2}, ${x2} ${y2}`;
                  }
                }

                // Remplissage
                const fillPath = data.length > 0
                  ? `${linePath} L ${getX(data.length - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`
                  : "";

                return (
                  <g key={type}>
                    {fillPath && (
                      <path d={fillPath} fill={`url(#gradient-${type})`} />
                    )}
                    {linePath && (
                      <path d={linePath} fill="none" stroke={`url(#line-gradient-${type})`}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                    {/* Points de données */}
                    {data.map((point, index) => {
                      const x = getX(index);
                      const y = getY(point.value);
                      return (
                        <g key={index}>
                          <circle cx={x} cy={y} r="3" fill={color} stroke="white" strokeWidth="1" />
                          <text x={x} y={height - 10} textAnchor="middle" fontSize="8" fill="#6D6E71">
                            {point.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Légende */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TYPE_COLORS[type as MeetingType] }}
                />
                <span className="text-xs font-medium text-slate-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-50">
            {Object.entries(chartData).map(([type, data]) => {
              if (data.length === 0) return null;

              const avg = data.reduce((sum, d) => sum + d.value, 0) / data.length;
              const total = data.reduce((sum, d) => sum + d.totalRecorded, 0);
              const present = data.reduce((sum, d) => sum + d.presentCount, 0);

              return (
                <div key={type} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: TYPE_COLORS[type as MeetingType] }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {TYPE_LABELS[type as MeetingType]}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">{Math.round(avg)}%</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {present}/{total} présents
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!loading && !error && Object.keys(chartData).every(type => chartData[type as MeetingType].length === 0) && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <Users className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">Aucune donn&eacute;e correspondant aux filtres.</p>
          <p className="text-xs text-slate-400 mt-1">Essayez de modifier vos crit&egrave;res de s&eacute;lection.</p>
        </div>
      )}
    </div>
  );
}
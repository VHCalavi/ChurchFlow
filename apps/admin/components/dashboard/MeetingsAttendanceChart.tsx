"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, Loader2, AlertCircle, Tag, X, Check } from "lucide-react";
import { MeetingType } from "@churchflow/types";

interface DataPoint {
  label: string;
  value: number;
  presentCount: number;
  totalRecorded: number;
  date: string;
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

// Couleurs pour les types de rencontres
const TYPE_COLORS: Record<MeetingType, string> = {
  CULTE: "#006C69", // Vert VH
  TEMPS_DE_PRIERE: "#CEAD1E", // Gold
  REPETITION: "#527EDB", // Bleu
  AGAPE: "#12BC7E", // Vert sarcelle clair
  AUTRE: "#D6D1CE", // Warm Grey
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
  const [filteredTypes, setFilteredTypes] = useState<MeetingType[]>(
    Object.keys(TYPE_COLORS) as MeetingType[],
  );
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
    allMeetings.forEach((meeting) => {
      meeting.tags.forEach((tag) => tagSet.add(tag));
    });
    setAllTags(Array.from(tagSet));
  }, [allMeetings]);

  // Charger les données
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Charger les rencontres
        const meetingsRes = await fetch("/api/v1/meetings");
        const meetingsData = await meetingsRes.json();

        if (!meetingsData.success || !Array.isArray(meetingsData.data)) {
          throw new Error("Impossible de charger les données des rencontres");
        }

        // Charger les groupes
        const groupsRes = await fetch("/api/v1/groups");
        const groupsData = await groupsRes.json();

        if (groupsData.success && Array.isArray(groupsData.data)) {
          setGroups(
            groupsData.data.map((g: { id: string; name: string }) => ({
              id: g.id,
              name: g.name,
            })),
          );
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
  const applyFilters = useCallback(
    (meetings: RawMeeting[]) => {
      let filtered = meetings;

      // Filtre par type
      if (filteredTypes.length > 0) {
        filtered = filtered.filter((m) => filteredTypes.includes(m.type));
      }

      // Filtre par groupe
      if (selectedGroup !== "all") {
        filtered = filtered.filter((m) =>
          m.attendees.some((a) =>
            a.member.groups.some((g) => g.groupId === selectedGroup),
          ),
        );
      }

      // Filtre par tags
      if (filteredTags.length > 0) {
        filtered = filtered.filter((m) =>
          filteredTags.some((tag) => m.tags.includes(tag)),
        );
      }

      setFilteredMeetings(filtered);
    },
    [filteredTypes, selectedGroup, filteredTags],
  );

  useEffect(() => {
    applyFilters(allMeetings);
  }, [allMeetings, filteredTypes, selectedGroup, filteredTags, applyFilters]);

  // Générer les données pour le graphique
  const generateChartData = () => {
    const dataByType: Record<MeetingType, DataPoint[]> = {} as Record<
      MeetingType,
      DataPoint[]
    >;

    // Initialiser
    Object.keys(TYPE_COLORS).forEach((type) => {
      dataByType[type as MeetingType] = [];
    });

    // Calculer pour chaque rencontre
    filteredMeetings.forEach((meeting) => {
      // Filtrer par type
      if (!filteredTypes.includes(meeting.type)) return;

      // Filtrer par groupe
      if (selectedGroup !== "all") {
        const groupMembers = new Set(
          meeting.attendees
            .filter((a) =>
              a.member.groups.some((g) => g.groupId === selectedGroup),
            )
            .map((a) => a.memberId),
        );
        if (groupMembers.size === 0) return;
      }

      // Filtrer par tags
      if (
        filteredTags.length > 0 &&
        !meeting.tags.some((tag) => filteredTags.includes(tag))
      ) {
        return;
      }

      // Calculer la présence
      let totalCount = 0;
      let presentCount = 0;

      if (selectedGroup !== "all") {
        // Compter seulement les membres du groupe sélectionné
        meeting.attendees.forEach((a) => {
          if (a.member.groups.some((g) => g.groupId === selectedGroup)) {
            totalCount++;
            if (a.isPresent) presentCount++;
          }
        });
      } else {
        // Compter tous les participants
        totalCount = meeting.attendees.length;
        presentCount = meeting.attendees.filter((a) => a.isPresent).length;
      }

      // Créer le point de données
      const date = new Date(meeting.date);
      const label = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });
      const value =
        totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

      dataByType[meeting.type].push({
        label,
        value,
        presentCount,
        totalRecorded: totalCount,
        date: meeting.date,
      });
    });

    // Trier par date (du plus ancien au plus récent) et prendre les 10 derniers
    Object.keys(dataByType).forEach((type) => {
      dataByType[type as MeetingType].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      dataByType[type as MeetingType] =
        dataByType[type as MeetingType].slice(-10);
    });

    return dataByType;
  };

  const chartData = generateChartData();

  // Calculer les labels triés chronologiquement
  const allLabels = Array.from(
    new Map(
      Object.values(chartData)
        .flat()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((d) => [d.label, d]),
    ).values(),
  ).map((d) => d.label);

  // Helper functions
  const toggleType = (type: MeetingType) => {
    if (filteredTypes.includes(type)) {
      setFilteredTypes(filteredTypes.filter((t) => t !== type));
    } else {
      setFilteredTypes([...filteredTypes, type]);
    }
  };

  const toggleTag = (tag: string) => {
    if (filteredTags.includes(tag)) {
      setFilteredTags(filteredTags.filter((t) => t !== tag));
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
    setFilteredTags(filteredTags.filter((t) => t !== tag));
  };

  // Live Statistics Calculations
  let totalPresentSum = 0;
  let totalExpectedSum = 0;
  let maxAttendanceRate = 0;

  filteredMeetings.forEach((m) => {
    let mTotal = 0;
    let mPresent = 0;

    m.attendees.forEach((a) => {
      mTotal++;
      if (a.isPresent) mPresent++;
    });

    totalExpectedSum += mTotal;
    totalPresentSum += mPresent;

    if (mTotal > 0) {
      const rate = Math.round((mPresent / mTotal) * 100);
      if (rate > maxAttendanceRate) {
        maxAttendanceRate = rate;
      }
    }
  });

  const avgAttendance =
    totalExpectedSum > 0
      ? Math.round((totalPresentSum / totalExpectedSum) * 100)
      : 0;

  // Donut chart distribution calculations
  const typeCounts: Record<MeetingType, number> = {
    CULTE: 0,
    TEMPS_DE_PRIERE: 0,
    REPETITION: 0,
    AGAPE: 0,
    AUTRE: 0,
  };

  filteredMeetings.forEach((m) => {
    if (typeCounts[m.type] !== undefined) {
      typeCounts[m.type]++;
    }
  });

  const distribution = Object.entries(typeCounts)
    .map(([type, count]) => ({
      type: type as MeetingType,
      label: TYPE_LABELS[type as MeetingType],
      color: TYPE_COLORS[type as MeetingType],
      count,
    }))
    .filter((item) => item.count > 0);

  const totalCount = distribution.reduce((sum, item) => sum + item.count, 0);

  let accumulatedPercent = 0;
  const segments = distribution.map((item) => {
    const percent = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
    const dashArray = `${percent} ${100 - percent}`;
    const dashOffset = (100 - accumulatedPercent + 25) % 100;
    accumulatedPercent += percent;
    return {
      ...item,
      percent,
      dashArray,
      dashOffset,
    };
  });

  // Render variables for SVG line chart
  const width = 600;
  const height = 280;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const allValues = Object.values(chartData)
    .flat()
    .map((d) => d.value);
  const minVal = Math.max(0, Math.min(...allValues, 0) - 10);
  const maxVal = Math.min(100, Math.max(...allValues, 100) + 5);

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal || 1);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (allLabels.length - 1 || 1)) * chartWidth;
  };

  const yGridLevels = [0, 25, 50, 75, 100].filter(
    (l) => l >= minVal && l <= maxVal,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
          Statistiques de Présences
        </h3>
        <p className="text-xs font-medium text-slate-555">
          Filtrer par type de rencontre, groupe et tags pour analyser les
          présences
        </p>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-100">
          {/* Types de rencontres */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Types de rencontres
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => toggleType(type as MeetingType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
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
                    <Check
                      className="w-3 h-3 animate-[scale-in_0.15s_ease-out]"
                      strokeWidth={3}
                    />
                  )}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sélecteur de groupe */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Groupe
            </h4>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="all">Tous les groupes</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wide flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            Filtrer par Tags
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filteredTags.includes(tag)
                    ? "text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                style={{
                  backgroundColor: filteredTags.includes(tag)
                    ? "#12BC7E"
                    : undefined,
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Ajout de tag */}
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              placeholder="Rechercher / Ajouter un tag..."
              className="flex-1 px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              onKeyPress={(e) => e.key === "Enter" && addSearchTag()}
            />
            <button
              onClick={addSearchTag}
              className="px-4 py-2 rounded-lg bg-[#006C69] text-white text-xs font-bold hover:bg-[#006c69]/90 transition-colors shadow-sm"
            >
              Ajouter
            </button>
          </div>

          {/* Tags sélectionnés */}
          {filteredTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filteredTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold"
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
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100">
          <Loader2 className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-700">
            Chargement des rencontres...
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-3 py-6 px-4 rounded-xl bg-red-50 border border-red-150 text-red-650 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && filteredMeetings.length > 0 && (
        <>
          {/* Chiffres en haut (Stat Boxes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-slate-150 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:scale-[1.01] transition-all duration-300">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Rencontres
              </span>
              <h4 className="text-3xl font-black text-slate-900 mt-1">
                {filteredMeetings.length}
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-1.5">
                Rencontres filtrées
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-150 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:scale-[1.01] transition-all duration-300">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Présence Moyenne
              </span>
              <h4 className="text-3xl font-black text-slate-900 mt-1">
                {avgAttendance}%
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-1.5">
                Taux de présence global
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-150 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:scale-[1.01] transition-all duration-300">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Présents Cumulés
              </span>
              <h4 className="text-3xl font-black text-slate-900 mt-1">
                {totalPresentSum}
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-1.5">
                Émargements enregistrés
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-150 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:scale-[1.01] transition-all duration-300">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Record Affluence
              </span>
              <h4 className="text-3xl font-black text-[#006C69] mt-1">
                {maxAttendanceRate}%
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-1.5">
                Taux max sur une rencontre
              </p>
            </div>
          </div>

          {/* Graphiques dans des cases (Circle & Diagram) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Graphe en cercle (Circle/Donut Chart Case) */}
            <div className="lg:col-span-2 p-6 rounded-xl border border-slate-150 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] flex flex-col justify-between items-center min-h-[380px]">
              <div className="w-full text-left">
                <h4 className="text-sm font-extrabold text-slate-950 tracking-tight">
                  Distribution par Type
                </h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Répartition des types de rencontres
                </p>
              </div>

              {totalCount === 0 ? (
                <div className="flex-grow flex items-center justify-center">
                  <span className="text-xs text-slate-400">
                    Aucune donnée de type
                  </span>
                </div>
              ) : (
                <div className="relative w-44 h-44 flex items-center justify-center my-4">
                  <svg
                    viewBox="0 0 42 42"
                    className="w-full h-full transform -rotate-90"
                  >
                    <circle
                      cx="21"
                      cy="21"
                      r="15.91549430918954"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="4.2"
                    />
                    {segments.map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="21"
                        cy="21"
                        r="15.91549430918954"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="4.2"
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        className="transition-all duration-500 ease-in-out"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900">
                      {totalCount}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Total
                    </span>
                  </div>
                </div>
              )}

              {/* Légendes par type */}
              <div className="w-full space-y-1.5 mt-2 pt-4 border-t border-slate-50">
                {segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs font-semibold text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span>{seg.label}</span>
                    </div>
                    <span className="text-slate-500 font-bold">
                      {seg.count} ({Math.round(seg.percent)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphe en diagramme (Diagram/Line Chart Case) */}
            <div className="lg:col-span-3 p-6 rounded-xl border border-slate-150 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[380px]">
              <div className="w-full text-left">
                <h4 className="text-sm font-extrabold text-slate-950 tracking-tight">
                  Évolution des Présences
                </h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Taux de présence sur les 10 dernières rencontres
                </p>
              </div>

              {/* Diagramme Line Chart SVG */}
              <div className="relative w-full overflow-hidden my-4">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-auto overflow-visible"
                >
                  {/* Définitions des dégradés */}
                  {Object.entries(TYPE_COLORS).map(([type, color]) => {
                    const gradientId = `gradient-${type}`;
                    const lineGradientId = `line-gradient-${type}`;
                    return (
                      <defs key={type}>
                        <linearGradient
                          id={gradientId}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={color}
                            stopOpacity="0.18"
                          />
                          <stop
                            offset="100%"
                            stopColor={color}
                            stopOpacity="0.00"
                          />
                        </linearGradient>
                        <linearGradient
                          id={lineGradientId}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
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
                        x1={paddingLeft}
                        y1={getY(level)}
                        x2={width - paddingRight}
                        y2={getY(level)}
                        stroke="#E2E8F0"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      <text
                        x={paddingLeft - 10}
                        y={getY(level) + 4}
                        textAnchor="end"
                        fontSize="9"
                        fontWeight="700"
                        fill="#94a3b8"
                      >
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
                    const fillPath =
                      data.length > 0
                        ? `${linePath} L ${getX(data.length - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`
                        : "";

                    return (
                      <g key={type}>
                        {fillPath && (
                          <path d={fillPath} fill={`url(#gradient-${type})`} />
                        )}
                        {linePath && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke={`url(#line-gradient-${type})`}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                        {/* Points de données */}
                        {data.map((point, index) => {
                          const x = getX(index);
                          const y = getY(point.value);
                          return (
                            <g key={index}>
                              <circle
                                cx={x}
                                cy={y}
                                r="3"
                                fill={color}
                                stroke="white"
                                strokeWidth="1"
                              />
                              <text
                                x={x}
                                y={height - 8}
                                textAnchor="middle"
                                fontSize="8"
                                fontWeight="600"
                                fill="#64748b"
                              >
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

              {/* Légende du Diagramme */}
              <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-slate-50">
                {Object.entries(TYPE_LABELS).map(([type, label]) => {
                  if (chartData[type as MeetingType]?.length === 0) return null;
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: TYPE_COLORS[type as MeetingType],
                        }}
                      />
                      <span className="text-xs font-semibold text-slate-500">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && filteredMeetings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100 text-center">
          <Users className="w-12 h-12 text-slate-355 mb-4" />
          <p className="text-sm font-bold text-slate-800">
            Aucune donnée disponible
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Aucune rencontre ne correspond aux critères de sélection.
          </p>
        </div>
      )}
    </div>
  );
}

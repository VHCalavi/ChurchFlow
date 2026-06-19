"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface DataPoint {
  label: string; // Ex: "17 Mai"
  value: number; // Taux de présence en % (0-100)
  presentCount: number; // Nombre de présents enregistrés
  totalRecorded: number; // Total des enregistrements (présents + absents)
  meetingTitle: string;
}

interface RawMeeting {
  id: string;
  title: string;
  date: string;
  type: string;
  _count: { attendees: number };
  presentCount: number;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function AttendanceTrendChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/v1/meetings?churchId=default-church-id");
        const json = await res.json();

        if (!json.success || !Array.isArray(json.data)) {
          setError("Impossible de charger les données de présence.");
          return;
        }

        // Keep only CULTE meetings with at least one recorded attendance
        // Sort oldest→newest, take last 6
        const cultes: RawMeeting[] = (json.data as RawMeeting[])
          .filter((m) => m.type === "CULTE" && m._count.attendees > 0)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
          .slice(-6);

        if (cultes.length === 0) {
          // Fallback: all meeting types with attendance recorded
          const allWithAttendance: RawMeeting[] = (json.data as RawMeeting[])
            .filter((m) => m._count.attendees > 0)
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .slice(-6);

          setData(
            allWithAttendance.map((m) => ({
              label: formatDateLabel(m.date),
              value:
                m._count.attendees > 0
                  ? Math.round((m.presentCount / m._count.attendees) * 100)
                  : 0,
              presentCount: m.presentCount,
              totalRecorded: m._count.attendees,
              meetingTitle: m.title,
            })),
          );
        } else {
          setData(
            cultes.map((m) => ({
              label: formatDateLabel(m.date),
              value:
                m._count.attendees > 0
                  ? Math.round((m.presentCount / m._count.attendees) * 100)
                  : 0,
              presentCount: m.presentCount,
              totalRecorded: m._count.attendees,
              meetingTitle: m.title,
            })),
          );
        }
      } catch {
        setError("Erreur de connexion à l'API.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const avgRate =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.value, 0) / data.length)
      : 0;
  const avgPresent =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.presentCount, 0) / data.length)
      : 0;
  const peakPoint =
    data.length > 0
      ? data.reduce(
          (best, d) => (d.presentCount > best.presentCount ? d : best),
          data[0],
        )
      : null;

  const trend =
    data.length >= 2 ? data[data.length - 1].value - data[0].value : 0;
  const isTrendUp = trend >= 0;

  // ── SVG layout ──────────────────────────────────────────────────────────────
  const width = 600;
  const height = 200;
  const paddingLeft = 42;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (i: number) =>
    data.length <= 1
      ? paddingLeft + chartWidth / 2
      : paddingLeft + (i / (data.length - 1)) * chartWidth;

  const allValues = data.map((d) => d.value);
  const minVal = data.length > 0 ? Math.max(0, Math.min(...allValues) - 10) : 0;
  const maxVal =
    data.length > 0 ? Math.min(100, Math.max(...allValues) + 5) : 100;

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal || 1);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  let linePath = "";
  if (data.length === 1) {
    linePath = `M ${getX(0)} ${getY(data[0].value)}`;
  } else if (data.length > 1) {
    linePath = `M ${getX(0)} ${getY(data[0].value)}`;
    for (let i = 0; i < data.length - 1; i++) {
      const x1 = getX(i);
      const y1 = getY(data[i].value);
      const x2 = getX(i + 1);
      const y2 = getY(data[i + 1].value);
      const cpx = chartWidth / (data.length - 1) / 2;
      linePath += ` C ${x1 + cpx} ${y1}, ${x2 - cpx} ${y2}, ${x2} ${y2}`;
    }
  }

  const fillPath =
    data.length > 0
      ? `${linePath} L ${getX(data.length - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`
      : "";

  const yGridLevels = Array.from({ length: 5 }, (_, i) =>
    Math.round(minVal + (i / 4) * (maxVal - minVal)),
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] hover:shadow-premium transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Taux de Présence Global
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
              {data.length} Derniers Cultes
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Évolution des présences — données réelles de l&apos;API
          </p>
        </div>
        <div
          className="flex items-center space-x-1 text-xs font-bold"
          style={{ color: isTrendUp ? "#10b981" : "#ef4444" }}
        >
          {isTrendUp ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>
            {trend >= 0 ? "+" : ""}
            {trend}% sur la période
          </span>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400 space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Chargement des données...</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center space-x-3 py-8 px-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <Users className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">
            Aucune présence enregistrée pour le moment.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Les données apparaîtront après le premier émargement.
          </p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          {/* SVG Chart */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#006C69" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#006C69" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#006C69" />
                  <stop offset="100%" stopColor="#25A59F" />
                </linearGradient>
              </defs>

              {/* Y-axis grid */}
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
                    x={paddingLeft - 6}
                    y={getY(level) + 4}
                    textAnchor="end"
                    fontSize="9"
                    fontWeight="600"
                    fill="#94a3b8"
                  >
                    {level}%
                  </text>
                </g>
              ))}

              {/* Area fill */}
              {fillPath && <path d={fillPath} fill="url(#chartGradient)" />}

              {/* Bezier line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Hover vertical indicator */}
              {hoveredIndex !== null && (
                <line
                  x1={getX(hoveredIndex)}
                  y1={paddingTop}
                  x2={getX(hoveredIndex)}
                  y2={paddingTop + chartHeight}
                  stroke="#006C69"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.35"
                />
              )}

              {/* Data points */}
              {data.map((point, index) => {
                const x = getX(index);
                const y = getY(point.value);
                const isHovered = hoveredIndex === index;
                return (
                  <g
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  >
                    {/* Hit area */}
                    <circle cx={x} cy={y} r="16" fill="transparent" />
                    {/* Glow */}
                    {isHovered && (
                      <circle
                        cx={x}
                        cy={y}
                        r="9"
                        fill="#006C69"
                        fillOpacity="0.12"
                      />
                    )}
                    {/* Dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? "6" : "4"}
                      fill={isHovered ? "#FFFFFF" : "#006C69"}
                      stroke="#006C69"
                      strokeWidth={isHovered ? "3" : "2"}
                      style={{ transition: "all .15s ease" }}
                    />
                    {/* X-axis label */}
                    <text
                      x={x}
                      y={height - 6}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight={isHovered ? "800" : "600"}
                      fill={isHovered ? "#006C69" : "#94a3b8"}
                    >
                      {point.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Hover tooltip panel */}
          {hoveredIndex !== null && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between animate-fade-in">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wide">
                  {data[hoveredIndex].label}
                </p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate max-w-[200px]">
                  {data[hoveredIndex].meetingTitle}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-primary">
                  {data[hoveredIndex].value}%
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  {data[hoveredIndex].presentCount} présents /{" "}
                  {data[hoveredIndex].totalRecorded} enregistrés
                </p>
              </div>
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-50">
            {/* Average */}
            <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center space-x-1 mb-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Moyenne
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {avgRate}%
              </p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                ≈ {avgPresent} pers./culte
              </p>
            </div>

            {/* Record */}
            <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center space-x-1 mb-1.5">
                <Award className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Record
                </span>
              </div>
              {peakPoint && (
                <>
                  <p className="text-sm font-extrabold text-slate-900">
                    {peakPoint.value}%
                  </p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {peakPoint.presentCount} présents — {peakPoint.label}
                  </p>
                </>
              )}
            </div>

            {/* Last / hovered */}
            <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-center mb-1.5">
                <span className="text-xs font-bold text-primary/70 uppercase tracking-wide">
                  {hoveredIndex !== null
                    ? data[hoveredIndex].label
                    : "Dernier culte"}
                </span>
              </div>
              {(() => {
                const pt =
                  hoveredIndex !== null
                    ? data[hoveredIndex]
                    : data[data.length - 1];
                return (
                  <>
                    <p className="text-sm font-extrabold text-primary">
                      {pt.value}%
                    </p>
                    <p className="text-xs font-semibold text-primary/60 mt-0.5">
                      {pt.presentCount} / {pt.totalRecorded} enregistrés
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

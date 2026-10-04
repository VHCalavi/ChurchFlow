"use client";

/**
 * Mapping centralisé des labels UI.
 * La valeur "RESPONSABLE" reste en DB (enum Prisma), mais on l'affiche
 * comme "Ouvrier" dans toute l'interface.
 */
export const MEMBER_STATUS_LABELS: Record<string, string> = {
  SYMPATHISANT: "Sympathisant",
  MEMBRE: "Membre",
  RESPONSABLE: "Ouvrier",
};

export function memberStatusLabel(status: string | null | undefined): string {
  if (!status) return "—";
  return MEMBER_STATUS_LABELS[status] ?? status;
}

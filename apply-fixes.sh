#!/usr/bin/env bash
# Renomme "Responsable" en "Ouvrier" dans l'UI (label only, aucune migration DB)

set -euo pipefail

BACKUP="_backup_ouvrier_$(date +%Y%m%d_%H%M%S)"

G='\033[0;32m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'
log() { echo -e "${B}▶${N} $*"; }
ok()  { echo -e "${G}✓${N} $*"; }
die() { echo -e "${R}✗${N} $*" >&2; exit 1; }

[[ -f "package.json" ]] || die "Lance depuis la racine"
mkdir -p "$BACKUP"

FILES=(
  "apps/admin/app/dashboard/members/page.tsx"
  "apps/admin/app/dashboard/members/[id]/page.tsx"
  "apps/admin/app/dashboard/page.tsx"
)

for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp "$f" "$BACKUP/$f"
  fi
done

log "1/2 — Création du helper apps/admin/lib/labels.ts"
mkdir -p apps/admin/lib

cat > apps/admin/lib/labels.ts <<'ENDOFFILE'
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
ENDOFFILE
ok "labels.ts créé"

log "2/2 — Patch des pages"

python3 - <<'PYEOF'
import pathlib, re

targets = [
    "apps/admin/app/dashboard/members/page.tsx",
    "apps/admin/app/dashboard/members/[id]/page.tsx",
    "apps/admin/app/dashboard/page.tsx",
]

for path in targets:
    f = pathlib.Path(path)
    if not f.exists():
        print(f"[SKIP] {path}")
        continue
    src = f.read_text()
    original = src

    # a) Import du helper
    if "memberStatusLabel" not in src:
        lines = src.split("\n")
        last_import = 0
        for i, line in enumerate(lines[:80]):
            if line.startswith("import ") or line.startswith("} from "):
                last_import = i
        # Détecte si le fichier utilise "@/lib" (via tsconfig paths) ou chemin relatif
        use_alias = "@/components" in src or "@/lib" in src
        import_line = (
            'import { memberStatusLabel } from "@/lib/labels";'
            if use_alias
            else 'import { memberStatusLabel } from "../../../lib/labels";'
        )
        lines.insert(last_import + 1, import_line)
        src = "\n".join(lines)

    # b) Options des dropdowns
    src = src.replace(
        '<option value="RESPONSABLE">Responsables</option>',
        '<option value="RESPONSABLE">Ouvriers</option>'
    )
    src = src.replace(
        '<option value="RESPONSABLE">Responsable (Directeur / Berger / Pasteur)</option>',
        '<option value="RESPONSABLE">Ouvrier (Directeur / Berger / Pasteur)</option>'
    )
    src = src.replace(
        '<option value="RESPONSABLE">Responsable</option>',
        '<option value="RESPONSABLE">Ouvrier</option>'
    )

    # c) Affichages dynamiques du statut
    src = re.sub(r'\{member\.status\}', '{memberStatusLabel(member.status)}', src)
    src = re.sub(r'\{m\.status\}',      '{memberStatusLabel(m.status)}', src)
    src = re.sub(r'\{status\}',         '{memberStatusLabel(status)}', src)
    # cas avec string concatenation comme {member.status} ({member.grade})...
    src = re.sub(r'\bstatus\}(?!\()', 'status}', src)  # no-op safety

    if src != original:
        f.write_text(src)
        print(f"[OK] {path} patché")
    else:
        print(f"[--] {path} inchangé")
PYEOF

echo ""
echo "═══════════════════════════════════════════════"
ok "Renommage appliqué"
echo "═══════════════════════════════════════════════"
echo ""
echo "Backup : $BACKUP/"
echo ""
echo "▶ Relance :"
echo "    pnpm dev"
echo ""
echo "▶ Rollback :"
echo "    cp -r $BACKUP/* ."
#!/usr/bin/env bash
# Marque toutes les routes API comme dynamiques (force-dynamic)
# Corrige : "Dynamic server usage: Route /api/v1/xxx couldn't be rendered statically"

set -euo pipefail

BACKUP="_backup_dynroutes_$(date +%Y%m%d_%H%M%S)"

G='\033[0;32m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'
log() { echo -e "${B}▶${N} $*"; }
ok()  { echo -e "${G}✓${N} $*"; }
die() { echo -e "${R}✗${N} $*" >&2; exit 1; }

[[ -d "apps/api/app/api/v1" ]] || die "apps/api/app/api/v1 introuvable"

mkdir -p "$BACKUP"

log "Recherche des fichiers route.ts…"

COUNT=0
PATCHED=0

while IFS= read -r file; do
  COUNT=$((COUNT + 1))
  mkdir -p "$BACKUP/$(dirname "$file")"
  cp "$file" "$BACKUP/$file"

  # Skip si déjà présent
  if grep -q 'export const dynamic' "$file"; then
    continue
  fi

  python3 - "$file" <<'PYEOF'
import sys, pathlib, re

f = pathlib.Path(sys.argv[1])
src = f.read_text()

# Chercher la fin du dernier import
lines = src.split("\n")
last_import = -1
for i, line in enumerate(lines):
    if line.startswith("import ") or line.startswith("} from ") or line.startswith("const ") and "= require" in line:
        last_import = i

if last_import < 0:
    # Pas d'imports ? On met en haut après les commentaires
    lines.insert(0, 'export const dynamic = "force-dynamic";')
else:
    lines.insert(last_import + 1, '')
    lines.insert(last_import + 2, 'export const dynamic = "force-dynamic";')

f.write_text("\n".join(lines))
PYEOF

  PATCHED=$((PATCHED + 1))
done < <(find apps/api/app/api/v1 -name "route.ts" -type f)

ok "$PATCHED fichiers patchés sur $COUNT trouvés"

echo ""
echo "═══════════════════════════════════════════════"
ok "Routes API marquées comme dynamiques"
echo "═══════════════════════════════════════════════"
echo ""
echo "Backup : $BACKUP/"
echo ""
echo "▶ Relance : pnpm build"
echo ""
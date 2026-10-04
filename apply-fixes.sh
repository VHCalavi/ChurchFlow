#!/usr/bin/env bash
# Fix : retirer "use client" de lib/labels.ts
# (fonction pure sans hook React ni API navigateur → n'a pas besoin d'être client)

set -euo pipefail

G='\033[0;32m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'
log() { echo -e "${B}▶${N} $*"; }
ok()  { echo -e "${G}✓${N} $*"; }
die() { echo -e "${R}✗${N} $*" >&2; exit 1; }

F="apps/admin/lib/labels.ts"
[[ -f "$F" ]] || die "$F introuvable. Lance depuis la racine."

cp "$F" "$F.bak_$(date +%s)"
ok "Backup créé"

# Retirer la ligne '"use client";' en tête de fichier
sed -i '/^"use client";$/d' "$F"

if grep -q '"use client"' "$F"; then
  die "Encore présent. Édite manuellement."
fi

ok "'use client' retiré de $F"

# Aussi, ajouter un export const dynamic = "force-dynamic" sur le dashboard page
# pour s'assurer que le contenu est bien régénéré à chaque requête
DASH="apps/admin/app/dashboard/page.tsx"
if [[ -f "$DASH" ]] && ! grep -q 'export const dynamic' "$DASH"; then
  # Insère après le dernier import
  python3 - "$DASH" <<'PYEOF'
import sys, pathlib
f = pathlib.Path(sys.argv[1])
lines = f.read_text().split("\n")
last = 0
for i, line in enumerate(lines[:50]):
    if line.startswith("import ") or line.startswith("} from "):
        last = i
lines.insert(last + 1, '')
lines.insert(last + 2, 'export const dynamic = "force-dynamic";')
f.write_text("\n".join(lines))
PYEOF
  ok "force-dynamic ajouté au dashboard page"
fi

echo ""
echo "═══════════════════════════════════════════════"
ok "Fix appliqué"
echo "═══════════════════════════════════════════════"
echo ""
echo "▶ Étapes suivantes :"
echo "  1. pnpm build         (vérifier que ça compile)"
echo "  2. git add -A && git commit -m 'fix: server-safe labels' && git push"
echo "  3. pnpm run deploy:admin   (redéployer)"
echo ""
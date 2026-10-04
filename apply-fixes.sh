#!/usr/bin/env bash
# Renomme les labels UI "Groupe" → "Groupe / Tribu" (label only, aucune migration)

set -euo pipefail

BACKUP="_backup_grouptribu_$(date +%Y%m%d_%H%M%S)"

G='\033[0;32m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'
log() { echo -e "${B}▶${N} $*"; }
ok()  { echo -e "${G}✓${N} $*"; }
die() { echo -e "${R}✗${N} $*" >&2; exit 1; }

[[ -f "package.json" ]] || die "Lance depuis la racine"

mkdir -p "$BACKUP"

FILES=(
  "apps/admin/components/layout/sidebar.tsx"
  "apps/admin/app/dashboard/page.tsx"
  "apps/admin/app/dashboard/groups/page.tsx"
  "apps/admin/app/dashboard/groups/[id]/page.tsx"
  "apps/admin/app/dashboard/gems/page.tsx"
  "apps/admin/app/dashboard/gems/[id]/page.tsx"
  "apps/admin/app/dashboard/meetings/page.tsx"
  "apps/admin/app/dashboard/meetings/[id]/attendance/page.tsx"
  "apps/admin/app/dashboard/reports/page.tsx"
  "apps/admin/components/dashboard/MeetingsAttendanceChart.tsx"
  "apps/admin/components/layout/global-search.tsx"
)

for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp "$f" "$BACKUP/$f"
  fi
done

trap 'echo -e "\n${R}✗ Erreur. Restaure :${N} cp -r $BACKUP/* ."' ERR

log "Application des renommages UI…"

python3 - <<'PYEOF'
import pathlib, re

targets = [
    "apps/admin/components/layout/sidebar.tsx",
    "apps/admin/app/dashboard/page.tsx",
    "apps/admin/app/dashboard/groups/page.tsx",
    "apps/admin/app/dashboard/groups/[id]/page.tsx",
    "apps/admin/app/dashboard/gems/page.tsx",
    "apps/admin/app/dashboard/gems/[id]/page.tsx",
    "apps/admin/app/dashboard/meetings/page.tsx",
    "apps/admin/app/dashboard/meetings/[id]/attendance/page.tsx",
    "apps/admin/app/dashboard/reports/page.tsx",
    "apps/admin/components/dashboard/MeetingsAttendanceChart.tsx",
    "apps/admin/components/layout/global-search.tsx",
]

# Règles de remplacement (ordre important : du plus spécifique au plus général)
RULES = [
    # ── Labels très spécifiques (avant les génériques)
    ('title="Groupes & Départements"', 'title="Groupes, Tribus & Départements"'),
    ('Gestion des Groupes & Départements', 'Gestion des Groupes / Tribus'),
    ('Administrer les départements, tribus et maisons d\'honneur de l\'église',
     'Administrer les groupes, tribus, départements et maisons d\'honneur de l\'église'),
    ('Administrer les départements, tribus et maisons d\u2019honneur de l\u2019église',
     'Administrer les groupes, tribus, départements et maisons d\u2019honneur de l\u2019église'),

    # ── Titres de cards dashboard
    ('title="Groupes & GEM"', 'title="Groupes, Tribus & GEM"'),

    # ── Menu sidebar
    ('title: "Groupes"', 'title: "Groupes / Tribus"'),

    # ── Placeholders recherche
    ('placeholder="Rechercher un groupe, département ou tribu..."',
     'placeholder="Rechercher un groupe, une tribu, un département..."'),

    # ── Tabs & sections dans détails
    ('Membres du Groupe', 'Membres du Groupe / Tribu'),
    ('Membres du groupe', 'Membres du Groupe / Tribu'),
    ('Nouveau groupe', 'Nouveau Groupe / Tribu'),
    ('Créer un nouveau groupe', 'Créer un nouveau Groupe / Tribu'),
    ('Créer le groupe', 'Créer le Groupe / Tribu'),
    ('Créer un groupe', 'Créer un Groupe / Tribu'),
    ('Nom du groupe', 'Nom du Groupe / Tribu'),
    ('Groupe parent (optionnel)', 'Groupe / Tribu parent (optionnel)'),
    ('Groupe parent', 'Groupe / Tribu parent'),
    ('Sous-groupe de', 'Sous-groupe de'),

    # ── Modals et dialogues
    ('Ajouter à un groupe', 'Ajouter à un Groupe / Tribu'),
    ('Ajouter un membre au groupe', 'Ajouter un membre au Groupe / Tribu'),
    ('Ajouter un membre au Groupe', 'Ajouter un membre au Groupe / Tribu'),
    ('Voulez-vous vraiment retirer le membre de ce groupe ?',
     'Voulez-vous vraiment retirer le membre de ce Groupe / Tribu ?'),
    ('Confirmer le retrait', 'Confirmer le retrait du Groupe / Tribu'),
    ('Retirer du groupe', 'Retirer du Groupe / Tribu'),
    ('Retirer du Groupe', 'Retirer du Groupe / Tribu'),

    # ── Labels de stat
    ('Départements de Service', 'Départements de Service'),

    # ── Générique : uniquement si isolé (mot complet)
    ('>Groupe<', '>Groupe / Tribu<'),
    ('"Groupe"', '"Groupe / Tribu"'),
    ('Groupe introuvable', 'Groupe / Tribu introuvable'),
    ('Groupe non trouvé', 'Groupe / Tribu non trouvé'),
    ('groupe non trouvé', 'Groupe / Tribu non trouvé'),

    # ── Filtres
    ('Filtrer par Groupe invité', 'Filtrer par Groupe / Tribu invité'),
    ('Filtrer par Groupe', 'Filtrer par Groupe / Tribu'),
    ('Groupes invités', 'Groupes / Tribus invités'),
    ('Groupe invité', 'Groupe / Tribu invité'),

    # ── Filtres dropdown "Tous les groupes"
    ('Tous les groupes', 'Tous les Groupes / Tribus'),
    ('Toutes les groupes', 'Tous les Groupes / Tribus'),

    # ── Search global
    ('Rechercher des membres, groupes, GEMs...',
     'Rechercher des membres, groupes/tribus, GEMs...'),
    ('Groupes & GEMs', 'Groupes / Tribus & GEMs'),
    ('Aucun groupe disponible', 'Aucun Groupe / Tribu disponible'),

    # ── Tableau de bord card
    ('Groupes & GEM', 'Groupes, Tribus & GEM'),

    # ── Onglets sidebar meetings/gems
    ('Gérer les GEMs', 'Gérer les GEMs'),

    # ── Menus déroulants
    ('Choisir...', 'Choisir...'),

    # ── GEMs listent groupes
    ('Groupe', 'Groupe / Tribu'),
]

def patch_file(path):
    f = pathlib.Path(path)
    if not f.exists():
        print(f"[SKIP] {path}")
        return
    src = f.read_text()
    original = src

    for old, new in RULES:
        if old in src:
            src = src.replace(old, new)

    if src != original:
        f.write_text(src)
        print(f"[OK] {path}")
    else:
        print(f"[--] {path} (aucun match)")

for t in targets:
    patch_file(t)
PYEOF

echo ""
echo "═══════════════════════════════════════════════"
ok "Renommage Groupe → Groupe / Tribu appliqué"
echo "═══════════════════════════════════════════════"
echo ""
echo "Backup : $BACKUP/"
echo "Rollback : cp -r $BACKUP/* ."
echo ""
echo "▶ Relance : pnpm dev"
echo ""
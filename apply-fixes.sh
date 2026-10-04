#!/usr/bin/env bash
# Ajoute .vercel/ au .gitignore et retire du tracking git
# (sans supprimer les fichiers locaux)

set -euo pipefail

G='\033[0;32m'; R='\033[0;31m'; Y='\033[0;33m'; B='\033[0;34m'; N='\033[0m'
log()  { echo -e "${B}▶${N} $*"; }
ok()   { echo -e "${G}✓${N} $*"; }
warn() { echo -e "${Y}⚠${N} $*"; }
die()  { echo -e "${R}✗${N} $*" >&2; exit 1; }

[[ -f "package.json" ]] || die "Lance depuis la racine"

# ═══════════════════════════════════════════════════════════════════
# 1) Compléter .gitignore
# ═══════════════════════════════════════════════════════════════════
log "1/3 — Mise à jour du .gitignore"

# Créer si absent
[[ -f .gitignore ]] || touch .gitignore

# Liste des patterns à garantir
PATTERNS=(
  ".vercel/"
  ".env.local"
  ".env.production.local"
  "apps/*/.env"
  "apps/*/.env.local"
  "apps/*/.env.production.local"
  "packages/*/.env"
  "packages/*/.env.local"
  "packages/*/.env.production.local"
)

for pat in "${PATTERNS[@]}"; do
  if ! grep -qxF "$pat" .gitignore; then
    echo "$pat" >> .gitignore
    ok "Ajouté : $pat"
  else
    echo "  (déjà présent) $pat"
  fi
done

# ═══════════════════════════════════════════════════════════════════
# 2) Retirer .vercel/ et .env* du tracking git (si présents)
# ═══════════════════════════════════════════════════════════════════
log "2/3 — Retrait du tracking git"

# Retirer du cache git SANS supprimer les fichiers locaux
for path in ".vercel" ".env.local" ".env.production.local"; do
  if git ls-files --error-unmatch "$path" >/dev/null 2>&1 || \
     git ls-files "$path" 2>/dev/null | grep -q .; then
    git rm -r --cached "$path" >/dev/null 2>&1 || true
    ok "Retiré du tracking : $path"
  else
    echo "  (pas tracké) $path"
  fi
done

# Idem pour les sous-dossiers apps/*/ et packages/*/
for f in $(git ls-files | grep -E '(^|/)\.env(\.|$)' 2>/dev/null || true); do
  git rm --cached "$f" >/dev/null 2>&1 || true
  ok "Retiré du tracking : $f"
done

for f in $(git ls-files | grep -E '(^|/)\.vercel/' 2>/dev/null || true); do
  git rm --cached "$f" >/dev/null 2>&1 || true
done

# ═══════════════════════════════════════════════════════════════════
# 3) Résumé & actions
# ═══════════════════════════════════════════════════════════════════
log "3/3 — Vérification"

echo ""
echo "Contenu de .gitignore :"
grep -E "\.vercel|\.env" .gitignore || echo "  (aucun)"

echo ""
echo "Fichiers encore trackés par git (devrait être vide) :"
git ls-files | grep -E "\.vercel|\.env" || echo "  ✓ Aucun"

echo ""
echo "═══════════════════════════════════════════════"
ok "Terminé"
echo "═══════════════════════════════════════════════"
echo ""
echo "▶ Étapes suivantes :"
echo "   1. git add .gitignore"
echo "   2. git commit -m 'chore: ignore .vercel and env files'"
echo "   3. git push"
echo ""
warn "⚠  Si tu as déjà commité .vercel/ avec des secrets :"
echo "   → Change TOUS tes mots de passe/secrets en prod :"
echo "     • Neon : Reset password de la DB"
echo "     • Vercel : Régénère NEXTAUTH_SECRET, AUTH_SECRET"
echo "     • Toute autre clé exposée"
echo ""
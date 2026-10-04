#!/usr/bin/env bash
# Fix : création de membre qui échoue silencieusement
#  - Corrige les valeurs d'enum (ASPIRANT, GA_C50, etc.)
#  - Pré-remplit grade/echelon avec valeurs par défaut
#  - Affiche la vraie erreur au lieu de mocker
#  - Renomme "Responsable" → "Ouvrier" partout (labels UI)

set -euo pipefail

BACKUP="_backup_fixmember_$(date +%Y%m%d_%H%M%S)"

G='\033[0;32m'; R='\033[0;31m'; B='\033[0;34m'; N='\033[0m'
log() { echo -e "${B}▶${N} $*"; }
ok()  { echo -e "${G}✓${N} $*"; }
die() { echo -e "${R}✗${N} $*" >&2; exit 1; }

[[ -f "package.json" ]] || die "Lance depuis la racine"

F="apps/admin/app/dashboard/members/page.tsx"
FD="apps/admin/app/dashboard/members/[id]/page.tsx"
[[ -f "$F" ]] || die "$F introuvable"

mkdir -p "$BACKUP/$(dirname "$F")"
cp "$F" "$BACKUP/$F"
[[ -f "$FD" ]] && { mkdir -p "$BACKUP/$(dirname "$FD")"; cp "$FD" "$BACKUP/$FD"; }

log "Patch des fichiers membres…"

python3 - <<'PYEOF'
import pathlib, re

# ═══════════════════════════════════════════════════════════════════
# Fichier 1 : members/page.tsx
# ═══════════════════════════════════════════════════════════════════
f = pathlib.Path("apps/admin/app/dashboard/members/page.tsx")
src = f.read_text()
original = src

# ─── 1) Renommer "Responsable (Directeur...)" → "Ouvrier..." (multi-line safe)
src = src.replace(
    "Responsable (Directeur / Berger / Pasteur)",
    "Ouvrier (Directeur / Berger / Pasteur)"
)
src = src.replace(
    '<option value="RESPONSABLE">Responsables</option>',
    '<option value="RESPONSABLE">Ouvriers</option>'
)
src = src.replace(
    '<option value="RESPONSABLE">\n            Responsable\n          </option>',
    '<option value="RESPONSABLE">\n            Ouvrier\n          </option>'
)

# ─── 2) Corriger valeurs enum grade (CREATE modal)
# ATTENTION : ne toucher QUE les attributs value="..." pour ne pas casser les labels
src = re.sub(r'value="Aspirant"', 'value="ASPIRANT"', src)
src = re.sub(r'value="Serviteur"', 'value="SERVITEUR"', src)
src = re.sub(r"value=\"Gagneur d'âmes\"", 'value="GAGNEUR_AMES"', src)
src = re.sub(r'value="Assistant Pasteur"', 'value="ASSISTANT_PASTEUR"', src)
src = re.sub(r'value="Pasteur Assistant"', 'value="PASTEUR_ASSISTANT"', src)
src = re.sub(r'value="Pasteur titulaire"', 'value="PASTEUR_TITULAIRE"', src)
src = re.sub(r'value="Pasteur Titulaire"', 'value="PASTEUR_TITULAIRE"', src)

# ─── 3) Corriger valeurs enum echelon (CREATE modal)
src = re.sub(r'value="GA C50"', 'value="GA_C50"', src)
src = re.sub(r'value="GA C100"', 'value="GA_C100"', src)

# ─── 4) Valeurs par défaut pour grade/echelon
src = re.sub(
    r'const \[grade, setGrade\] = useState\(""\);',
    'const [grade, setGrade] = useState("ASPIRANT");',
    src
)
src = re.sub(
    r'const \[echelon, setEchelon\] = useState\(""\);',
    'const [echelon, setEchelon] = useState("C2");',
    src
)

# ─── 5) Auto-fill lors du changement de status vers RESPONSABLE
old_change = '''onChange={(e) =>
                      setStatus(
                        e.target.value as
                          | "SYMPATHISANT"
                          | "MEMBRE"
                          | "RESPONSABLE",
                      )
                    }'''
new_change = '''onChange={(e) => {
                      const newStatus = e.target.value as
                        | "SYMPATHISANT"
                        | "MEMBRE"
                        | "RESPONSABLE";
                      setStatus(newStatus);
                      if (newStatus === "RESPONSABLE") {
                        if (!grade) setGrade("ASPIRANT");
                        if (!echelon) setEchelon("C2");
                      }
                    }}'''
if old_change in src:
    src = src.replace(old_change, new_change)
    print("[OK] onChange status patché (create modal)")
else:
    print("[--] onChange status non trouvé à l'identique")

# ─── 6) Ne PAS mock sur erreur API (else branch)
old_else = '''      } else {
        const mockNewMember: Member = {
          id: String(Date.now()),
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          status,
          grade: status === "RESPONSABLE" ? grade || "Aspirant" : null,
          echelon: status === "RESPONSABLE" ? echelon || "C2" : null,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setMembers((prev) => [mockNewMember, ...prev]);
        showNotification("Membre ajouté localement !", "success");
        setIsModalOpen(false);
      }'''
new_else = '''      } else {
        showNotification(
          data.error || "Erreur lors de la création du membre",
          "error",
        );
        // Ne PAS fermer la modal → l'utilisateur peut corriger
      }'''
if old_else in src:
    src = src.replace(old_else, new_else)
    print("[OK] Bloc else create patché (plus de mock silencieux)")
else:
    print("[--] Bloc else non trouvé")

# ─── 7) Catch : ne pas mock
old_catch = '''    } catch (err) {
      console.error(err);
      showNotification(
        "Erreur de connexion. Membre ajouté localement.",
        "success",
      );
      const mockNewMember: Member = {
        id: String(Date.now()),
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        status,
        grade: status === "RESPONSABLE" ? grade || "Aspirant" : null,
        echelon: status === "RESPONSABLE" ? echelon || "C2" : null,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setMembers((prev) => [mockNewMember, ...prev]);
      setIsModalOpen(false);
    } finally {'''
new_catch = '''    } catch (err) {
      console.error(err);
      showNotification(
        "Erreur de connexion. Vérifiez votre réseau et réessayez.",
        "error",
      );
    } finally {'''
if old_catch in src:
    src = src.replace(old_catch, new_catch)
    print("[OK] Catch create patché")
else:
    print("[--] Catch non trouvé")

if src != original:
    f.write_text(src)
    print("[OK] members/page.tsx mis à jour")
else:
    print("[--] Aucun changement dans members/page.tsx")

# ═══════════════════════════════════════════════════════════════════
# Fichier 2 : members/[id]/page.tsx
# ═══════════════════════════════════════════════════════════════════
fd = pathlib.Path("apps/admin/app/dashboard/members/[id]/page.tsx")
if fd.exists():
    src = fd.read_text()
    original = src

    # Ajouter l'import si absent
    if "memberStatusLabel" not in src:
        lines = src.split("\n")
        last_import = 0
        for i, line in enumerate(lines[:50]):
            if line.startswith("import ") or line.startswith("} from "):
                last_import = i
        lines.insert(last_import + 1, 'import { memberStatusLabel } from "@/lib/labels";')
        src = "\n".join(lines)

    # Remplacer affichage brut du statut par le label
    src = re.sub(
        r'\{member\.status\}',
        '{memberStatusLabel(member.status)}',
        src
    )

    # Renommer dans les selects du profil
    src = src.replace(
        '<option value="RESPONSABLE">Responsable</option>',
        '<option value="RESPONSABLE">Ouvrier</option>'
    )

    if src != original:
        fd.write_text(src)
        print("[OK] members/[id]/page.tsx mis à jour")
    else:
        print("[--] Aucun changement dans [id]/page.tsx")
PYEOF

echo ""
echo "═══════════════════════════════════════════════"
ok "Fix appliqué"
echo "═══════════════════════════════════════════════"
echo ""
echo "Backup : $BACKUP/"
echo ""
echo "▶ Test : pnpm dev"
echo "▶ Rollback : cp -r $BACKUP/* ."
echo ""
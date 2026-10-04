#!/usr/bin/env node
/**
 * scripts/predeploy-baseline.js
 *
 * Détecte automatiquement le cas "squash de migrations" en production :
 *   - La DB a un historique (_prisma_migrations avec d'anciens noms)
 *   - Une nouvelle baseline existe dans prisma/migrations/
 *   - La baseline n'est PAS encore marquée comme appliquée
 *
 * → On marque alors la baseline comme appliquée, ce qui évite que
 *   `prisma migrate deploy` tente de rejouer son SQL (crash sur CREATE TABLE).
 *
 * Idempotent : peut être lancé 100 fois sans effet de bord.
 * Safe : n'écrit AUCUN SQL sur la DB, insère 1 ligne dans _prisma_migrations.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DB_PKG = path.join(ROOT, "packages", "database");
const MIGRATIONS_DIR = path.join(DB_PKG, "prisma", "migrations");

const log  = (m) => console.log(`[predeploy] ${m}`);
const ok   = (m) => console.log(`[predeploy] ✅ ${m}`);
const warn = (m) => console.warn(`[predeploy] ⚠️  ${m}`);
const fail = (m) => { console.error(`[predeploy] ❌ ${m}`); process.exit(1); };

function run(cmd, { allowFailure = false } = {}) {
  try {
    return execSync(cmd, {
      cwd: DB_PKG,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    const out = (e.stdout || "") + (e.stderr || "");
    if (allowFailure) return out;
    throw new Error(`Commande échouée: ${cmd}\n${out}`);
  }
}

function runLive(cmd) {
  execSync(cmd, { cwd: DB_PKG, stdio: "inherit" });
}

function findBaseline() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return null;
  const dirs = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((d) => fs.statSync(path.join(MIGRATIONS_DIR, d)).isDirectory())
    .sort();
  return dirs.find((d) => /baseline/i.test(d)) || null;
}

function migrateStatus() {
  return run("pnpm exec prisma migrate status", { allowFailure: true });
}

function main() {
  log("Check pré-déploiement Prisma…");

  if (!process.env.DATABASE_URL) {
    fail("DATABASE_URL non défini. Impossible de contacter la DB.");
  }

  // Sécurité : on n'agit que si DATABASE_URL pointe vers une DB réelle.
  // (sanity check — pas bloquant pour localhost)
  const url = process.env.DATABASE_URL;
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    log("DATABASE_URL pointe vers localhost — skip du check (dev).");
    return;
  }

  const baseline = findBaseline();
  if (!baseline) {
    ok("Aucune baseline trouvée. Rien à faire — migrate deploy gérera tout.");
    return;
  }

  log(`Baseline détectée : ${baseline}`);

  const status = migrateStatus();
  log("Statut Prisma :");
  console.log(status.split("\n").map((l) => `    ${l}`).join("\n"));

  // Cas 1 : DB vierge → rien à faire, migrate deploy créera tout
  if (/No migration found|empty|not yet been created/i.test(status)) {
    ok("DB vierge détectée → migrate deploy appliquera la baseline.");
    return;
  }

  // Cas 2 : baseline déjà marquée → rien à faire
  const pendingMatch = status.match(
    /Following migrations? have not yet been applied:([\s\S]*?)(?:\n\n|To apply|$)/i
  );
  const pending = pendingMatch ? pendingMatch[1] : "";

  if (!pending.includes(baseline)) {
    ok("Baseline déjà marquée comme appliquée. Rien à faire.");
    return;
  }

  // Cas 3 : baseline en attente ET historique existant → cas squash
  const hasHistory =
    /applied/i.test(status) ||
    /\d{14}_\w+/.test(status.replace(pending, ""));

  if (!hasHistory) {
    log("Aucun historique détecté → DB considérée comme neuve.");
    ok("migrate deploy appliquera la baseline normalement.");
    return;
  }

  warn("Cas 'squash de migrations' détecté en production.");
  warn(`→ Marquage automatique de "${baseline}" comme appliquée.`);
  warn("  Aucune donnée ne sera modifiée.");

  runLive(`pnpm exec prisma migrate resolve --applied ${baseline}`);

  ok(`Baseline "${baseline}" marquée comme appliquée.`);

  const finalStatus = migrateStatus();
  if (/Database schema is up to date|No migration found/i.test(finalStatus)) {
    ok("DB en phase avec les migrations. Prêt pour le déploiement.");
  } else {
    warn("Vérifie manuellement le statut ci-dessus.");
  }
}

try {
  main();
} catch (e) {
  fail(e.message || String(e));
}
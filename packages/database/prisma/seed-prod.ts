import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Pre-hashed "password123" with bcrypt (salt rounds = 10)
const ADMIN_PASSWORD_HASH = "$2a$10$1UhmLpURk7J9BwRO.4NpZefUeVh9ydUq7IcvBZEPBTLud9RFXOcea";

async function main() {
  console.log("🌱 Début de l'initialisation de la base de données de PRODUCTION...");

  // 1. Église par défaut
  const churchId = "default-church-id";
  const church = await prisma.church.upsert({
    where: { id: churchId },
    update: {
      name: "Vases d'Honneur Calavi",
      address: "Calavi, Bénin",
      email: "vasesdhonneurcalavi@gmail.com",
    },
    create: {
      id: churchId,
      name: "Vases d'Honneur Calavi",
      address: "Calavi, Bénin",
      email: "vasesdhonneurcalavi@gmail.com",
    },
  });
  console.log(`✅ Église : ${church.name}`);

  // 2. Création des Rôles & Permissions
  const permissionsList = [
    { action: "read", resource: "members", description: "Lecture des fiches membres" },
    { action: "write", resource: "members", description: "Modification des membres" },
    { action: "read", resource: "groups", description: "Lecture des groupes & GEM" },
    { action: "write", resource: "groups", description: "Gestion des groupes & GEM" },
    { action: "read", resource: "gems", description: "Lecture des GEMs" },
    { action: "create", resource: "gems", description: "Créer des GEMs" },
    { action: "manage_members", resource: "gems", description: "Gérer les membres d'un GEM" },
    { action: "create", resource: "reports", description: "Créer des rapports" },
    { action: "view_own", resource: "reports", description: "Voir ses propres rapports" },
    { action: "view_group", resource: "reports", description: "Voir les rapports de son groupe" },
    { action: "view_all", resource: "reports", description: "Voir tous les rapports" },
    { action: "read", resource: "meetings", description: "Lecture des réunions" },
    { action: "write", resource: "meetings", description: "Gestion et émargement des réunions" },
    { action: "read", resource: "finances", description: "Lecture des transactions financières" },
    { action: "write", resource: "finances", description: "Gestion des transactions" },
    { action: "manage", resource: "roles", description: "Gestion de la matrice RBAC" }
  ];

  const seededPermissions: Record<string, any> = {};
  for (const perm of permissionsList) {
    const created = await prisma.permission.upsert({
      where: { action_resource: { action: perm.action, resource: perm.resource } },
      update: { description: perm.description },
      create: perm
    });
    seededPermissions[`${perm.action}:${perm.resource}`] = created;
  }
  console.log("✅ Permissions initialisées");

  const rolesData = [
    { name: "ADMIN", description: "Administrateur Général", perms: ["read:members", "write:members", "read:groups", "write:groups", "read:gems", "create:gems", "manage_members:gems", "create:reports", "view_own:reports", "view_group:reports", "view_all:reports", "read:graph", "read:meetings", "write:meetings", "read:finances", "write:finances", "manage:roles"] },
    { name: "PASTEUR", description: "Pasteur Titulaire", perms: ["read:members", "read:groups", "read:gems", "read:graph", "read:meetings", "write:meetings", "create:reports", "view_own:reports", "view_all:reports"] },
    { name: "RESPONSABLE_GEM", description: "Responsable de GEM", perms: ["read:groups", "read:gems", "create:gems", "manage_members:gems", "read:graph", "read:meetings", "write:meetings", "create:reports", "view_own:reports", "view_group:reports"] },
    { name: "TRESORIER", description: "Trésorier de l'église", perms: ["read:members", "read:finances", "write:finances"] },
    { name: "MEMBRE", description: "Fidèle membre de l'église", perms: ["read:members", "read:groups", "read:gems", "read:graph", "create:reports", "view_own:reports"] }
  ];

  const seededRoles: Record<string, any> = {};
  for (const r of rolesData) {
    const roleObj = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description }
    });
    seededRoles[r.name] = roleObj;

    await prisma.rolePermission.createMany({
      data: r.perms
        .filter((pKey) => seededPermissions[pKey])
        .map((pKey) => ({ roleId: roleObj.id, permissionId: seededPermissions[pKey].id })),
      skipDuplicates: true,
    });
  }
  console.log("✅ Rôles et associations initialisés");

  // 3. Utilisateur Administrateur
  const adminEmail = "admin@churchflow.com";
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Dr. Paul OBIANG",
      password: ADMIN_PASSWORD_HASH,
      churchId: church.id,
      isActive: true,
    },
    create: {
      name: "Dr. Paul OBIANG",
      email: adminEmail,
      password: ADMIN_PASSWORD_HASH,
      churchId: church.id,
      isActive: true,
    },
  });
  console.log(`✅ Utilisateur Admin : ${adminUser.name}`);

  // 4. Assigner le rôle ADMIN
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: seededRoles["ADMIN"].id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: seededRoles["ADMIN"].id,
    },
  });
  console.log("✅ Rôle ADMIN assigné");

  // Finance categories par défaut
  const defaultCategories = [
    // Entrées
    { name: "Offrande", flowType: "ENTREE" as const, family: null, color: "#10B981" },
    { name: "Dîme", flowType: "ENTREE" as const, family: null, color: "#006C69" },
    { name: "Don / Action de grâce", flowType: "ENTREE" as const, family: null, color: "#12BC7E" },
    { name: "Collecte enfants", flowType: "ENTREE" as const, family: null, color: "#CEAD1E" },
    { name: "Autre entrée", flowType: "ENTREE" as const, family: null, color: "#6D6E71" },
    // Fonctionnement
    { name: "Électricité", flowType: "SORTIE" as const, family: "FONCTIONNEMENT" as const, color: "#F97316" },
    { name: "Eau", flowType: "SORTIE" as const, family: "FONCTIONNEMENT" as const, color: "#F97316" },
    { name: "Internet / Téléphone", flowType: "SORTIE" as const, family: "FONCTIONNEMENT" as const, color: "#F97316" },
    { name: "Frais de loge / Location salle", flowType: "SORTIE" as const, family: "FONCTIONNEMENT" as const, color: "#F97316" },
    { name: "Entretien & Nettoyage", flowType: "SORTIE" as const, family: "FONCTIONNEMENT" as const, color: "#F97316" },
    { name: "Fournitures de bureau", flowType: "SORTIE" as const, family: "FONCTIONNEMENT" as const, color: "#F97316" },
    { name: "Transport", flowType: "SORTIE" as const, family: "FONCTIONNEMENT" as const, color: "#F97316" },
    { name: "Autre fonctionnement", flowType: "SORTIE" as const, family: "FONCTIONNEMENT" as const, color: "#F97316" },
    // Investissement
    { name: "Matériel sono & audiovisuel", flowType: "SORTIE" as const, family: "INVESTISSEMENT" as const, color: "#3B82F6" },
    { name: "Instruments de musique", flowType: "SORTIE" as const, family: "INVESTISSEMENT" as const, color: "#3B82F6" },
    { name: "Mobilier & Équipements", flowType: "SORTIE" as const, family: "INVESTISSEMENT" as const, color: "#3B82F6" },
    { name: "Équipements informatiques", flowType: "SORTIE" as const, family: "INVESTISSEMENT" as const, color: "#3B82F6" },
    { name: "Travaux & Aménagements", flowType: "SORTIE" as const, family: "INVESTISSEMENT" as const, color: "#3B82F6" },
    { name: "Autre investissement", flowType: "SORTIE" as const, family: "INVESTISSEMENT" as const, color: "#3B82F6" },
    // Exceptionnel
    { name: "Campagne CJSA", flowType: "SORTIE" as const, family: "EXCEPTIONNEL" as const, color: "#8B5CF6" },
    { name: "Séminaire", flowType: "SORTIE" as const, family: "EXCEPTIONNEL" as const, color: "#8B5CF6" },
    { name: "Convention / Conférence", flowType: "SORTIE" as const, family: "EXCEPTIONNEL" as const, color: "#8B5CF6" },
    { name: "Voyage pastoral", flowType: "SORTIE" as const, family: "EXCEPTIONNEL" as const, color: "#8B5CF6" },
    { name: "Événement spécial", flowType: "SORTIE" as const, family: "EXCEPTIONNEL" as const, color: "#8B5CF6" },
    { name: "Autre exceptionnel", flowType: "SORTIE" as const, family: "EXCEPTIONNEL" as const, color: "#8B5CF6" },
  ];

  for (const cat of defaultCategories) {
    await prisma.financeCategory.upsert({
      where: { churchId_name_flowType: { churchId: church.id, name: cat.name, flowType: cat.flowType } },
      update: {},
      create: { ...cat, churchId: church.id, isDefault: true },
    });
  }
  console.log(`✅ ${defaultCategories.length} catégories financières par défaut créées`);

  console.log("🌿 Initialisation PRODUCTION terminée avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors de l'initialisation :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

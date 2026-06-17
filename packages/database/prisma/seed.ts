import { PrismaClient, Gender, MemberStatus, MemberGrade, MemberEchelon, GroupType, MeetingType } from "@prisma/client";

const prisma = new PrismaClient();

// Pre-hashed "password123" with bcrypt (salt rounds = 10)
const ADMIN_PASSWORD_HASH = "$2a$10$1UhmLpURk7J9BwRO.4NpZefUeVh9ydUq7IcvBZEPBTLud9RFXOcea";

async function main() {
  console.log("🌱 Début du peuplement de la base de données (Seeding)...");

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
    { name: "ADMIN", description: "Administrateur Général", perms: ["read:members", "write:members", "read:groups", "write:groups", "read:meetings", "write:meetings", "read:finances", "write:finances", "manage:roles"] },
    { name: "PASTEUR", description: "Pasteur Titulaire", perms: ["read:members", "read:groups", "read:meetings", "write:meetings"] },
    { name: "RESPONSABLE_GEM", description: "Responsable de GEM", perms: ["read:groups", "read:meetings", "write:meetings"] },
    { name: "TRESORIER", description: "Trésorier de l'église", perms: ["read:members", "read:finances", "write:finances"] },
    { name: "MEMBRE", description: "Fidèle membre de l'église", perms: [] }
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

  // 5. Supprimer les anciennes données de test pour éviter les doublons lors des re-seeds
  await prisma.meetingAttendee.deleteMany({});
  await prisma.memberGroup.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.member.deleteMany({});
  console.log("🧹 Anciennes données de test nettoyées");

  // 6. Création de Membres de test
  const membersData = [
    {
      firstName: "Marc",
      lastName: "KOFFI",
      gender: Gender.HOMME,
      status: MemberStatus.RESPONSABLE,
      grade: MemberGrade.SERVITEUR,
      echelon: MemberEchelon.C10,
      email: "marc.koffi@churchflow.com",
      phone: "+22997000001",
      address: "Calavi, Arconville",
    },
    {
      firstName: "Awa",
      lastName: "DIALLO",
      gender: Gender.FEMME,
      status: MemberStatus.MEMBRE,
      email: "awa.diallo@churchflow.com",
      phone: "+22997000002",
      address: "Calavi, Zogbadjè",
    },
    {
      firstName: "Jean-Pierre",
      lastName: "TANO",
      gender: Gender.HOMME,
      status: MemberStatus.RESPONSABLE,
      grade: MemberGrade.ASPIRANT,
      echelon: MemberEchelon.C5,
      email: "jp.tano@churchflow.com",
      phone: "+22997000003",
      address: "Calavi, Bidossessi",
    },
    {
      firstName: "Esther",
      lastName: "AMON",
      gender: Gender.FEMME,
      status: MemberStatus.SYMPATHISANT,
      email: "esther.amon@churchflow.com",
      phone: "+22997000004",
      address: "Calavi, Tankpè",
    },
  ];

  const seededMembers = [];
  for (const m of membersData) {
    const created = await prisma.member.create({
      data: {
        ...m,
        churchId: church.id,
      },
    });
    seededMembers.push(created);
  }
  console.log(`✅ ${seededMembers.length} membres de test créés`);

  // 7. Création de Groupes de test
  const groupsData = [
    { name: "Département de Louange", type: GroupType.DEPARTEMENT, description: "Chorale et musiciens de l'église" },
    { name: "GEM Victoire", type: GroupType.GEM, description: "Groupe d'Évangélisation et de Maison de Victoire" },
    { name: "GEM Paix", type: GroupType.GEM, description: "Groupe d'Évangélisation et de Maison de la Paix" },
  ];

  const seededGroups = [];
  for (const g of groupsData) {
    const created = await prisma.group.create({
      data: {
        ...g,
        churchId: church.id,
      },
    });
    seededGroups.push(created);
  }
  console.log(`✅ ${seededGroups.length} groupes de test créés`);

  // Assigner des membres aux groupes
  // Marc KOFFI leader du Département de Louange
  await prisma.memberGroup.create({
    data: {
      memberId: seededMembers[0].id,
      groupId: seededGroups[0].id,
      role: "Leader",
    },
  });
  // Awa DIALLO membre du Département de Louange
  await prisma.memberGroup.create({
    data: {
      memberId: seededMembers[1].id,
      groupId: seededGroups[0].id,
      role: "Membre",
    },
  });
  console.log("✅ Affiliations aux groupes créées");

  // 8. Création de Réunions de test
  const today = new Date();
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + ((7 - today.getDay()) % 7 || 7));
  nextSunday.setHours(8, 0, 0, 0);

  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + ((6 - today.getDay()) % 7 || 7));
  nextSaturday.setHours(16, 0, 0, 0);

  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + ((5 - today.getDay()) % 7 || 7));
  nextFriday.setHours(19, 0, 0, 0);

  const meetingsData = [
    {
      title: "Culte de Célébration",
      type: MeetingType.CULTE,
      date: nextSunday,
      location: "Temple Principal",
      description: "Culte dominical de célébration générale",
      tags: ["culte-dominical", "celebration", "louange"],
    },
    {
      title: "Répétition de la Chorale",
      type: MeetingType.REPETITION,
      date: nextSaturday,
      location: "Salle Polyvalente",
      description: "Préparation des cantiques pour le culte",
      tags: ["preparation", "musique", "chorale"],
    },
    {
      title: "Temps de Prière (Gethsémané)",
      type: MeetingType.TEMPS_DE_PRIERE,
      date: nextFriday,
      location: "En Ligne",
      description: "Prière d'intercession communautaire en ligne",
      tags: ["priere", "intercession", "ligne"],
    },
  ];

  for (const mt of meetingsData) {
    await prisma.meeting.create({
      data: {
        ...mt,
        churchId: church.id,
      },
    });
  }
  console.log("✅ 3 réunions de test créées");

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

  console.log("🌿 Seeding terminé avec succès avec toutes les données de test !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

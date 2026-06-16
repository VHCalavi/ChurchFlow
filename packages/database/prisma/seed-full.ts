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

    // Assigner les permissions au rôle (vider d'abord puis réinsérer pour un seed propre)
    await prisma.rolePermission.deleteMany({ where: { roleId: roleObj.id } });
    for (const pKey of r.perms) {
      const permObj = seededPermissions[pKey];
      if (permObj) {
        await prisma.rolePermission.create({
          data: {
            roleId: roleObj.id,
            permissionId: permObj.id
          }
        });
      }
    }
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
  const firstNamesM = ["Marc", "Jean", "Paul", "Pierre", "David", "Luc", "Mathieu", "Samuel", "Emmanuel", "Joseph", "Daniel", "Esaïe", "Jérémie", "Amos", "Josué", "Caleb", "Isaac", "Jacob", "Abraham", "Moïse", "Elie", "Elisée", "Gédéon", "Samson", "Salomon"];
  const firstNamesF = ["Awa", "Esther", "Marie", "Anne", "Sarah", "Rachel", "Léa", "Rebecca", "Ruth", "Naomi", "Débora", "Miriam", "Hannah", "Elisabeth", "Marthe", "Madeleine", "Chloe", "Priscille", "Lydie", "Dorcas", "Abigaïl", "Bérénice", "Eunice", "Lois", "Tabitha"];
  const lastNames = ["KOFFI", "DIALLO", "TANO", "AMON", "YAO", "KOUASSI", "KONAN", "N'GUESSAN", "KOUADIO", "TOURE", "TRAORE", "COULIBALY", "OUEDRAOGO", "SAWADOGO", "ILBOUDO", "ZONGO", "SANOU", "BAMBA", "CAMARA", "KEITA", "DIABY", "SYLLA", "CISSE", "DIOP", "FALL", "NDIAYE", "SOW", "TALL", "WADE", "GUEYE"];

  const seededMembers = [];
  console.log("⏳ Génération d'environ 50 membres...");
  for (let i = 0; i < 50; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? firstNamesM[Math.floor(Math.random() * firstNamesM.length)] : firstNamesF[Math.floor(Math.random() * firstNamesF.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    const statuses = [MemberStatus.MEMBRE, MemberStatus.MEMBRE, MemberStatus.MEMBRE, MemberStatus.RESPONSABLE, MemberStatus.SYMPATHISANT, MemberStatus.SYMPATHISANT];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let grade = null;
    let echelon = null;
    if (status === MemberStatus.RESPONSABLE || status === MemberStatus.MEMBRE) {
        const grades = [MemberGrade.SERVITEUR, MemberGrade.OUVRIER, MemberGrade.ASPIRANT];
        grade = grades[Math.floor(Math.random() * grades.length)];
        const echelons = [MemberEchelon.C5, MemberEchelon.C10, MemberEchelon.C15];
        echelon = echelons[Math.floor(Math.random() * echelons.length)];
    }

    const created = await prisma.member.create({
      data: {
        firstName,
        lastName,
        gender: isMale ? Gender.HOMME : Gender.FEMME,
        status,
        grade,
        echelon,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@churchflow.com`,
        phone: `+22997${Math.floor(100000 + Math.random() * 900000)}`,
        address: ["Calavi, Arconville", "Calavi, Zogbadjè", "Calavi, Bidossessi", "Calavi, Tankpè", "Cotonou, Fidjrossè"][Math.floor(Math.random() * 5)],
        churchId: church.id,
        isActive: Math.random() > 0.1, // 10% inactifs
      },
    });
    seededMembers.push(created);
  }
  console.log(`✅ ${seededMembers.length} membres de test créés`);

  // 7. Création de Groupes de test
  const groupsData = [
    { name: "Département de Louange", type: GroupType.DEPARTEMENT, description: "Chorale et musiciens de l'église" },
    { name: "Département Accueil", type: GroupType.DEPARTEMENT, description: "Accueil et protocole" },
    { name: "Département Média", type: GroupType.DEPARTEMENT, description: "Son, vidéo et communication" },
    { name: "Département Enfants", type: GroupType.DEPARTEMENT, description: "École du dimanche" },
    { name: "GEM Victoire", type: GroupType.GEM, description: "GEM Quartier Arconville" },
    { name: "GEM Paix", type: GroupType.GEM, description: "GEM Quartier Zogbadjè" },
    { name: "GEM Amour", type: GroupType.GEM, description: "GEM Quartier Tankpè" },
    { name: "GEM Joie", type: GroupType.GEM, description: "GEM Quartier Bidossessi" },
    { name: "Tribu Juda", type: GroupType.TRIBU, description: "Tribu principale" },
    { name: "Tribu Lévi", type: GroupType.TRIBU, description: "Tribu des ouvriers" },
    { name: "Tribu Benjamin", type: GroupType.TRIBU, description: "Tribu des jeunes" },
    { name: "Tribu Joseph", type: GroupType.TRIBU, description: "Tribu des cadres" },
  ];

  const seededGroups = [];
  for (const g of groupsData) {
    const created = await prisma.group.create({
      data: {
        ...g,
        churchId: church.id,
        isActive: true
      },
    });
    seededGroups.push(created);
  }
  console.log(`✅ ${seededGroups.length} groupes/gem/tribus créés`);

  // Assigner des membres aux groupes
  console.log("⏳ Assignation des membres aux groupes...");
  for (const group of seededGroups) {
      // 1 Leader par groupe
      const leader = seededMembers[Math.floor(Math.random() * seededMembers.length)];
      await prisma.memberGroup.create({
          data: { memberId: leader.id, groupId: group.id, role: "Leader" }
      });

      // 3 à 8 membres par groupe
      const numMembers = 3 + Math.floor(Math.random() * 6);
      for(let i=0; i<numMembers; i++) {
          const member = seededMembers[Math.floor(Math.random() * seededMembers.length)];
          // Eviter les doublons simples (peut échouer silencieusement si contrainte unique, on ignore l'erreur)
          try {
            await prisma.memberGroup.create({
                data: { memberId: member.id, groupId: group.id, role: "Membre" }
            });
          } catch(e) {}
      }
  }
  console.log("✅ Affiliations aux groupes créées");

  // 8. Création de Réunions de test
  const meetingsData = [];
  const today = new Date();
  
  // Générer 25 réunions passées (sur les 3 derniers mois)
  for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const mDate = new Date(today);
      mDate.setDate(today.getDate() - daysAgo);
      
      // Assigner des types aléatoires
      const types = [MeetingType.CULTE, MeetingType.CULTE, MeetingType.CULTE, MeetingType.REPETITION, MeetingType.TEMPS_DE_PRIERE, MeetingType.AGAPE, MeetingType.AUTRE];
      const type = types[Math.floor(Math.random() * types.length)];
      
      let title = "Rencontre";
      let location = "Temple Principal";
      if (type === MeetingType.CULTE) { title = "Culte de Célébration"; mDate.setHours(8,0,0,0); }
      if (type === MeetingType.REPETITION) { title = "Répétition Chorale"; location = "Salle Polyvalente"; mDate.setHours(16,0,0,0); }
      if (type === MeetingType.TEMPS_DE_PRIERE) { title = "Gethsémané"; location = "En ligne"; mDate.setHours(19,0,0,0); }
      if (type === MeetingType.AGAPE) { title = "Agape des ouvriers"; location = "Espace Détente"; mDate.setHours(14,0,0,0); }

      meetingsData.push({
          title, type, date: mDate, location, 
          description: `Rencontre générée (${type})`,
          tags: ["historique"],
          churchId: church.id,
      });
  }

  // Générer 5 réunions futures
  for (let i = 0; i < 5; i++) {
      const daysAhead = Math.floor(Math.random() * 30) + 1;
      const mDate = new Date(today);
      mDate.setDate(today.getDate() + daysAhead);
      const type = i % 2 === 0 ? MeetingType.CULTE : MeetingType.TEMPS_DE_PRIERE;
      meetingsData.push({
          title: type === MeetingType.CULTE ? "Culte à venir" : "Temps de Prière",
          type, date: mDate, location: "Temple Principal",
          description: "Rencontre programmée",
          tags: ["futur"],
          churchId: church.id,
      });
  }

  const seededMeetings = [];
  for (const mt of meetingsData) {
    const created = await prisma.meeting.create({ data: mt });
    seededMeetings.push(created);
  }
  console.log(`✅ ${seededMeetings.length} réunions créées (25 passées, 5 futures)`);

  // 9. Générer des présences (émargement) pour les réunions passées
  console.log("⏳ Génération des présences (émargement)...");
  for (const meeting of seededMeetings) {
      if (meeting.date < today) {
          // Présence aléatoire : entre 40% et 90% des membres actifs
          const attendanceRate = 0.4 + (Math.random() * 0.5);
          for (const member of seededMembers) {
              if (member.isActive && Math.random() < attendanceRate) {
                  await prisma.meetingAttendee.create({
                      data: {
                          meetingId: meeting.id,
                          memberId: member.id,
                          isPresent: true,
                      }
                  });
              } else if (member.isActive && Math.random() > 0.8) {
                  // Quelques absents excusés (20% des restants)
                  await prisma.meetingAttendee.create({
                    data: {
                        meetingId: meeting.id,
                        memberId: member.id,
                        isPresent: false,
                        notes: "Raison de santé"
                    }
                });
              }
          }
      }
  }
  console.log("✅ Présences générées pour enrichir les statistiques");

  console.log("🌿 Seeding terminé avec succès avec un grand volume de données !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

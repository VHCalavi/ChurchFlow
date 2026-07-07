const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const familyRelations = await prisma.familyRelation.findMany();
  console.log("Family relations:", familyRelations.length);
  console.log(familyRelations.slice(0, 2));

  const memberGroups = await prisma.memberGroup.findMany();
  console.log("Member groups:", memberGroups.length);

  const memberGems = await prisma.gemMember.findMany();
  console.log("Member gems:", memberGems.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());

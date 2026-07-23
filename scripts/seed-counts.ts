import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const counts = {
    projectStates: await prisma.projectState.count(),
    roles: await prisma.role.count(),
    permissions: await prisma.permission.count(),
    rolePermissions: await prisma.rolePermission.count(),
    provincesOperational: await prisma.province.count({
      where: { isOperational: true },
    }),
    workTypologies: await prisma.workTypology.count(),
    promptTemplates: await prisma.promptTemplate.count(),
    organizationProfiles: await prisma.organizationProfile.count(),
    contactChannels: await prisma.contactChannel.count(),
    calculatorRules: await prisma.calculatorRule.count(),
    aiBudgetGlobal: await prisma.aiBudgetConfig.count({
      where: { billingPeriod: null },
    }),
    initialStates: await prisma.projectState.count({
      where: { isInitial: true },
    }),
  };

  console.log(JSON.stringify(counts, null, 2));
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });

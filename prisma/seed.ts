import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { key: "pro" },
    update: { monthlyCents: 4900 },
    create: {
      key: "pro",
      name: "Pro",
      monthlyCents: 4900,
      description: "Single price plan for individuals and teams",
      features: {
        unlimitedPosts: true,
        teamMembers: "unlimited",
        customDomain: true,
        aiAssist: true,
        analytics: true
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

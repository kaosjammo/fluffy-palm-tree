import { PrismaClient, PlanTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "demo@snapframe.app" },
    update: {},
    create: {
      email: "demo@snapframe.app",
      supabaseUserId: "demo-supabase-id",
      plan: PlanTier.FREE,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

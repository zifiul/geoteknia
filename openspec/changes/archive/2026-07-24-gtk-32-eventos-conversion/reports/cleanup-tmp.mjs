import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const r = await db.conversionEvent.deleteMany({
  where: { sessionId: { in: ["gtk32-curl-happy","gtk32-curl-batch","gtk32-curl-beacon","gtk32-curl-rl"] } },
});
console.log("deleted", r.count);
await db.$disconnect();

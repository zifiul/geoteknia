import { defineConfig } from "prisma/config";

export default defineConfig({
  migrations: {
    seed: "pnpm exec tsx prisma/seed.ts",
  },
});

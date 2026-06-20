import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/env";

export default defineConfig({
  out: "./src/migrations",
  schema: "./src/schemas/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL
  },
  strict: true,
  verbose: true
});

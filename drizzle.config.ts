import { defineConfig } from "drizzle-kit";
import env from "./api/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./api/db/schema.ts",
  out: "./api/db/drizzle",
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
});

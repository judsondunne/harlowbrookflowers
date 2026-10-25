import { defineConfig } from "drizzle-kit";
import { databaseEnv } from "./src/server/db/env";

const { url, authToken } = databaseEnv();

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url,
    authToken,
  },
});

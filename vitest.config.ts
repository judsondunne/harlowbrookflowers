import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";
import { defineConfig } from "vitest/config";

const testDbUrl = `file:${path.join(tmpdir(), `hb-test-default-${process.pid}.db`)}`;
process.env.HB_TEST_DB_URL = testDbUrl;

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/helpers/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // The app's default connection must never point at the development database during tests.
    env: {
      DATABASE_URL: testDbUrl,
      NODE_ENV: "test",
    },
    globalSetup: ["./tests/helpers/global-setup.ts"],
    fileParallelism: false,
    testTimeout: 20000,
  },
});

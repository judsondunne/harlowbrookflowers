import { migrate } from "drizzle-orm/libsql/migrator";
import { scriptDb } from "./db";

const { db, client, url } = scriptDb();
await migrate(db, { migrationsFolder: "./drizzle" });
console.log(`✓ Migrations applied to ${url.replace(/\?.*$/, "")}`);
client.close();

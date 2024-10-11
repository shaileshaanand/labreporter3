import { migrate as nodePgMigrate } from "drizzle-orm/node-postgres/migrator";
import { migrate as pgLiteMigrate } from "drizzle-orm/pglite/migrator";
// import type { NodePgDatabase } from "../utils/db";
import type * as schema from "../db/schema";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

const migrateDb = (
  db: NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>,
) => {
  if (db instanceof NodePgDatabase) {
    return nodePgMigrate(db, {
      migrationsFolder: "api/db/drizzle",
    });
  }
  return pgLiteMigrate(db, {
    migrationsFolder: "api/db/drizzle",
  });
};

export default migrateDb;

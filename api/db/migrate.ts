import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { NodePgDatabase } from "../utils/db";

const migrateDb = (db: NodePgDatabase) => {
  return migrate(db, {
    migrationsFolder: "api/db/drizzle",
  });
};

export default migrateDb;

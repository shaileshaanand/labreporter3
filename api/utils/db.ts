import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import env from "../env";

const dbFactory = () => {
  console.log("DB Factory called");

  const pool = new Pool({
    connectionString: env.POSTGRES_URL,
  });
  return drizzle(pool, { schema });
};

const db = dbFactory();

export default db;

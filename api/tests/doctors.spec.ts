import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { faker } from "@faker-js/faker";
import app from "../app";
import { generatePhoneNumber } from "./utils";
import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "../db/schema";
import migrateDb from "../db/migrate";
import { eq } from "drizzle-orm";

let db: PgliteDatabase<typeof schema>;
let dbClient: PGlite;

const api = treaty(app).api;

describe("Doctor Tests", () => {
  beforeEach(async () => {
    dbClient = new PGlite();
    db = drizzle(dbClient);
    await migrateDb(db);
    mock.module("../utils/db.ts", () => {
      return { default: db };
    });
  });

  afterEach(async () => {
    await dbClient.close();
  });

  it("Should create a doctor", async () => {
    const payload = {
      name: faker.person.fullName(),
      phone: generatePhoneNumber(),
      email: faker.internet.email(),
    };
    const response = await api.doctors.index.post(payload);

    expect(response.status).toBe(201);
    if (response.error) {
      throw response.error;
    }
    const doctorsInDb = await db
      .select()
      .from(schema.doctors)
      .where(eq(schema.doctors.name, payload.name));

    expect(doctorsInDb).toHaveLength(1);
    const [createdDoctor] = doctorsInDb;
    expect(createdDoctor.email).toBe(payload.email);
    expect(createdDoctor.phone).toBe(payload.phone);
    expect(createdDoctor.name).toBe(payload.name);
    expect(createdDoctor.deleted).toBe(false);
  });
  it("Should get all doctors", async () => {
    const response = await api.doctors.index.post({
      name: faker.person.fullName(),
      phone: generatePhoneNumber(),
      email: faker.internet.email(),
    });
    if (response.error) {
      throw response.error;
    }
    response.data;
  });
});

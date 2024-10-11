import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { treaty } from "@elysiajs/eden";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { type PgliteDatabase, drizzle } from "drizzle-orm/pglite";
import { SignJWT } from "jose";
import app from "../app";
import migrateDb from "../db/migrate";
import * as schema from "../db/schema";
import env from "../env";
import { doctorFactory } from "./factories";
import { generatePhoneNumber } from "./utils";

let db: PgliteDatabase<typeof schema>;
let dbClient: PGlite;

const api = treaty(app).api;

const authHeader = `Bearer ${await new SignJWT({ id: 1 })
  .setProtectedHeader({ alg: "HS256" })
  .sign(new TextEncoder().encode(env.JWT_SECRET))}`;

describe("Doctor Tests", () => {
  beforeEach(async () => {
    dbClient = new PGlite();
    db = drizzle(dbClient, { schema });
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
    const response = await api.doctors.index.post(payload, {
      headers: {
        Authorization: authHeader,
      },
    });

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
    const doctorResults = await Promise.all([
      doctorFactory(db),
      doctorFactory(db),
      doctorFactory(db),
    ]);

    const response = await api.doctors.index.get({
      headers: { Authorization: authHeader },
    });

    expect(response.status).toBe(200);
    if (response.error) {
      throw response.error;
    }
    const { data } = response;

    for (const doctor of doctorResults) {
      const foundDoctor = data.find((d) => {
        return d.id === doctor.id;
      });
      if (!foundDoctor) {
        throw new Error("Doctor not found");
      }
      expect(foundDoctor.name).toBe(doctor.name);
      expect(foundDoctor.email).toBe(doctor.email);
      expect(foundDoctor.phone).toBe(doctor.phone);
    }
  });

  it("Should not get deleted doctors", async () => {
    //create 3 doctors, 1 of them deleted
    const doctors = await Promise.all([doctorFactory(db), doctorFactory(db)]);
    const deletedDoctor = await doctorFactory(db, { deleted: true });
    const response = await api.doctors.index.get({
      headers: { Authorization: authHeader },
    });
    expect(response.status).toBe(200);
    if (response.error) {
      throw response.error;
    }
    const { data } = response;
    expect(data.length).toBe(doctors.length);
    for (const doctor of doctors) {
      const foundDoctor = data.find((d) => {
        return d.id === doctor.id;
      });
      if (!foundDoctor) {
        throw new Error("doctor not found");
      }
      expect(foundDoctor.name).toBe(doctor.name);
      expect(foundDoctor.email).toBe(doctor.email);
      expect(foundDoctor.phone).toBe(doctor.phone);
    }
  });

  it("Should not get doctors if unauthorized", async () => {
    const doctor = await doctorFactory(db, { deleted: true });
    const response = await api.doctors.index.get();
    expect(response.status).toBe(401);
    expect(response.error).toBeDefined();
  });

  it("Should get a doctor", async () => {
    const doctor = await doctorFactory(db);
    const response = await api.doctors({ id: doctor.id }).get({
      headers: { Authorization: authHeader },
    });
    expect(response.status).toBe(200);
    if (response.error) {
      throw response.error;
    }
    const { data } = response;
    expect(data.name).toBe(doctor.name);
    expect(data.email).toBe(doctor.email);
    expect(data.phone).toBe(doctor.phone);
  });

  it("Should not get a deleted doctor", async () => {
    const doctor = await doctorFactory(db, { deleted: true });
    const response = await api.doctors({ id: doctor.id }).get({
      headers: { Authorization: authHeader },
    });
    expect(response.status).toBe(404);
  });

  it("Should not get a doctor if unauthorized", async () => {
    const doctor = await doctorFactory(db);
    const response = await api.doctors({ id: doctor.id }).get();
    expect(response.status).toBe(401);
  });
});

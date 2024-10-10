import { describe, expect, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { faker } from "@faker-js/faker";
import app from "../app";
import migrateDb from "../db/migrate";
import db from "../utils/db";
import { generatePhoneNumber } from "./utils";

const api = treaty(app).api;

describe("Doctor Tests", () => {
  it("Should create a doctor", async () => {
    const payload = {
      name: faker.person.fullName(),
      phone: generatePhoneNumber(),
      email: faker.internet.email(),
    };
    const response = await api.doctors.index.post(payload);

    expect(response.status).toBe(201);
  });
});

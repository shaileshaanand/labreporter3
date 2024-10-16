import { faker } from "@faker-js/faker";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "../db/schema";
import { hashPassword } from "../utils/passwords";
import { formatDate, generatePhoneNumber } from "./utils";

export const doctorFactory = async (
  db: NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>,
  {
    name = null,
    email = null,
    phone = null,
    deleted = false,
  }: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    deleted?: boolean;
  } = {
    name: null,
    email: null,
    phone: null,
    deleted: false,
  },
) => {
  const [doctor] = await db
    .insert(schema.doctors)
    .values({
      name: name ?? faker.person.fullName(),
      phone: phone ?? generatePhoneNumber(),
      email: email ?? faker.internet.email(),
      deleted,
    })
    .returning();

  return doctor as Exclude<typeof doctor, undefined>;
};

export const userFactory = async (
  db: NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>,
  {
    firstName = null,
    lastName = null,
    username = null,
    password,
    deleted = false,
  }: {
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    password: string;
    deleted?: boolean;
  },
) => {
  const [user] = await db
    .insert(schema.users)
    .values({
      firstName: firstName ?? faker.person.firstName(),
      lastName: lastName ?? faker.person.lastName(),
      username: username ?? faker.internet.userName(),
      passwordHash: await hashPassword(password),
      deleted,
    })
    .returning();

  return user as Exclude<typeof user, undefined>;
};

export const patientFactory = async (
  db: NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>,
  {
    name = null,
    email = null,
    phone = null,
    age = null,
    gender = null,
    deleted = false,
  }: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    age?: number | null;
    gender?: "male" | "female" | null;
    deleted?: boolean;
  } = {
    name: null,
    email: null,
    phone: null,
    age: null,
    gender: null,
    deleted: false,
  },
) => {
  const [patient] = await db
    .insert(schema.patients)
    .values({
      name: name ?? faker.person.fullName(),
      phone: phone ?? generatePhoneNumber(),
      email: email ?? faker.internet.email(),
      age: age ?? faker.number.int({ min: 0, max: 120 }),
      gender: gender ?? faker.helpers.arrayElement(["male", "female"]),
      deleted,
    })
    .returning();
  return patient as Exclude<typeof patient, undefined>;
};

export const templateFactory = async (
  db: NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>,
  {
    name = null,
    content = null,
    deleted = false,
  }: {
    name?: string | null;
    content?: string | null;
    deleted?: boolean;
  } = {
    name: null,
    deleted: false,
  },
) => {
  const [template] = await db
    .insert(schema.templates)
    .values({
      name: name ?? faker.lorem.sentence(),
      content: content ?? faker.lorem.paragraph(),
      deleted,
    })
    .returning();

  return template as Exclude<typeof template, undefined>;
};

export const USGReportFactory = async (
  db: NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>,
  {
    patientId = null,
    referrerId = null,
    partOfScan = null,
    findings = null,
    date = null,
    deleted = false,
  }: {
    patientId?: number | null;
    referrerId?: number | null;
    partOfScan?: string | null;
    findings?: string | null;
    date?: Date | null;
    deleted?: boolean;
  } = {
    patientId: null,
    referrerId: null,
    partOfScan: null,
    findings: null,
    date: null,
    deleted: false,
  },
) => {
  const [USGReport] = await db
    .insert(schema.USGReports)
    .values({
      patientId: patientId ?? (await patientFactory(db)).id,
      referrerId: referrerId ?? (await doctorFactory(db)).id,
      partOfScan: partOfScan ?? faker.lorem.sentence(),
      findings: findings ?? faker.lorem.paragraph(),
      date: formatDate(date ?? faker.date.recent({ days: 30 })),
      deleted,
    })
    .returning();

  return USGReport;
};

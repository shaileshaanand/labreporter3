import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";

export const doctors = pgTable("doctors", (t) => {
  return {
    id: t.serial("id").primaryKey().notNull(),
    name: t.text("name").notNull(),
    phone: t.char("phone", { length: 10 }),
    email: t.text("email"),
    deleted: t.boolean("deleted").default(false).notNull(),
    createdAt: t
      .timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: t
      .timestamp("updated_at", { mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  };
});

export const genderEnum = pgEnum("gender", ["male", "female"]);

export const patients = pgTable(
  "patients",
  (t) => {
    return {
      id: t.serial("id").primaryKey().notNull(),
      name: t.text("name").notNull(),
      phone: t.char("phone", { length: 10 }),
      email: t.text("email"),
      age: t.smallint("age"),
      gender: genderEnum().notNull(),
      deleted: t.boolean("deleted").default(false).notNull(),
      createdAt: t
        .timestamp("created_at", { mode: "date" })
        .defaultNow()
        .notNull(),
      updatedAt: t
        .timestamp("updated_at", { mode: "date" })
        .$onUpdate(() => new Date())
        .notNull(),
    };
  },
  (table) => ({
    idx_patients_deleted_createdat_id: index(
      "idx_patients_deleted_createdat_id",
    ).on(table.deleted, table.createdAt, table.id),
  }),
);

export const users = pgTable("users", (t) => {
  return {
    id: t.serial("id").primaryKey().notNull(),
    firstName: t.text("first_name").notNull(),
    lastName: t.text("last_name"),
    username: t.text("username").notNull().unique(),
    passwordHash: t.text("password_hash").notNull(),
    deleted: t.boolean("deleted").default(false).notNull(),
    createdAt: t
      .timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: t
      .timestamp("updated_at", { mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  };
});

export const templates = pgTable("templates", (t) => {
  return {
    id: t.serial("id").primaryKey().notNull(),
    name: t.text("name").notNull(),
    content: t.text("content").notNull(),
    deleted: t.boolean("deleted").default(false).notNull(),
    createdAt: t
      .timestamp("created_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: t
      .timestamp("updated_at", { mode: "date" })
      .$onUpdate(() => new Date())
      .notNull(),
  };
});

export const USGReports = pgTable(
  "USGReports",
  (t) => {
    return {
      id: t.serial("id").primaryKey().notNull(),
      patientId: t
        .integer("patientId")
        .references(() => patients.id)
        .notNull(),
      referrerId: t
        .integer("referrerId")
        .references(() => doctors.id)
        .notNull(),
      partOfScan: t.text("partOfScan").notNull(),
      findings: t.text("findings").notNull(),
      date: t.timestamp("date").notNull(),
      deleted: t.boolean("deleted").default(false),
      createdAt: t.timestamp("createdAt").defaultNow().notNull(),
      updatedAt: t
        .timestamp("updatedAt")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
    };
  },
  (table) => ({
    idx_usgreports_deleted_createdat_id: index(
      "idx_usgreports_deleted_createdat_id",
    ).on(table.deleted, table.createdAt, table.id),
  }),
);

export const patientsRelations = relations(patients, ({ many }) => ({
  USGReports: many(USGReports),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  USGReports: many(USGReports),
}));

export const USGReportsRelations = relations(USGReports, ({ one }) => ({
  patient: one(patients, {
    fields: [USGReports.patientId],
    references: [patients.id],
  }),
  referrer: one(doctors, {
    fields: [USGReports.referrerId],
    references: [doctors.id],
  }),
}));

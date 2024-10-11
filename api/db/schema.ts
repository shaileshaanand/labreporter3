import { pgEnum, pgTable } from "drizzle-orm/pg-core";

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

export const patients = pgTable("patients", (t) => {
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
});

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

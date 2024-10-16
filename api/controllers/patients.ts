import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../config/constants";
import { patients } from "../db/schema";
import { NotFoundError } from "../errors";
import context from "../setup";
import db from "../utils/db";

enum Gender {
  male = "male",
  female = "female",
}
const patientValidator = z.object({
  name: z.string().min(3).max(255),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional(),
  email: z.string().email().optional(),
  age: z.number().min(0).max(120).optional(),
  gender: z.enum(["male", "female"]),
});

const patientsController = new Elysia({ prefix: "/patient" })
  .use(context)
  .guard({ ensureLoggedIn: true })
  .model({
    patient: t.Object({
      name: t.String(),
      phone: t.Optional(t.String()),
      email: t.Optional(t.String()),
      age: t.Optional(t.Number()),
      gender: t.Enum(Gender),
    }),
  })
  .get(
    "/",
    async ({ query }) => {
      const limit = query.limit ?? DEFAULT_PAGE_SIZE;
      const page = query.page ?? 1;

      const validator = z.object({
        phone: z
          .string()
          .regex(/^[6-9]\d{9}$/)
          .optional(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        query: z.string().optional(),
        limit: z.number().min(1).max(MAX_PAGE_SIZE).optional(),
        page: z.number().min(1).optional(),
      });
      const queryData = validator.parse(query);

      const filter = and(
        queryData.name
          ? ilike(patients.name, `%${queryData.name}%`)
          : undefined,
        queryData.phone ? eq(patients.phone, queryData.phone) : undefined,
        queryData.email ? eq(patients.email, queryData.email) : undefined,
        queryData.query
          ? or(
              ilike(patients.name, `%${queryData.query}%`),
              ilike(patients.phone, `%${queryData.query}%`),
              ilike(patients.email, `%${queryData.query}%`),
            )
          : undefined,
        eq(patients.deleted, false),
      );

      const patientsList = await db.query.patients.findMany({
        columns: {
          deleted: false,
        },
        where: filter,
        offset: (page - 1) * limit,
        limit: limit + 1,
        orderBy: [desc(patients.createdAt), desc(patients.id)],
      });

      const { total } = (
        await db.select({ total: count() }).from(patients).where(filter)
      )[0];

      const totalPages = Math.ceil(total / limit);

      let hasMore = false;
      if (patientsList.length > limit) {
        patientsList.pop();
        hasMore = true;
      }

      return {
        data: patientsList,
        hasMore,
        page,
        limit,
        total,
        totalPages,
      };
    },
    {
      query: t.Optional(
        t.Object({
          phone: t.Optional(t.String()),
          name: t.Optional(t.String()),
          email: t.Optional(t.String()),
          query: t.Optional(t.String()),
          limit: t.Optional(t.Number()),
          page: t.Optional(t.Number()),
        }),
      ),
    },
  )
  .post(
    "/",
    async ({ body, set }) => {
      const data = patientValidator.parse(body);
      const [createdPatient] = await db
        .insert(patients)
        .values(data)
        .returning();
      const { deleted: _, ...patient } = createdPatient;
      set.status = 201;
      return patient;
    },
    {
      body: "patient",
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const patient = await db.query.patients.findFirst({
        where: and(eq(patients.id, id), eq(patients.deleted, false)),
        columns: {
          deleted: false,
        },
      });

      if (!patient) {
        throw new NotFoundError(`Patient with id: ${id} not found`);
      }

      return patient;
    },
    {
      params: "idParam",
    },
  )
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const data = patientValidator.parse(body);
      const [updatedPatient] = await db
        .update(patients)
        .set(data)
        .where(and(eq(patients.id, id), eq(patients.deleted, false)))
        .returning();
      if (updatedPatient === undefined) {
        throw new NotFoundError(`Patient with id: ${id} not found`);
      }
      const { deleted: _, ...updatedPatientFiltered } = updatedPatient;
      return updatedPatientFiltered;
    },
    {
      body: "patient",
      params: "idParam",
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      const [deletedPatient] = await db
        .update(patients)
        .set({ deleted: true })
        .where(and(eq(patients.id, id), eq(patients.deleted, false)))
        .returning();
      if (deletedPatient) {
        set.status = 204;
        return;
      }
      throw new NotFoundError(`Patient with id: ${id} not found`);
    },
    {
      params: "idParam",
    },
  );

export default patientsController;

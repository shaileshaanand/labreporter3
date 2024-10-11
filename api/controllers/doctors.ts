import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { z } from "zod";
import { doctors } from "../db/schema";
import { DoctorSelectSchema } from "../db/types";
import { NotFoundError } from "../errors";
import context from "../setup";
import db from "../utils/db";

const doctorValidator = z.object({
  name: z.string().min(3),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional(),
  email: z.string().email().optional(),
});

const doctorsController = new Elysia({ prefix: "/doctors" })
  .use(context)
  .guard({ ensureLoggedIn: true })
  .model({
    doctorInsertPayload: t.Object({
      name: t.String(),
      phone: t.Optional(t.String()),
      email: t.Optional(t.String()),
    }),
  })
  .get("/", async () =>
    db.query.doctors.findMany({
      columns: {
        deleted: false,
      },
      where: eq(doctors.deleted, false),
    }),
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const doctor = await db.query.doctors.findFirst({
        where: and(eq(doctors.deleted, false), eq(doctors.id, id)),
        columns: {
          deleted: false,
        },
      });
      if (!doctor) {
        throw new NotFoundError(`Doctor with id ${id} not found`);
      }
      return doctor;
    },
    {
      params: "idParam",
    },
  )
  .post(
    "/",
    async ({ body, set }) => {
      const payload = doctorValidator.parse(body);
      const [doctor] = await db.insert(doctors).values(payload).returning();
      set.status = 201;
      const { deleted, ...doctorResponse } = doctor;
      return doctorResponse;
    },
    {
      body: "doctorInsertPayload",
    },
  )
  .put(
    "/:id",
    async ({ params: { id }, body, error }) => {
      const payload = doctorValidator.parse(body);
      const [doctor] = await db
        .update(doctors)
        .set(payload)
        .where(eq(doctors.id, id))
        .returning();
      if (!doctor) {
        throw new NotFoundError(`Doctor with id ${id} not found`);
      }
      const { deleted, ...doctorResponse } = doctor;
      return doctorResponse;
    },
    {
      params: "idParam",
      body: "doctorInsertPayload",
    },
  )
  .delete(
    "/:id",
    ({ params: { id }, set }) => {
      const doctor = db.delete(doctors).where(eq(doctors.id, id)).returning();
      if (!doctor) {
        throw new NotFoundError(`Doctor with id ${id} not found`);
      }
      set.status = 204;
      return;
    },
    {
      params: "idParam",
    },
  );

export default doctorsController;

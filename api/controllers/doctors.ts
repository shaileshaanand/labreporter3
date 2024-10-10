import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { z } from "zod";
import { doctors } from "../db/schema";
import { DoctorSelectSchema } from "../db/types";
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
  .model({
    doctorInsertPayload: t.Object({
      name: t.String(),
      phone: t.Optional(t.String()),
      email: t.Optional(t.String()),
    }),
  })
  .get("/", async () => db.query.doctors.findMany())
  .get(
    "/:id",
    async ({ params: { id }, error }) => {
      const doctor = await db.query.doctors.findFirst({
        where: eq(doctors.id, id),
      });
      if (!doctor) {
        return error(404, "Not found");
      }
      return doctor;
    },
    {
      params: "idParam",
      response: {
        200: DoctorSelectSchema,
        404: t.String(),
      },
    },
  )
  .post(
    "/",
    async ({ body, set }) => {
      const payload = doctorValidator.parse(body);
      const [doctor] = await db.insert(doctors).values(payload).returning();
      console.log("POST");
      set.status = 201;
      return doctor;
    },
    {
      body: "doctorInsertPayload",
      response: {
        201: DoctorSelectSchema,
      },
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
        return error(404, "Not Found");
      }
      return doctor;
    },
    {
      params: "idParam",
      body: "doctorInsertPayload",
      response: {
        201: DoctorSelectSchema,
        404: t.String(),
      },
    },
  )
  .delete(
    "/:id",
    ({ params: { id }, error, set }) => {
      const doctor = db.delete(doctors).where(eq(doctors.id, id)).returning();
      if (!doctor) {
        return error(404, "Not Found");
      }
      set.status = 204;
      return;
    },
    {
      params: "idParam",
    },
  );

export default doctorsController;

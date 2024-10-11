import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { ZodError } from "zod";
import doctorsController from "./controllers/doctors";
import patientsController from "./controllers/patients";
import { APIError } from "./errors";

const app = new Elysia({ prefix: "/api" })
  .use(swagger())
  .get("/hc", () => "OK")
  .onError(({ error, code, set }) => {
    if (error instanceof ZodError) {
      set.status = 400;
      return {
        errors: error.errors.map((e) => ({ message: e.message })),
      };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return { errors: [{ message: "Validation Error" }] };
    }
    if (error instanceof APIError) {
      set.status = error.status;
      return { errors: [{ message: error.message }] };
    }
    console.log(error);
  })
  .use(doctorsController)
  .use(patientsController);

export type Api = typeof app;

export default app;

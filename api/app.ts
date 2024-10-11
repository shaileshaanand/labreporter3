import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { ZodError } from "zod";
import authController from "./controllers/auth";
import doctorsController from "./controllers/doctors";
import patientsController from "./controllers/patients";
import templatesController from "./controllers/templates";
import usersContoller from "./controllers/users";
import { APIError } from "./errors";

const app = new Elysia()
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
  .group("/api", (api) => api.use(patientsController).use(doctorsController))
  .use(usersContoller)
  .use(templatesController)
  .use(authController);

export type Api = typeof app;

export default app;

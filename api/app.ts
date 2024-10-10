import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import doctorsController from "./controllers/doctors";

const app = new Elysia({ prefix: "/api" })
  .use(swagger())
  .get("/hc", () => "OKK")
  .use(doctorsController);

export type Api = typeof app;

export default app;

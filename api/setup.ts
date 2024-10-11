import Elysia, { t } from "elysia";
import { UnauthorizedError } from "./errors";
import jwt from "@elysiajs/jwt";
import env from "./env";

const context = new Elysia()
  .model({
    idParam: t.Object({ id: t.Number() }),
  })
  .use(
    jwt({
      secret: env.JWT_SECRET,
    }),
  )
  .macro(({ onBeforeHandle }) => {
    return {
      ensureLoggedIn: () => {
        onBeforeHandle(async ({ headers, jwt }) => {
          if (headers.authorization === undefined) {
            throw new UnauthorizedError("Unauthorized: Missing Headers");
          }
          const [prefix, token] = headers.authorization.split(" ");

          if (prefix !== "Bearer") {
            throw new UnauthorizedError("Unauthorized: Invalid Prefix");
          }

          const payload = await jwt.verify(token);
          if (!payload) {
            throw new UnauthorizedError("Unauthorized: Invalid Token");
          }
        });
      },
    };
  });

export default context;

import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import context from "../setup";
import db from "../utils/db";
import { users } from "../db/schema";
import { NotFoundError } from "../errors";

const usersContoller = new Elysia({ prefix: "/user" })
  .use(context)
  .guard({
    ensureLoggedIn: true,
  })
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const user = await db.query.users.findFirst({
        columns: {
          deleted: false,
          passwordHash: false,
        },
        where: and(eq(users.id, id), eq(users.deleted, false)),
      });
      if (user === undefined) {
        throw new NotFoundError(`User with id: ${id} not found`);
      }
      return user;
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  );

export default usersContoller;

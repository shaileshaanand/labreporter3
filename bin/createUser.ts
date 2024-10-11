import db from "../api/utils/db";

import { parseArgs } from "node:util";
import { users } from "../api/db/schema";
import { hashPassword } from "../api/utils/passwords";

const {
  values: { firstName, lastName, username, password },
} = parseArgs({
  options: {
    firstName: {
      type: "string",
      short: "f",
    },
    lastName: {
      type: "string",
      short: "l",
    },
    username: {
      type: "string",
      short: "u",
    },
    password: {
      type: "string",
      short: "p",
    },
  },
});

if (!firstName || !lastName || !username || !password) {
  console.log(
    "Usage: createUser -f <firstName> -l <lastName> -u <username> -p <password>",
  );
  process.exit(1);
}

console.log(
  await db
    .insert(users)
    .values({
      firstName,
      lastName,
      username,
      passwordHash: await hashPassword(password),
    })
    .returning(),
);

import { createSelectSchema } from "drizzle-typebox";
import { doctors } from "./schema";

export const DoctorSelectSchema = createSelectSchema(doctors);

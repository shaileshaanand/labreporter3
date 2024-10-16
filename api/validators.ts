import { z } from "zod";

export const doctorValidator = z.object({
  name: z.string().min(3),
  phone: z
    .string()
    .startsWith("")
    .regex(/^[6-9]\d{9}$/, "Must be a valid phone number")
    .optional(),
  email: z.string().email({ message: "Must be a valid email" }).optional(),
});

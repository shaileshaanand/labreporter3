import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const env = createEnv({
  server: {
    PORT: z.string(),
    POSTGRES_URL: z.string(),
  },
  runtimeEnv: process.env,
});

export default env;

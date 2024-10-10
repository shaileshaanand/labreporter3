import app from "./app";
import env from "./env";

app.listen(
  {
    port: env.PORT,
    hostname: "0.0.0.0",
  },
  () => console.log(`API running on http://0.0.0.0:${env.PORT}`),
);

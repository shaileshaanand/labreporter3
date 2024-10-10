import Elysia, { t } from "elysia";

const context = new Elysia().model({
  idParam: t.Object({ id: t.Number() }),
});

export default context;

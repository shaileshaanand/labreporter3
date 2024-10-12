import { and, count, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../config/constants";
import { USGReports } from "../db/schema";
import { BadRequestError, NotFoundError } from "../errors";
import context from "../setup";
import db from "../utils/db";
import { formatDate } from "../tests/utils";

const USGReportQueryFilters = {
  with: {
    patient: {
      columns: {
        deleted: false,
      },
    },
    referrer: {
      columns: {
        deleted: false,
      },
    },
  },
  // columns: {
  // deleted: false,
  //   patientId: false,
  //   referrerId: false,
  // },
};

const USGReportPayloadValidator = z
  .object({
    patient: z.number().min(1),
    referrer: z.number().min(1),
    partOfScan: z.string().min(3),
    findings: z.string().min(3),
    date: z.coerce.date(),
  })
  .transform(({ patient, referrer, ...rest }) => ({
    ...rest,
    patientId: patient,
    referrerId: referrer,
  }));

const USGReportsController = new Elysia({ prefix: "/usgreport" })
  .use(context)
  .guard({
    ensureLoggedIn: true,
  })
  .model({
    USGReport: t.Object({
      patient: t.Number(),
      referrer: t.Number(),
      partOfScan: t.String(),
      findings: t.String(),
      date: t.String(),
    }),
  })
  .get(
    "/",
    async ({ query }) => {
      const limit = query.limit ?? DEFAULT_PAGE_SIZE;
      const page = query.page ?? 1;

      const validator = z.object({
        patient: z.number().optional(),
        referrer: z.number().optional(),
        partOfScan: z.string().optional(),
        findings: z.string().optional(),
        date_before: z.coerce.date().optional(),
        date_after: z.coerce.date().optional(),
        limit: z.number().min(1).max(MAX_PAGE_SIZE).optional(),
        page: z.number().min(1).optional(),
      });
      const queryData = validator.parse(query);

      const filter = and(
        queryData.patient
          ? eq(USGReports.patientId, queryData.patient)
          : undefined,
        queryData.referrer
          ? eq(USGReports.referrerId, queryData.referrer)
          : undefined,
        queryData.partOfScan
          ? ilike(USGReports.partOfScan, `%${queryData.partOfScan}%`)
          : undefined,
        queryData.findings
          ? ilike(USGReports.findings, `%${queryData.findings}%`)
          : undefined,
        queryData.date_after
          ? gte(USGReports.date, formatDate(queryData.date_after))
          : undefined,
        queryData.date_before
          ? lte(USGReports.date, formatDate(queryData.date_before))
          : undefined,
        eq(USGReports.deleted, false),
      );

      const USGReportList = await db.query.USGReports.findMany({
        where: filter,
        orderBy: [desc(USGReports.createdAt), desc(USGReports.id)],
        offset: (page - 1) * limit,
        limit: limit + 1,
        ...USGReportQueryFilters,
      });

      const { total } = (
        await db.select({ total: count() }).from(USGReports).where(filter)
      )[0];

      const totalPages = Math.ceil(total / limit);

      let hasMore = false;
      if (USGReportList.length > limit) {
        USGReportList.pop();
        hasMore = true;
      }

      return {
        data: USGReportList,
        hasMore,
        page,
        limit,
        total,
        totalPages,
      };
    },
    {
      query: t.Optional(
        t.Object({
          patient: t.Optional(t.Numeric()),
          referrer: t.Optional(t.Numeric()),
          partOfScan: t.Optional(t.String()),
          findings: t.Optional(t.String()),
          date_before: t.Optional(t.String()),
          date_after: t.Optional(t.String()),
          limit: t.Optional(t.Numeric()),
          page: t.Optional(t.Numeric()),
        }),
      ),
    },
  )

  .post(
    "/",
    async ({ body, set }) => {
      const data = USGReportPayloadValidator.parse(body);

      // try {
      const [CreatedUSGReport] = await db
        .insert(USGReports)
        .values({ ...data, date: data.date.toISOString() })
        .returning();
      const USGReport = await db.query.USGReports.findFirst({
        where: eq(USGReports.id, CreatedUSGReport.id),
        with: {
          patient: {
            columns: {
              deleted: false,
            },
          },
          referrer: {
            columns: {
              deleted: false,
            },
          },
        },
        columns: {
          deleted: false,
          patientId: false,
          referrerId: false,
        },
      });

      if (!USGReport) {
        throw new BadRequestError("Could not create report");
      }

      set.status = 201;
      return USGReport;
      // } catch (err: any) {
      //   if (err.code && err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      //     throw new BadRequestError("Invalid referrer or patient");
      //   }
      // }
    },
    {
      body: "USGReport",
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const USGReport = await db.query.USGReports.findFirst({
        where: and(eq(USGReports.id, id), eq(USGReports.deleted, false)),
        with: {
          patient: {
            columns: {
              deleted: false,
            },
          },
          referrer: {
            columns: {
              deleted: false,
            },
          },
        },
        columns: {
          deleted: false,
          patientId: false,
          referrerId: false,
        },
      });
      if (!USGReport) {
        throw new NotFoundError(`USGReport with id ${id} not found`);
      }
      return USGReport;
    },
    {
      params: "idParam",
    },
  )
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const data = USGReportPayloadValidator.parse(body);

      await db
        .update(USGReports)
        .set({ ...data, date: data.date.toISOString() })
        .where(and(eq(USGReports.id, id), eq(USGReports.deleted, false)))
        .returning();

      const USGReport = await db.query.USGReports.findFirst({
        where: eq(USGReports.id, id),
        ...USGReportQueryFilters,
      });

      if (!USGReport) {
        throw new NotFoundError(`USGReport with id ${id} not found`);
      }
      return USGReport;
    },
    {
      params: "idParam",
      body: "USGReport",
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      const [USGReport] = await db
        .update(USGReports)
        .set({ deleted: true })
        .where(and(eq(USGReports.id, id), eq(USGReports.deleted, false)))
        .returning();
      if (!USGReport) {
        throw new NotFoundError(`USGReport with id ${id} not found`);
      }
      set.status = 204;
      const { deleted: _, ...report } = USGReport;
      return report;
    },
    {
      params: "idParam",
    },
  );

export default USGReportsController;

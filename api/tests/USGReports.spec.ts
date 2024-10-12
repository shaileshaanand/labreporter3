// import fireRequest from "./fireRequest";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { treaty } from "@elysiajs/eden";
import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { type PgliteDatabase, drizzle } from "drizzle-orm/pglite";
import { SignJWT } from "jose";
import app from "../app";
import migrateDb from "../db/migrate";
import * as schema from "../db/schema";
import env from "../env";
import {
  USGReportFactory,
  doctorFactory,
  patientFactory,
  userFactory,
} from "./factories";
import { formatDate } from "./utils";

let db: PgliteDatabase<typeof schema>;
let dbClient: PGlite;

const api = treaty(app).api;

const authHeader = `Bearer ${await new SignJWT({ id: 1 })
  .setProtectedHeader({ alg: "HS256" })
  .sign(new TextEncoder().encode(env.JWT_SECRET))}`;

describe("Doctor Tests", () => {
  beforeEach(async () => {
    dbClient = new PGlite();
    db = drizzle(dbClient, { schema });
    await migrateDb(db);
    mock.module("../utils/db.ts", () => {
      return { default: db };
    });
  });

  afterEach(async () => {
    await dbClient.close();
  });

  it("Should create a new USGReport", async () => {
    const [patient, referrer] = await Promise.all([
      patientFactory(db),
      doctorFactory(db),
    ]);

    const USGReport = {
      patient: patient.id,
      referrer: referrer.id,
      partOfScan: faker.lorem.sentence(),
      findings: faker.lorem.paragraph(),
      date: formatDate(faker.date.recent({ days: 14 })),
    };

    const response = await api.usgreport.index.post(USGReport, {
      headers: { Authorization: authHeader },
    });

    expect(response.status).toBe(201);
    if (response.error) {
      throw new Error("Error");
    }
    const { data } = response;
    expect(data.id).toBeDefined();
    const createdUSGReport = await db.query.USGReports.findFirst({
      where: eq(schema.USGReports.id, data.id),
    });
    if (!createdUSGReport) {
      throw new Error("USGReport not found");
    }

    expect(data.id).toBe(createdUSGReport.id);

    expect(data.patient.id).toBe(patient.id);
    expect(data.patient.name).toBe(patient.name);
    expect(data.patient.phone).toBe(patient.phone);
    expect(data.patient.email).toBe(patient.email);
    expect(data.patient.age).toBe(patient.age);
    expect(data.patient.gender).toBe(patient.gender);

    expect(data.referrer.id).toBe(referrer.id);
    expect(data.referrer.name).toBe(referrer.name);
    expect(data.referrer.phone).toBe(referrer.phone);
    expect(data.referrer.email).toBe(referrer.email);

    expect(data.partOfScan).toBe(USGReport.partOfScan);
    expect(data.findings).toBe(USGReport.findings);
    expect(data.date).toEqual(USGReport.date);

    expect(createdUSGReport.patientId).toBe(USGReport.patient);
    expect(createdUSGReport.referrerId).toBe(USGReport.referrer);
    expect(createdUSGReport.partOfScan).toBe(USGReport.partOfScan);
    expect(createdUSGReport.findings).toBe(USGReport.findings);
    expect(createdUSGReport.date).toEqual(USGReport.date);
    expect(createdUSGReport.deleted).toBe(false);
  });

  it("Should not create a new USGReport if unauthorized", async () => {
    const [patient, referrer] = await Promise.all([
      patientFactory(db),
      doctorFactory(db),
    ]);

    const USGReport = {
      patient: patient.id,
      referrer: referrer.id,
      partOfScan: faker.lorem.sentence(),
      findings: faker.lorem.paragraph(),
      date: formatDate(faker.date.recent({ days: 14 })),
    };

    const response = await api.usgreport.index.post(USGReport);

    expect(response.status).toBe(401);
    if (!response.error) {
      throw new Error("Error");
    }
    const { error } = response;
    expect(error.value).toBeDefined();
  });

  it.each([
    ["patient", 10],
    ["patient", "abc"],
    ["referrer", 10],
    ["referrer", "abc"],
    ["partOfScan", 10],
    ["partOfScan", "ab"],
    ["findings", 10],
    ["findings", "ab"],
    ["date", "abc"],
    ["date", 10],
  ])("Should not create a new USGReport if %p is %p", async (field, value) => {
    const [patient, referrer] = await Promise.all([
      patientFactory(db),
      doctorFactory(db),
    ]);
    // biome-ignore lint:lint/suspicious/noExplicitAny
    const USGReport: any = {
      patient: patient.id,
      referrer: referrer.id,
      partOfScan: faker.lorem.sentence(),
      findings: faker.lorem.paragraph(),
      date: faker.date.recent({ days: 14 }),
    };

    USGReport[field] = value;

    const response = await api.usgreport.index.post(USGReport, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.error) {
      throw new Error("Error");
    }

    expect(response.status).toBe(400);
    expect(response.error.value).toBeDefined();
  });

  it("Should get a USGReport", async () => {
    const USGReport = await USGReportFactory(db);

    const response = await api.usgreport({ id: USGReport.id }).get({
      headers: {
        Authorization: authHeader,
      },
    });

    const relatedPatient = await db.query.patients.findFirst({
      where: eq(schema.patients.id, USGReport.patientId),
    });
    if (!relatedPatient) {
      throw new Error("Patient not found");
    }

    const relatedReferrer = await db.query.doctors.findFirst({
      where: eq(schema.doctors.id, USGReport.referrerId),
    });
    if (!relatedReferrer) {
      throw new Error("Referrer not found");
    }

    expect(response.status).toBe(200);

    if (response.error) {
      throw new Error("Error");
    }

    const { data } = response;

    expect(data.id).toBe(USGReport.id);

    expect(data.patient.id).toBe(relatedPatient.id);
    expect(data.patient.name).toBe(relatedPatient.name);
    expect(data.patient.phone).toBe(relatedPatient.phone);
    expect(data.patient.email).toBe(relatedPatient.email);
    expect(data.patient.age).toBe(relatedPatient.age);
    expect(data.patient.gender).toBe(relatedPatient.gender);

    expect(data.referrer.id).toBe(relatedReferrer.id);
    expect(data.referrer.name).toBe(relatedReferrer.name);
    expect(data.referrer.phone).toBe(relatedReferrer.phone);
    expect(data.referrer.email).toBe(relatedReferrer.email);

    expect(data.partOfScan).toBe(USGReport.partOfScan);
    expect(data.findings).toBe(USGReport.findings);
    expect(data.date).toEqual(USGReport.date);
  });

  it("Should get not a USGReport if unauthorized", async () => {
    const USGReport = await USGReportFactory(db);

    const response = await api.usgreport({ id: USGReport.id }).get();

    expect(response.status).toBe(401);
  });

  it("Should get not a USGReport id is invalid", async () => {
    const USGReport = await USGReportFactory(db);

    const response = await api.usgreport({ id: USGReport.id + 1 }).get({
      headers: {
        Authorization: authHeader,
      },
    });

    expect(response.status).toBe(404);
  });

  it("Should not get a deleted USGReport", async () => {
    const USGReport = await USGReportFactory(db, { deleted: true });

    const response = await api.usgreport({ id: USGReport.id }).get({
      headers: {
        Authorization: authHeader,
      },
    });

    expect(response.status).toBe(404);
  });

  // it("Should update a USGReport", async () => {
  //   const USGReport = await USGReportFactory(db);
  //   const referrer = await doctorFactory(db);
  //   const patient = await patientFactory(db);
  //   const USGReportUpdate = {
  //     patient: patient.id,
  //     referrer: referrer.id,
  //     partOfScan: faker.lorem.sentence(),
  //     findings: faker.lorem.paragraph(),
  //     date: faker.date.recent({ days: 14 }),
  //   };
  //   const [response, data] = await fireRequest(
  //     app,
  //     `/usg-report/${USGReport.id}`,
  //     {
  //       method: "PUT",
  //       body: USGReportUpdate,
  //       authUserId: user.id,
  //     },
  //   );

  //   const updatedUSGReport = await db.query.USGReports.findFirst({
  //     where: eq(schema.USGReports.id, USGReport.id),
  //   });
  //   if (!updatedUSGReport) {
  //     throw new Error("USGReport not found");
  //   }

  //   expect(response.status).toBe(200);
  //   expect(data.id).toBe(USGReport.id);

  //   expect(data.patientId).toBeUndefined();
  //   expect(data.patient.id).toBe(patient.id);
  //   expect(data.patient.name).toBe(patient.name);
  //   expect(data.patient.phone).toBe(patient.phone);
  //   expect(data.patient.email).toBe(patient.email);
  //   expect(data.patient.age).toBe(patient.age);
  //   expect(data.patient.gender).toBe(patient.gender);
  //   expect(data.patient.deleted).toBeUndefined();

  //   expect(data.referrerId).toBeUndefined();
  //   expect(data.referrer.id).toBe(referrer.id);
  //   expect(data.referrer.name).toBe(referrer.name);
  //   expect(data.referrer.phone).toBe(referrer.phone);
  //   expect(data.referrer.email).toBe(referrer.email);
  //   expect(data.referrer.deleted).toBeUndefined();

  //   expect(data.refferrerId).toBeUndefined();
  //   expect(data.partOfScan).toBe(USGReportUpdate.partOfScan);
  //   expect(data.findings).toBe(USGReportUpdate.findings);
  //   expect(data.date).toEqual(USGReportUpdate.date.toISOString());
  //   expect(data.deleted).toBeUndefined();
  //   expect(updatedUSGReport.patientId).toBe(patient.id);
  //   expect(updatedUSGReport.referrerId).toBe(referrer.id);
  //   expect(updatedUSGReport.partOfScan).toBe(USGReportUpdate.partOfScan);
  // });

  // it("Should not update a USGReport if id is invalid", async () => {
  //   const USGReport = await USGReportFactory(db);
  //   const referrer = await doctorFactory(db);
  //   const patient = await patientFactory(db);
  //   const USGReportUpdate = {
  //     patient: patient.id,
  //     referrer: referrer.id,
  //     partOfScan: faker.lorem.sentence(),
  //     findings: faker.lorem.paragraph(),
  //     date: faker.date.recent({ days: 14 }),
  //   };
  //   const [response, data] = await fireRequest(
  //     app,
  //     `/usg-report/${USGReport.id + 1}`,
  //     {
  //       method: "PUT",
  //       body: USGReportUpdate,
  //       authUserId: user.id,
  //     },
  //   );
  //   expect(response.status).toBe(404);
  //   expect(data.id).toBeUndefined();
  //   expect(data.errors).toBeDefined();
  // });

  // it("Should not update a patient if unauthorized", async () => {
  //   const USGReport = await USGReportFactory(db);
  //   const referrer = await doctorFactory(db);
  //   const patient = await patientFactory(db);
  //   const USGReportUpdate = {
  //     patient: patient.id,
  //     referrer: referrer.id,
  //     partOfScan: faker.lorem.sentence(),
  //     findings: faker.lorem.paragraph(),
  //     date: faker.date.recent({ days: 14 }),
  //   };

  //   const [response, data] = await fireRequest(
  //     app,
  //     `/usg-report/${USGReport.id}`,
  //     {
  //       method: "PUT",
  //       body: USGReportUpdate,
  //     },
  //   );

  //   expect(response.status).toBe(401);
  //   expect(data.id).toBeUndefined();
  //   expect(data.errors).toBeDefined();
  // });

  // it("Should delete a USGReport", async () => {
  //   const USGReport = await USGReportFactory(db);

  //   const [response] = await fireRequest(app, `/usg-report/${USGReport.id}`, {
  //     method: "DELETE",
  //     authUserId: user.id,
  //   });

  //   const deletedUSGReport = await db.query.USGReports.findFirst({
  //     where: eq(schema.USGReports.id, USGReport.id),
  //   });

  //   if (!deletedUSGReport) {
  //     throw new Error("USGReport not found");
  //   }

  //   expect(response.status).toBe(204);
  //   expect(deletedUSGReport.id).toBe(USGReport.id);
  //   expect(deletedUSGReport.patientId).toBe(USGReport.patientId);
  //   expect(deletedUSGReport.referrerId).toBe(USGReport.referrerId);
  //   expect(deletedUSGReport.partOfScan).toBe(USGReport.partOfScan);
  //   expect(deletedUSGReport.findings).toBe(USGReport.findings);
  //   expect(deletedUSGReport.date).toEqual(USGReport.date);
  //   expect(deletedUSGReport.deleted).toBe(true);
  // });

  // it("Should not delete a USGReport if unauthorized", async () => {
  //   const USGReport = await USGReportFactory(db);

  //   const [response, data] = await fireRequest(
  //     app,
  //     `/usg-report/${USGReport.id}`,
  //     {
  //       method: "DELETE",
  //     },
  //   );

  //   expect(response.status).toBe(401);
  //   expect(data.id).toBeUndefined();
  //   expect(data.errors).toBeDefined();

  //   const deletedUSGReport = await db.query.USGReports.findFirst({
  //     where: eq(schema.USGReports.id, USGReport.id),
  //   });

  //   if (!deletedUSGReport) {
  //     throw new Error("USGReport not found");
  //   }
  //   expect(deletedUSGReport.id).toBe(USGReport.id);
  //   expect(deletedUSGReport.patientId).toBe(USGReport.patientId);
  //   expect(deletedUSGReport.referrerId).toBe(USGReport.referrerId);
  //   expect(deletedUSGReport.partOfScan).toBe(USGReport.partOfScan);
  //   expect(deletedUSGReport.findings).toBe(USGReport.findings);
  //   expect(deletedUSGReport.date).toEqual(USGReport.date);
  //   expect(deletedUSGReport.deleted).toBe(false);
  // });

  // it("Should not delete a USGReport if id is invalid", async () => {
  //   const USGReport = await USGReportFactory(db);

  //   const [response, data] = await fireRequest(
  //     app,
  //     `/usg-report/${USGReport.id + 1}`,
  //     {
  //       method: "DELETE",
  //       authUserId: user.id,
  //     },
  //   );

  //   expect(response.status).toBe(404);
  //   expect(data.id).toBeUndefined();
  //   expect(data.errors).toBeDefined();

  //   const deletedUSGReport = await db.query.USGReports.findFirst({
  //     where: eq(schema.USGReports.id, USGReport.id),
  //   });

  //   if (!deletedUSGReport) {
  //     throw new Error("USGReport not found");
  //   }
  //   expect(deletedUSGReport.id).toBe(USGReport.id);
  //   expect(deletedUSGReport.patientId).toBe(USGReport.patientId);
  //   expect(deletedUSGReport.referrerId).toBe(USGReport.referrerId);
  //   expect(deletedUSGReport.partOfScan).toBe(USGReport.partOfScan);
  //   expect(deletedUSGReport.findings).toBe(USGReport.findings);
  //   expect(deletedUSGReport.date).toEqual(USGReport.date);
  //   expect(deletedUSGReport.deleted).toBe(false);
  // });

  // it("Should not delete a deleted USGReport", async () => {
  //   const USGReport = await USGReportFactory(db, { deleted: true });

  //   const [response, data] = await fireRequest(
  //     app,
  //     `/usg-report/${USGReport.id}`,
  //     {
  //       method: "DELETE",
  //       authUserId: user.id,
  //     },
  //   );

  //   expect(response.status).toBe(404);
  //   expect(data.id).toBeUndefined();
  //   expect(data.errors).toBeDefined();

  //   const deletedUSGReport = await db.query.USGReports.findFirst({
  //     where: eq(schema.USGReports.id, USGReport.id),
  //   });

  //   if (!deletedUSGReport) {
  //     throw new Error("USGReport not found");
  //   }
  //   expect(deletedUSGReport.id).toBe(USGReport.id);
  //   expect(deletedUSGReport.patientId).toBe(USGReport.patientId);
  //   expect(deletedUSGReport.referrerId).toBe(USGReport.referrerId);
  //   expect(deletedUSGReport.partOfScan).toBe(USGReport.partOfScan);
  //   expect(deletedUSGReport.findings).toBe(USGReport.findings);
  //   expect(deletedUSGReport.date).toEqual(USGReport.date);
  //   expect(deletedUSGReport.deleted).toBe(true);
  // });

  // it("Should list all non deleted USGReports", async () => {
  //   const notDeletedUSGReports = (
  //     await Promise.all(
  //       Array.from({ length: faker.number.int({ min: 100, max: 200 }) }).map(
  //         () => USGReportFactory(db),
  //       ),
  //     )
  //   ).toSorted((a, b) => b.id - a.id);

  //   await Promise.all(
  //     Array.from({ length: faker.number.int({ min: 100, max: 200 }) }).map(() =>
  //       USGReportFactory(db, { deleted: true }),
  //     ),
  //   );

  //   const notDeletedUSGReportsCount = notDeletedUSGReports.length;

  //   const pageSize = faker.number.int({ min: 10, max: 30 });

  //   const totalPages = Math.ceil(notDeletedUSGReportsCount / pageSize);

  //   const responseArray = await Promise.all(
  //     Array.from({ length: totalPages }).map((_, i) =>
  //       fireRequest(app, `/usg-report?page=${i + 1}&limit=${pageSize}`, {
  //         authUserId: user.id,
  //       }),
  //     ),
  //   );

  //   for (const [pageNumber, response] of responseArray.entries()) {
  //     const [resp, respData] = response;

  //     expect(respData.hasMore).toBe(pageNumber < totalPages - 1);
  //     expect(respData.page).toBe(pageNumber + 1);
  //     expect(respData.limit).toBe(pageSize);
  //     expect(respData.totalPages).toBe(totalPages);
  //     expect(respData.total).toBe(notDeletedUSGReportsCount);
  //     if (pageNumber === responseArray.length - 1) {
  //       expect(respData.data.length).toBe(
  //         notDeletedUSGReportsCount % pageSize || pageSize,
  //       );
  //     }

  //     for (const [j, USGReport] of respData.data.entries()) {
  //       const expectedUSGReport =
  //         notDeletedUSGReports[pageSize * pageNumber + j];

  //       expect(USGReport.id).toBe(expectedUSGReport.id);
  //       expect(USGReport.partOfScan).toBe(expectedUSGReport.partOfScan);
  //       expect(USGReport.findings).toBe(expectedUSGReport.findings);
  //       expect(USGReport.referrer.id).toBe(expectedUSGReport.referrerId);
  //       expect(USGReport.patient.id).toBe(expectedUSGReport.patientId);
  //       expect(USGReport.date).toBe(expectedUSGReport.date.toISOString());
  //       expect(USGReport.deleted).toBeUndefined();
  //     }
  //     expect(resp.status).toBe(200);
  //   }
  // });

  // it.each([
  //   [new Date(2024, 0, 5), null],
  //   [null, new Date(2024, 0, 3)],
  //   [new Date(2024, 0, 5), new Date(2024, 0, 3)],
  // ])(
  //   "Should filter USGReports by date between %p and %p",
  //   async (before, after) => {
  //     const USGReports = await Promise.all([
  //       USGReportFactory(db, { date: new Date(2024, 0, 1) }),
  //       USGReportFactory(db, { date: new Date(2024, 0, 2) }),
  //       USGReportFactory(db, { date: new Date(2024, 0, 3) }),
  //       USGReportFactory(db, { date: new Date(2024, 0, 4) }),
  //       USGReportFactory(db, { date: new Date(2024, 0, 5) }),
  //       USGReportFactory(db, { date: new Date(2024, 0, 6) }),
  //     ]);

  //     const expectedUSGReports = USGReports.filter((USGReport) => {
  //       if (before && after) {
  //         return USGReport.date <= before && USGReport.date >= after;
  //       }
  //       if (before) {
  //         return USGReport.date <= before;
  //       }
  //       if (after) {
  //         return USGReport.date >= after;
  //       }
  //       return true;
  //     });

  //     const [response, data] = await fireRequest(app, "/usg-report", {
  //       method: "GET",
  //       query: omitUndefinedValues({
  //         date_before: before?.toISOString(),
  //         date_after: after?.toISOString(),
  //       }),
  //       authUserId: user.id,
  //     });

  //     expect(response.status).toBe(200);
  //     expect(data.data.length).toBe(expectedUSGReports.length);
  //     for (const USGReportReceived of data.data) {
  //       const expectedUSGReport = USGReports.find(
  //         (u) => u.id === USGReportReceived.id,
  //       );
  //       if (!expectedUSGReport) {
  //         throw new Error("USGReport not found");
  //       }

  //       expect(USGReportReceived.id).toBe(expectedUSGReport.id);
  //       expect(USGReportReceived.partOfScan).toBe(expectedUSGReport.partOfScan);
  //       expect(USGReportReceived.findings).toBe(expectedUSGReport.findings);
  //       expect(USGReportReceived.referrer.id).toBe(
  //         expectedUSGReport.referrerId,
  //       );
  //       expect(USGReportReceived.patient.id).toBe(expectedUSGReport.patientId);
  //       expect(USGReportReceived.date).toBe(
  //         expectedUSGReport.date.toISOString(),
  //       );
  //       expect(USGReportReceived.deleted).toBeUndefined();
  //     }
  //   },
  // );

  // it("Should not list all USGReports if unauthorized", async () => {
  //   await Promise.all(
  //     Array.from({ length: 10 }).map(() => USGReportFactory(db)),
  //   );

  //   const [response, data] = await fireRequest(app, "/usg-report", {
  //     method: "GET",
  //   });

  //   expect(response.status).toBe(401);
  //   expect(data.id).toBeUndefined();
  //   expect(data.errors).toBeDefined();
  // });
});

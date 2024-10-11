CREATE TABLE IF NOT EXISTS "USGReports" (
	"id" serial PRIMARY KEY NOT NULL,
	"patientId" integer NOT NULL,
	"referrerId" integer NOT NULL,
	"partOfScan" text NOT NULL,
	"findings" text NOT NULL,
	"date" timestamp NOT NULL,
	"deleted" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "USGReports" ADD CONSTRAINT "USGReports_patientId_patients_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "USGReports" ADD CONSTRAINT "USGReports_referrerId_doctors_id_fk" FOREIGN KEY ("referrerId") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_usgreports_deleted_createdat_id" ON "USGReports" USING btree ("deleted","createdAt","id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_patients_deleted_createdat_id" ON "patients" USING btree ("deleted","created_at","id");
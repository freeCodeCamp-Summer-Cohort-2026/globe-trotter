ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_tutorial_module_fk";
--> statement-breakpoint
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_lab_module_fk";
--> statement-breakpoint
ALTER TABLE "tutorials" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tutorials" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "labs" ADD COLUMN "goals" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "labs" ADD COLUMN "allowed_attempts" integer;--> statement-breakpoint
ALTER TABLE "labs" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tutorials" ADD COLUMN "estimated_duration" integer;--> statement-breakpoint
ALTER TABLE "tutorials" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_tutorial_module_fk" FOREIGN KEY ("tutorial_id","module_id") REFERENCES "public"."tutorials"("id","module_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_lab_module_fk" FOREIGN KEY ("lab_id","module_id") REFERENCES "public"."labs"("id","module_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labs" DROP COLUMN "content";
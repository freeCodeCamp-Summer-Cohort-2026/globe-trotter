ALTER TABLE "modules" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "thumbnail_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "is_published" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "modules" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tutorials" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "labs" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" DROP COLUMN "order_index";
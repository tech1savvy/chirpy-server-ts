CREATE TABLE "chirps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"body" varchar(140) NOT NULL,
	"user_i" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_user_i_users_id_fk" FOREIGN KEY ("user_i") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
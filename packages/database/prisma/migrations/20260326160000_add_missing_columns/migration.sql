-- Schema drift fix: add tables and columns that exist in schema.prisma but were missing from migrations.
-- Uses IF NOT EXISTS so this is safe to run on databases where they already exist (e.g. via db push).

-- ============================================
-- PART 1: Missing columns on existing tables
-- ============================================

-- User table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_changed_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locale" VARCHAR(10) NOT NULL DEFAULT 'en';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferences" JSONB;

-- Business profile table
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "dark_logo_url" TEXT;
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "social_links" JSONB DEFAULT '[]';
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "locale" VARCHAR(10) NOT NULL DEFAULT 'en';
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "email_signature" TEXT;
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "email_footer" TEXT;
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "client_email" TEXT;
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "auto_countersign" BOOLEAN NOT NULL DEFAULT false;

-- Contract instances table
ALTER TABLE "contract_instances" ADD COLUMN IF NOT EXISTS "countersigned_at" TIMESTAMP(3);
ALTER TABLE "contract_instances" ADD COLUMN IF NOT EXISTS "countersignature_data" JSONB;
ALTER TABLE "contract_instances" ADD COLUMN IF NOT EXISTS "countersigner_name" TEXT;

-- Workspace invitations table
ALTER TABLE "workspace_invitations" ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3);

-- Payments table
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Payment settings table
ALTER TABLE "payment_settings" ADD COLUMN IF NOT EXISTS "charges_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "payment_settings" ADD COLUMN IF NOT EXISTS "payouts_enabled" BOOLEAN NOT NULL DEFAULT false;

-- Branding settings table
ALTER TABLE "branding_settings" ADD COLUMN IF NOT EXISTS "dark_logo_url" TEXT;

-- Attachments table
ALTER TABLE "attachments" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Quote table
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(3) NOT NULL DEFAULT 'USD';

-- Invoice table
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(3) NOT NULL DEFAULT 'USD';
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "is_recurring" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "recurring_interval" VARCHAR(20);
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "recurring_start_date" DATE;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "recurring_end_date" DATE;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "recurring_auto_send" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "next_recurring_date" DATE;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "parent_invoice_id" TEXT;

CREATE INDEX IF NOT EXISTS "invoices_is_recurring_next_recurring_date_idx" ON "invoices"("is_recurring", "next_recurring_date");
CREATE INDEX IF NOT EXISTS "invoices_parent_invoice_id_idx" ON "invoices"("parent_invoice_id");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'invoices_parent_invoice_id_fkey'
  ) THEN
    ALTER TABLE "invoices" ADD CONSTRAINT "invoices_parent_invoice_id_fkey"
      FOREIGN KEY ("parent_invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================
-- PART 2: Missing tables
-- ============================================

-- webhook_endpoints (must be created before webhook_deliveries due to FK)
CREATE TABLE IF NOT EXISTS "webhook_endpoints" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL DEFAULT '',
    "url" VARCHAR(500) NOT NULL,
    "secret" VARCHAR(100) NOT NULL,
    "events" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "webhook_endpoints_workspace_id_idx" ON "webhook_endpoints"("workspace_id");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'webhook_endpoints_workspace_id_fkey') THEN
    ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- webhook_deliveries
CREATE TABLE IF NOT EXISTS "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "endpoint_id" TEXT NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "status_code" INTEGER,
    "response" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_retry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "webhook_deliveries_endpoint_id_idx" ON "webhook_deliveries"("endpoint_id");
CREATE INDEX IF NOT EXISTS "webhook_deliveries_status_next_retry_idx" ON "webhook_deliveries"("status", "next_retry");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'webhook_deliveries_endpoint_id_fkey') THEN
    ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- credit_notes (must be created before credit_note_line_items and credit_note_events)
CREATE TABLE IF NOT EXISTS "credit_notes" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "credit_note_number" VARCHAR(50) NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "issued_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "credit_notes_workspace_id_credit_note_number_key" ON "credit_notes"("workspace_id", "credit_note_number");
CREATE INDEX IF NOT EXISTS "credit_notes_workspace_id_idx" ON "credit_notes"("workspace_id");
CREATE INDEX IF NOT EXISTS "credit_notes_invoice_id_idx" ON "credit_notes"("invoice_id");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'credit_notes_workspace_id_fkey') THEN
    ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'credit_notes_invoice_id_fkey') THEN
    ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- credit_note_line_items
CREATE TABLE IF NOT EXISTS "credit_note_line_items" (
    "id" TEXT NOT NULL,
    "credit_note_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "rate" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "credit_note_line_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "credit_note_line_items_credit_note_id_idx" ON "credit_note_line_items"("credit_note_id");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'credit_note_line_items_credit_note_id_fkey') THEN
    ALTER TABLE "credit_note_line_items" ADD CONSTRAINT "credit_note_line_items_credit_note_id_fkey" FOREIGN KEY ("credit_note_id") REFERENCES "credit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- credit_note_events
CREATE TABLE IF NOT EXISTS "credit_note_events" (
    "id" TEXT NOT NULL,
    "credit_note_id" TEXT NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "actor_id" TEXT,
    "actor_type" VARCHAR(20) NOT NULL DEFAULT 'user',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credit_note_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "credit_note_events_credit_note_id_idx" ON "credit_note_events"("credit_note_id");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'credit_note_events_credit_note_id_fkey') THEN
    ALTER TABLE "credit_note_events" ADD CONSTRAINT "credit_note_events_credit_note_id_fkey" FOREIGN KEY ("credit_note_id") REFERENCES "credit_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'credit_note_events_actor_id_fkey') THEN
    ALTER TABLE "credit_note_events" ADD CONSTRAINT "credit_note_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- api_keys
CREATE TABLE IF NOT EXISTS "api_keys" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" VARCHAR(12) NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_key_hash_key" ON "api_keys"("key_hash");
CREATE INDEX IF NOT EXISTS "api_keys_workspace_id_idx" ON "api_keys"("workspace_id");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'api_keys_workspace_id_fkey') THEN
    ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- email_verification_tokens
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "email_verification_tokens_token_key" ON "email_verification_tokens"("token");
CREATE INDEX IF NOT EXISTS "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'email_verification_tokens_user_id_fkey') THEN
    ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- invoice_templates
CREATE TABLE IF NOT EXISTS "invoice_templates" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "payment_terms" VARCHAR(20) NOT NULL DEFAULT 'net30',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "line_items" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "terms" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "invoice_templates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "invoice_templates_workspace_id_idx" ON "invoice_templates"("workspace_id");
CREATE INDEX IF NOT EXISTS "invoice_templates_workspace_id_deleted_at_idx" ON "invoice_templates"("workspace_id", "deleted_at");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'invoice_templates_workspace_id_fkey') THEN
    ALTER TABLE "invoice_templates" ADD CONSTRAINT "invoice_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- saved_line_items
CREATE TABLE IF NOT EXISTS "saved_line_items" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "duration" VARCHAR(20),
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "saved_line_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "saved_line_items_workspace_id_idx" ON "saved_line_items"("workspace_id");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'saved_line_items_workspace_id_fkey') THEN
    ALTER TABLE "saved_line_items" ADD CONSTRAINT "saved_line_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- stripe_webhook_events
CREATE TABLE IF NOT EXISTS "stripe_webhook_events" (
    "id" TEXT NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "stripe_webhook_events_processed_at_idx" ON "stripe_webhook_events"("processed_at");

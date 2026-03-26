-- Add CHECK constraints on status fields to prevent arbitrary string values.
-- Uses DO blocks with IF NOT EXISTS pattern so this is safe to re-run.

-- Quote statuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quotes_status_check') THEN
    ALTER TABLE "quotes" ADD CONSTRAINT "quotes_status_check"
      CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'converted'));
  END IF;
END $$;

-- Invoice statuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_status_check') THEN
    ALTER TABLE "invoices" ADD CONSTRAINT "invoices_status_check"
      CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'voided'));
  END IF;
END $$;

-- Payment statuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_status_check') THEN
    ALTER TABLE "payments" ADD CONSTRAINT "payments_status_check"
      CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));
  END IF;
END $$;

-- Payment schedule statuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_schedules_status_check') THEN
    ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_status_check"
      CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'));
  END IF;
END $$;

-- Contract instance statuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contract_instances_status_check') THEN
    ALTER TABLE "contract_instances" ADD CONSTRAINT "contract_instances_status_check"
      CHECK (status IN ('draft', 'sent', 'viewed', 'pending', 'signed', 'voided', 'expired'));
  END IF;
END $$;

-- Credit note statuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'credit_notes_status_check') THEN
    ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_status_check"
      CHECK (status IN ('draft', 'issued', 'voided'));
  END IF;
END $$;

-- Scheduled email statuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'scheduled_emails_status_check') THEN
    ALTER TABLE "scheduled_emails" ADD CONSTRAINT "scheduled_emails_status_check"
      CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'));
  END IF;
END $$;

-- Webhook delivery statuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webhook_deliveries_status_check') THEN
    ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_status_check"
      CHECK (status IN ('pending', 'delivered', 'failed'));
  END IF;
END $$;

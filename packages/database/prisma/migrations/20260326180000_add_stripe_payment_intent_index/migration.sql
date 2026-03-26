CREATE UNIQUE INDEX IF NOT EXISTS "payments_stripe_payment_intent_id_key" ON "payments"("stripe_payment_intent_id") WHERE "stripe_payment_intent_id" IS NOT NULL;

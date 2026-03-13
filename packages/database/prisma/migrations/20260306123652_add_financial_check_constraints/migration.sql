-- Rate cards: rate must be non-negative
ALTER TABLE "rate_cards" ADD CONSTRAINT "rate_cards_rate_non_negative" CHECK ("rate" >= 0);

-- Quotes: financial fields must be non-negative
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_subtotal_non_negative" CHECK ("subtotal" >= 0);
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_discount_amount_non_negative" CHECK ("discount_amount" >= 0);
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_tax_total_non_negative" CHECK ("tax_total" >= 0);
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_total_non_negative" CHECK ("total" >= 0);

-- Quote line items: financial fields must be non-negative
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_rate_non_negative" CHECK ("rate" >= 0);
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_amount_non_negative" CHECK ("amount" >= 0);
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_tax_amount_non_negative" CHECK ("tax_amount" >= 0);

-- Invoices: financial fields must be non-negative
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subtotal_non_negative" CHECK ("subtotal" >= 0);
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_discount_amount_non_negative" CHECK ("discount_amount" >= 0);
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tax_total_non_negative" CHECK ("tax_total" >= 0);
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_total_non_negative" CHECK ("total" >= 0);
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_amount_paid_non_negative" CHECK ("amount_paid" >= 0);
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_amount_due_non_negative" CHECK ("amount_due" >= 0);

-- Invoice line items: financial fields must be non-negative
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_rate_non_negative" CHECK ("rate" >= 0);
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_amount_non_negative" CHECK ("amount" >= 0);
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_tax_amount_non_negative" CHECK ("tax_amount" >= 0);

-- Payments: amount must be non-negative
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_non_negative" CHECK ("amount" >= 0);

-- Payment schedules: amount must be non-negative (nullable field, only check when present)
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_amount_non_negative" CHECK ("amount" IS NULL OR "amount" >= 0);

-- Tax rates: percentage must be between 0 and 100
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_tax_rate_valid" CHECK ("tax_rate" IS NULL OR ("tax_rate" >= 0 AND "tax_rate" <= 100));
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_tax_rate_valid" CHECK ("tax_rate" IS NULL OR ("tax_rate" >= 0 AND "tax_rate" <= 100));

-- Bug #185: Composite indexes for common dashboard listing queries (workspaceId + createdAt)
CREATE INDEX IF NOT EXISTS "quotes_workspace_id_created_at_idx" ON "quotes"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "invoices_workspace_id_created_at_idx" ON "invoices"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "clients_workspace_id_created_at_idx" ON "clients"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "contracts_workspace_id_created_at_idx" ON "contracts"("workspace_id", "created_at");
CREATE INDEX IF NOT EXISTS "contract_instances_workspace_id_created_at_idx" ON "contract_instances"("workspace_id", "created_at");

-- Bug #186: Partial indexes for soft-delete queries (deletedAt IS NULL)
CREATE INDEX IF NOT EXISTS "quotes_workspace_id_deleted_at_null_idx" ON "quotes"("workspace_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "invoices_workspace_id_deleted_at_null_idx" ON "invoices"("workspace_id") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "clients_workspace_id_deleted_at_null_idx" ON "clients"("workspace_id") WHERE "deleted_at" IS NULL;

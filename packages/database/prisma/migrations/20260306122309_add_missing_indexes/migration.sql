-- CreateIndex
CREATE INDEX "contract_instances_workspace_id_idx" ON "contract_instances"("workspace_id");

-- CreateIndex
CREATE INDEX "payment_schedules_payment_id_idx" ON "payment_schedules"("payment_id");

-- CreateIndex
CREATE INDEX "rate_card_categories_workspace_id_idx" ON "rate_card_categories"("workspace_id");

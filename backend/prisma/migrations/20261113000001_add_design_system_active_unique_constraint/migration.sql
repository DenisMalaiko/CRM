-- CreateIndex (partial unique: only one active design system per business)
CREATE UNIQUE INDEX "DesignSystem_businessId_isActive_unique"
ON "DesignSystem" ("businessId")
WHERE "isActive" = true;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "city" TEXT,
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'contacto',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "sourcePath" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'nueva',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT,
ADD COLUMN     "valuation" JSONB,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "device" TEXT,
    "meta" JSONB,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_kind_idx" ON "Lead"("kind");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");


-- Backfill: clasifica los leads existentes
UPDATE "Lead" SET "kind" = 'propiedad' WHERE "propertyRef" IS NOT NULL;
UPDATE "Lead" SET "kind" = 'valoracion' WHERE "propertyRef" IS NULL AND "asunto" IN ('valoracion', 'vender');

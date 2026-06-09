-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "employeeCount" INTEGER NOT NULL,
    "subregion" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "accountOwner" TEXT NOT NULL,
    "accountTier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerMetrics" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "arr" DOUBLE PRECISION NOT NULL,
    "arrPriorYear" DOUBLE PRECISION NOT NULL,
    "arrGrowthPct" DOUBLE PRECISION NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "renewalRiskScore" DOUBLE PRECISION,
    "expansionScore" DOUBLE PRECISION,
    "healthScore" DOUBLE PRECISION,
    "hasExecutiveSponsor" BOOLEAN NOT NULL,
    "stakeholderCount" INTEGER NOT NULL,
    "lastActivityDate" TIMESTAMP(3) NOT NULL,
    "accountHealth" TEXT NOT NULL,

    CONSTRAINT "CustomerMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProspectMetrics" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "icpScore" DOUBLE PRECISION NOT NULL,
    "estimatedContractValue" DOUBLE PRECISION NOT NULL,
    "pipelineStage" TEXT NOT NULL,
    "opportunityValue" DOUBLE PRECISION NOT NULL,
    "opportunityCreatedDate" TIMESTAMP(3) NOT NULL,
    "lastActivityDate" TIMESTAMP(3) NOT NULL,
    "daysSinceActivity" INTEGER NOT NULL,
    "isStalled" BOOLEAN NOT NULL,
    "priorityScore" DOUBLE PRECISION,

    CONSTRAINT "ProspectMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductUsage" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "seatsPurchased" INTEGER NOT NULL,
    "activeSeats" INTEGER NOT NULL,
    "monthlyActiveUsers" INTEGER NOT NULL,
    "loginFrequency" DOUBLE PRECISION NOT NULL,
    "featureAdoptionPct" DOUBLE PRECISION NOT NULL,
    "usageTrend" TEXT NOT NULL,
    "lastActiveDate" TIMESTAMP(3) NOT NULL,
    "supportTicketCount" INTEGER NOT NULL,
    "adoptionStatus" TEXT NOT NULL,

    CONSTRAINT "ProductUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriorityAction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "priorityScore" DOUBLE PRECISION NOT NULL,
    "primaryAction" TEXT NOT NULL,
    "secondaryAction" TEXT,
    "reason" TEXT NOT NULL,
    "opportunityValue" DOUBLE PRECISION,
    "revenueAtRisk" DOUBLE PRECISION,
    "scoreBreakdown" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriorityAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerMetrics_accountId_key" ON "CustomerMetrics"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "ProspectMetrics_accountId_key" ON "ProspectMetrics"("accountId");

-- AddForeignKey
ALTER TABLE "CustomerMetrics" ADD CONSTRAINT "CustomerMetrics_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProspectMetrics" ADD CONSTRAINT "ProspectMetrics_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUsage" ADD CONSTRAINT "ProductUsage_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriorityAction" ADD CONSTRAINT "PriorityAction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

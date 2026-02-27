-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('AI_CHAT', 'PRIORITY_MATCH', 'PREMIUM_FEATURES', 'COMBO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('AI_CHAT', 'PRIORITY_MATCH', 'PREMIUM_FEATURE');

-- CreateTable
CREATE TABLE "subscription_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PackageType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "durationDays" INTEGER NOT NULL,
    "features" JSONB NOT NULL,
    "aiChatQuota" INTEGER,
    "priorityMatchQuota" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "aiChatUsed" INTEGER NOT NULL DEFAULT 0,
    "priorityMatchUsed" INTEGER NOT NULL DEFAULT 0,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_usage_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "usageType" "UsageType" NOT NULL,
    "usageDetail" JSONB,
    "costAmount" INTEGER NOT NULL DEFAULT 1,
    "remainingBalance" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_subscription_packages_type" ON "subscription_packages"("type");

-- CreateIndex
CREATE INDEX "idx_subscription_packages_active" ON "subscription_packages"("isActive");

-- CreateIndex
CREATE INDEX "idx_user_subscriptions_user_id" ON "user_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "idx_user_subscriptions_status" ON "user_subscriptions"("status");

-- CreateIndex
CREATE INDEX "idx_user_subscriptions_end_date" ON "user_subscriptions"("endDate");

-- CreateIndex
CREATE INDEX "idx_subscription_usage_logs_user_id" ON "subscription_usage_logs"("userId");

-- CreateIndex
CREATE INDEX "idx_subscription_usage_logs_subscription_id" ON "subscription_usage_logs"("subscriptionId");

-- CreateIndex
CREATE INDEX "idx_subscription_usage_logs_created_at" ON "subscription_usage_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "subscription_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_usage_logs" ADD CONSTRAINT "subscription_usage_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_usage_logs" ADD CONSTRAINT "subscription_usage_logs_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "user_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
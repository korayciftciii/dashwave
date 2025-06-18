-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "actualHours" INTEGER,
ADD COLUMN     "blockedReason" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "estimatedHours" INTEGER,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

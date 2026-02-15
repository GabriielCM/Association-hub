-- AlterTable
ALTER TABLE "spaces" ADD COLUMN "blocked_weekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

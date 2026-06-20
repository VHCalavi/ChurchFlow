-- AlterTable: add identity fields to members
ALTER TABLE "members" 
  ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "occupation"    TEXT,
  ADD COLUMN IF NOT EXISTS "nationalId"   TEXT,
  ADD COLUMN IF NOT EXISTS "nationality"  TEXT;

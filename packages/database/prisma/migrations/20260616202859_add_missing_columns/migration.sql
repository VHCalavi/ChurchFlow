-- AlterTable
ALTER TABLE "churches" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "meeting_attendees" ALTER COLUMN "isPresent" DROP NOT NULL,
ALTER COLUMN "isPresent" DROP DEFAULT;

-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';

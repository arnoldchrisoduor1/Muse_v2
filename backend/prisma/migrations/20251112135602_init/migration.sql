-- AlterTable
ALTER TABLE "users" ADD COLUMN     "coverImageUrl" TEXT DEFAULT 'https://robohash.org/XD3.png?set=set4',
ADD COLUMN     "instagram" TEXT DEFAULT '',
ADD COLUMN     "twitter" TEXT DEFAULT '',
ADD COLUMN     "website" TEXT DEFAULT '',
ALTER COLUMN "avatarUrl" SET DEFAULT 'https://robohash.org/154.159.237.216.png';

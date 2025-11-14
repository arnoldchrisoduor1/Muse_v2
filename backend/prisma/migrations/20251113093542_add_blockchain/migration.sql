-- CreateEnum
CREATE TYPE "MintStatus" AS ENUM ('PENDING', 'MINTING', 'MINTED', 'FAILED');

-- AlterTable
ALTER TABLE "poems" ADD COLUMN     "isMinted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BlockchainData" (
    "id" TEXT NOT NULL,
    "poemId" TEXT NOT NULL,
    "tokenId" TEXT,
    "contractAddress" TEXT,
    "transactionHash" TEXT,
    "blockNumber" INTEGER,
    "network" TEXT,
    "metadataURI" TEXT,
    "fractionalTokenAddress" TEXT,
    "totalShares" INTEGER,
    "sharesAvailable" INTEGER,
    "sharePrice" TEXT,
    "mintStatus" "MintStatus" NOT NULL DEFAULT 'PENDING',
    "mintedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockchainData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueDistribution" (
    "id" TEXT NOT NULL,
    "poemId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "contributors" JSONB NOT NULL,
    "transactionHash" TEXT,
    "setupAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDistribution" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainError" (
    "id" TEXT NOT NULL,
    "poemId" TEXT,
    "operation" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "errorStack" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockchainError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainData_poemId_key" ON "BlockchainData"("poemId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainData_tokenId_key" ON "BlockchainData"("tokenId");

-- CreateIndex
CREATE INDEX "BlockchainData_tokenId_idx" ON "BlockchainData"("tokenId");

-- CreateIndex
CREATE INDEX "BlockchainData_contractAddress_idx" ON "BlockchainData"("contractAddress");

-- CreateIndex
CREATE INDEX "BlockchainData_mintStatus_idx" ON "BlockchainData"("mintStatus");

-- CreateIndex
CREATE INDEX "RevenueDistribution_poemId_idx" ON "RevenueDistribution"("poemId");

-- CreateIndex
CREATE INDEX "RevenueDistribution_tokenId_idx" ON "RevenueDistribution"("tokenId");

-- CreateIndex
CREATE INDEX "BlockchainError_poemId_idx" ON "BlockchainError"("poemId");

-- CreateIndex
CREATE INDEX "BlockchainError_operation_idx" ON "BlockchainError"("operation");

-- CreateIndex
CREATE INDEX "BlockchainError_resolved_idx" ON "BlockchainError"("resolved");

-- AddForeignKey
ALTER TABLE "BlockchainData" ADD CONSTRAINT "BlockchainData_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "poems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull'; // Use import type for decorators
import { PoemsService } from '../poems/poems.service';
import { BlockchainService } from './blockchain.service';
import { PrismaService } from '../../prisma/prisma.service';

interface MintPoemJob {
  poemId: string;
  userId: string;
  walletAddress: string;
}

@Processor('blockchain')
export class BlockchainProcessor {
  private readonly logger = new Logger(BlockchainProcessor.name);

  constructor(
    private poemsService: PoemsService,
    private blockchainService: BlockchainService,
    private prisma: PrismaService,
  ) {}

  /**
   * Process poem NFT minting jobs
   */
  @Process('mint-poem-nft')
  async handleMintPoemNFT(job: Job<MintPoemJob>) {
    const { poemId, userId, walletAddress } = job.data;
    
    this.logger.log(`🔨 Processing mint job for poem ${poemId} (Job ${job.id})`);
    
    try {
      // Update job progress
      await job.progress(10);

      // Get poem details
      const poem = await this.prisma.poem.findUnique({
        where: { id: poemId },
      });

      if (!poem) {
        throw new Error(`Poem ${poemId} not found`);
      }

      await job.progress(20);

      // Check if already minted
      const existingBlockchainData = await this.prisma.blockchainData.findUnique({
        where: { poemId },
      });

      if (existingBlockchainData?.tokenId) {
        this.logger.log(`✅ Poem ${poemId} already minted as token ${existingBlockchainData.tokenId}`);
        return {
          success: true,
          tokenId: existingBlockchainData.tokenId,
          message: 'Already minted',
        };
      }

      await job.progress(30);

      // Ensure contentHash is not null
      const contentHash = poem.contentHash || '';

      // Mint the NFT
      this.logger.log(`⛓️ Minting NFT for poem ${poemId} to wallet ${walletAddress}`);
      
      const mintResult = await this.blockchainService.mintPoemNFT(
        poemId,
        walletAddress,
        {
          title: poem.title,
          content: poem.content,
          contentHash: contentHash, // Now guaranteed to be string
          tags: poem.tags,
          mood: poem.mood || undefined,
        }
      );

      await job.progress(80);

      // Update poem with blockchain info
      await this.prisma.poem.update({
        where: { id: poemId },
        data: {
          isMinted: true,
        },
      });

      await job.progress(100);

      this.logger.log(`✅ Successfully minted poem ${poemId} as token ${mintResult.tokenId}`);

      return {
        success: true,
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
        contractAddress: mintResult.contractAddress,
      };
    } catch (error) {
      this.logger.error(`❌ Failed to mint poem ${poemId}:`, error);
      
      // Log failure in database
      await this.prisma.blockchainError.create({
        data: {
          poemId,
          operation: 'mint',
          errorMessage: error.message,
          errorStack: error.stack,
        },
      }).catch(err => this.logger.error('Failed to log blockchain error:', err));

      throw error; // Re-throw to trigger job retry
    }
  }
}
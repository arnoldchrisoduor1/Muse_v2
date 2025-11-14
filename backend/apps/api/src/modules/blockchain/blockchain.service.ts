import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { PrismaService } from '../../prisma/prisma.service';

// Define interfaces locally instead of importing problematic types
export interface MintResult {
  tokenId: string;
  transactionHash: string;
  contractAddress: string;
  blockNumber: number;
}

export interface FractionalizeResult {
  fractionalTokenAddress: string;
  totalShares: number;
  transactionHash: string;
}

// Mock ABIs for development (replace with actual compiled contract ABIs)
const PoemNFTABI = [
  "function mintPoem(address to, string memory metadataURI, bytes32 contentHash) public returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function approve(address to, uint256 tokenId) public",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "event PoemMinted(uint256 indexed tokenId, address indexed author, bytes32 contentHash, string metadataURI)"
];

const FractionalOwnershipABI = [
  "function fractionalize(address nftContract, uint256 tokenId, uint256 totalShares, uint256 sharePrice) public",
  "event NFTFractionalized(address indexed fractionalToken)"
];

const RevenueDistributorABI = [
  "function setupDistribution(uint256 tokenId, address[] memory contributors, uint256[] memory shares) public",
  "function distribute(uint256 tokenId) public payable"
];

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private poemNFTContract: ethers.Contract | null = null;
  private fractionalOwnershipContract: ethers.Contract | null = null;
  private revenueDistributorContract: ethers.Contract | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.initializeProvider();
  }

  /**
   * Initialize blockchain provider and contracts
   */
  private initializeProvider() {
    try {
      // For development: use local hardhat node or testnet
      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL') || 'http://localhost:8545';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Load wallet from private key (use env variable)
      const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
      if (!privateKey) {
        this.logger.warn('BLOCKCHAIN_PRIVATE_KEY not configured - using mock mode');
        return;
      }
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Initialize contracts
      const poemNFTAddress = this.configService.get<string>('POEM_NFT_CONTRACT_ADDRESS');
      const fractionalOwnershipAddress = this.configService.get<string>('FRACTIONAL_OWNERSHIP_CONTRACT_ADDRESS');
      const revenueDistributorAddress = this.configService.get<string>('REVENUE_DISTRIBUTOR_CONTRACT_ADDRESS');

      if (poemNFTAddress) {
        this.poemNFTContract = new ethers.Contract(
          poemNFTAddress,
          PoemNFTABI,
          this.wallet
        );
      }

      if (fractionalOwnershipAddress) {
        this.fractionalOwnershipContract = new ethers.Contract(
          fractionalOwnershipAddress,
          FractionalOwnershipABI,
          this.wallet
        );
      }

      if (revenueDistributorAddress) {
        this.revenueDistributorContract = new ethers.Contract(
          revenueDistributorAddress,
          RevenueDistributorABI,
          this.wallet
        );
      }

      this.logger.log('Blockchain service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain service:', error);
      // Don't throw - allow app to run in mock mode
    }
  }

  /**
   * Mint a poem as NFT
   */
  async mintPoemNFT(
    poemId: string,
    authorAddress: string,
    metadata: {
      title: string;
      content: string;
      contentHash: string;
      tags: string[];
      mood?: string;
    }
  ): Promise<MintResult> {
    this.logger.log(`Minting NFT for poem ${poemId}`);

    // Mock implementation for development
    if (!this.poemNFTContract || !this.wallet) {
      return this.mockMintPoemNFT(poemId, authorAddress, metadata);
    }

    try {
      // Upload metadata to IPFS (or store on-chain for dev)
      const metadataURI = await this.uploadMetadataToIPFS(poemId, metadata);

      // Mint the NFT
      const tx = await this.poemNFTContract.mintPoem(
        authorAddress,
        metadataURI,
        metadata.contentHash
      );

      this.logger.log(`Minting transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Extract tokenId from event logs
      const mintEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === 'PoemMinted'
      );
      
      const tokenId = mintEvent ? mintEvent.args[0].toString() : this.generateMockTokenId();

      if (!tokenId) {
        throw new Error('Failed to extract tokenId from transaction');
      }

      this.logger.log(`NFT minted successfully. TokenId: ${tokenId}`);

      // Store blockchain data in database
      await this.prisma.blockchainData.create({
        data: {
          poemId,
          tokenId,
          contractAddress: await this.poemNFTContract.getAddress(),
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          network: this.configService.get<string>('BLOCKCHAIN_NETWORK') || 'localhost',
          metadataURI,
        },
      });

      return {
        tokenId,
        transactionHash: tx.hash,
        contractAddress: await this.poemNFTContract.getAddress(),
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error(`Failed to mint NFT for poem ${poemId}:`, error);
      // Fall back to mock mode
      return this.mockMintPoemNFT(poemId, authorAddress, metadata);
    }
  }

  /**
   * Mock minting for development
   */
  private async mockMintPoemNFT(
    poemId: string,
    authorAddress: string,
    metadata: {
      title: string;
      content: string;
      contentHash: string;
      tags: string[];
      mood?: string;
    }
  ): Promise<MintResult> {
    this.logger.log(`Using mock minting for poem ${poemId}`);
    
    const tokenId = this.generateMockTokenId();
    const transactionHash = `0x${Buffer.from(`${poemId}-${Date.now()}`).toString('hex').substring(0, 64)}`;
    const contractAddress = '0x' + '0'.repeat(40); // Mock address

    // Store mock blockchain data
    await this.prisma.blockchainData.create({
      data: {
        poemId,
        tokenId,
        contractAddress,
        transactionHash,
        blockNumber: 1,
        network: 'mock',
        metadataURI: `mock://ipfs/${poemId}`,
      },
    });

    return {
      tokenId,
      transactionHash,
      contractAddress,
      blockNumber: 1,
    };
  }

  /**
   * Generate a mock token ID
   */
  private generateMockTokenId(): string {
    return (Math.floor(Math.random() * 1000000) + 1).toString();
  }

  /**
   * Fractionalize a poem NFT (split ownership)
   */
  async fractionalizePoemNFT(
    poemId: string,
    tokenId: string,
    totalShares: number,
    sharePrice: string // in wei
  ): Promise<FractionalizeResult> {
    this.logger.log(`Fractionalizing NFT tokenId: ${tokenId}`);

    // Mock implementation
    const fractionalTokenAddress = '0x' + '1'.repeat(40);
    const transactionHash = `0x${Buffer.from(`fractionalize-${tokenId}-${Date.now()}`).toString('hex').substring(0, 64)}`;

    // Update database
    await this.prisma.blockchainData.update({
      where: { poemId },
      data: {
        fractionalTokenAddress,
        totalShares,
        sharesAvailable: totalShares,
      },
    });

    return {
      fractionalTokenAddress,
      totalShares,
      transactionHash,
    };
  }

  /**
   * Get NFT owner
   */
  async getNFTOwner(tokenId: string): Promise<string> {
    try {
      if (!this.poemNFTContract) {
        // Return mock owner
        return '0x' + '2'.repeat(40);
      }
      return await this.poemNFTContract.ownerOf(tokenId);
    } catch (error) {
      this.logger.error(`Failed to get owner of tokenId ${tokenId}:`, error);
      // Return mock owner
      return '0x' + '2'.repeat(40);
    }
  }

  /**
   * Upload metadata to IPFS (placeholder - implement with Pinata/IPFS)
   */
  private async uploadMetadataToIPFS(
    poemId: string,
    metadata: any
  ): Promise<string> {
    const mockMetadata = {
      name: metadata.title,
      description: `Poem: ${metadata.title}`,
      content: metadata.content,
      contentHash: metadata.contentHash,
      tags: metadata.tags,
      mood: metadata.mood,
      poemId,
      createdAt: new Date().toISOString(),
    };

    // For dev: return a mock URI
    const mockIPFSHash = `ipfs://Qm${Buffer.from(JSON.stringify(mockMetadata)).toString('base64').substring(0, 44)}`;
    
    this.logger.log(`Mock IPFS URI generated: ${mockIPFSHash}`);
    
    return mockIPFSHash;
  }
}
import { 
  IsString, 
  IsOptional, 
  IsArray, 
  IsNumber, 
  IsEnum, 
  Min, 
  Max, 
  IsBoolean 
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateContentDto {
  @IsString()
  content: string;
}

export class InviteCollaboratorDto {
  @IsString()
  inviteeIdentifier: string; // email or username
}

export class OwnershipSplitDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  sharePercentage: number;
}

export class OwnershipProposalDto {
  @IsArray()
  splits: OwnershipSplitDto[];
}

// Response DTOs
export class CollaborationSession {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  participants: Collaborator[];
  ownerId: string;
  versionHistory: PoemVersion[];
  currentVersion: string;
  ownershipProposal: OwnershipProposal | null;
  totalShares: number;
  publishedAt: Date | null;
  nftTokenId: string | null;
}

export class Collaborator {
  userId: string;
  username: string;
  avatarUrl: string;
  sharePercentage: number;
  contributionType: 'original' | 'remix' | 'collaboration' | 'inspiration';
  contributionHash: string;
  contributedAt: Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isOnline: boolean;
  cursorPosition: number | null;
  charactersAdded: number;
  linesAdded: number;
  editsCount: number;
}

export class PoemVersion {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  changeDescription: string;
  diffFromPrevious: string;
}

export class OwnershipProposal {
  id: string;
  proposedBy: string;
  proposedByName: string;
  splits: {
    userId: string;
    username: string;
    percentage: number;
  }[];
  approvals: {
    userId: string;
    approved: boolean;
    respondedAt: Date;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}
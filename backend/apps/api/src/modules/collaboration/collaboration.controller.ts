import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { 
  CreateSessionDto, 
  UpdateSessionDto, 
  InviteCollaboratorDto,
  OwnershipProposalDto,
  UpdateContentDto,
  CollaborationSession 
} from './dto/collaboration.dto';

@Controller('collaboration')
@UseGuards(JwtAuthGuard)
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Post('sessions')
  async createSession(
    @Request() req,
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<CollaborationSession> {
    return this.collaborationService.createSession(req.user.id, createSessionDto);
  }

  @Get('sessions')
  async getUserSessions(@Request() req): Promise<CollaborationSession[]> {
    return this.collaborationService.getUserSessions(req.user.id);
  }

  @Get('sessions/invited')
  async getPendingInvitations(@Request() req): Promise<CollaborationSession[]> {
    return this.collaborationService.getPendingInvitations(req.user.id);
  }

  @Get('sessions/:id')
  async getSession(
    @Request() req,
    @Param('id') sessionId: string,
  ): Promise<CollaborationSession> {
    return this.collaborationService.getSession(sessionId, req.user.id);
  }

  @Put('sessions/:id/content')
  async updateContent(
    @Request() req,
    @Param('id') sessionId: string,
    @Body() updateContentDto: UpdateContentDto,
  ): Promise<CollaborationSession> {
    return this.collaborationService.updateContent(sessionId, req.user.id, updateContentDto);
  }

  @Post('sessions/:id/invite')
  async inviteCollaborator(
    @Request() req,
    @Param('id') sessionId: string,
    @Body() inviteDto: InviteCollaboratorDto,
  ) {
    return this.collaborationService.inviteCollaborator(sessionId, req.user.id, inviteDto);
  }

  @Post('sessions/:id/approve')
  async approveCollaboration(
    @Request() req,
    @Param('id') sessionId: string,
  ) {
    return this.collaborationService.approveCollaboration(sessionId, req.user.id);
  }

  @Post('sessions/:id/ownership')
  async proposeOwnership(
    @Request() req,
    @Param('id') sessionId: string,
    @Body() proposalDto: OwnershipProposalDto,
  ): Promise<CollaborationSession> {
    return this.collaborationService.proposeOwnership(sessionId, req.user.id, proposalDto);
  }

  // TODO: RETURN TYPE SET TO VOID FOR TESTING
  @Put('sessions/:id')
  async updateSession(
    @Request() req,
    @Param('id') sessionId: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<CollaborationSession> {
    // Implementation for updating session metadata
    // You'll need to add this method to your service
    return this.collaborationService.updateSession(sessionId, req.user.id, updateSessionDto);
  }

  @Delete('sessions/:id')
  async leaveSession(
    @Request() req,
    @Param('id') sessionId: string,
  ) {
    // Implementation for leaving a session
    // You'll need to add this method to your service
    return this.collaborationService.leaveSession(sessionId, req.user.id);
  }
}
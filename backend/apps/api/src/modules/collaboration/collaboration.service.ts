import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { PoemsService } from '../poems/poems.service';
import { NotificationService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { 
  CollaborationSession, 
  CreateSessionDto, 
  UpdateSessionDto, 
  InviteCollaboratorDto,
  OwnershipProposalDto,
  UpdateContentDto 
} from './dto/collaboration.dto';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);
  
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private poemsService: PoemsService,
    private notificationService: NotificationService,
    private emailService: EmailService,
  ) {}

  async createSession(userId: string, createSessionDto: CreateSessionDto) {
    this.logger.log(`[createSession] Starting session creation for user: ${userId}`);
    this.logger.debug(`[createSession] DTO: ${JSON.stringify(createSessionDto)}`);

    // Check if user exists
    this.logger.log(`[createSession] Checking if user exists: ${userId}`);
    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.error(`[createSession] User not found: ${userId}`);
      throw new NotFoundException('User not found');
    }
    this.logger.log(`[createSession] User found: ${user.username}`);

    // Create the collaboration session (as a poem with collaborative flag)
    this.logger.log(`[createSession] Creating collaborative session in database`);
    try {
      const session = await this.prisma.poem.create({
        data: {
          title: createSessionDto.title,
          content: createSessionDto.content || '',
          excerpt: createSessionDto.content ? createSessionDto.content.substring(0, 150) : '',
          authorId: userId,
          isCollaborative: true,
          status: 'DRAFT',
          tags: createSessionDto.tags || [],
          // Create initial collaborator entry for the owner
          collaborators: {
            create: {
              userId: userId,
              sharePercentage: 100, // Owner starts with 100%
              contributionType: 'ORIGINAL',
              contributionHash: this.generateContributionHash(userId, createSessionDto.content || ''),
              approvalStatus: 'APPROVED',
            },
          },
        },
        include: {
          collaborators: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });
      this.logger.log(`[createSession] Session created successfully with ID: ${session.id}`);

      // Create notification
      this.logger.log(`[createSession] Creating notification for session creation`);
      await this.notificationService.createNotification({
        userId,
        type: 'COLLABORATION_INVITE',
        title: 'Collaboration Session Created',
        message: `You started a new collaboration: "${createSessionDto.title}"`,
        relatedPoemId: session.id,
      });
      this.logger.log(`[createSession] Notification created successfully`);

      this.logger.log(`[createSession] Session creation completed successfully`);
      return this.mapToCollaborationSession(session);
    } catch (error) {
      this.logger.error(`[createSession] Failed to create session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async inviteCollaborator(
    sessionId: string, 
    inviterId: string, 
    inviteDto: InviteCollaboratorDto
  ) {
    this.logger.log(`[inviteCollaborator] Starting collaborator invitation for session: ${sessionId} by user: ${inviterId}`);
    this.logger.debug(`[inviteCollaborator] Invite DTO: ${JSON.stringify(inviteDto)}`);

    // Verify session exists and inviter is owner/collaborator
    this.logger.log(`[inviteCollaborator] Verifying session access for inviter: ${inviterId}`);
    const session = await this.prisma.poem.findFirst({
      where: {
        id: sessionId,
        isCollaborative: true,
        OR: [
          { authorId: inviterId },
          { collaborators: { some: { userId: inviterId, approvalStatus: 'APPROVED' } } },
        ],
      },
      include: {
        collaborators: true,
      },
    });

    if (!session) {
      this.logger.error(`[inviteCollaborator] Session not found or access denied: ${sessionId} for user: ${inviterId}`);
      throw new NotFoundException('Collaboration session not found or access denied');
    }
    this.logger.log(`[inviteCollaborator] Session verified: ${session.title}`);

    // Check if user being invited exists by email or username
    this.logger.log(`[inviteCollaborator] Looking up invited user by identifier: ${inviteDto.inviteeIdentifier}`);
    const invitedUser = await this.usersService.findByEmailOrUsername(inviteDto.inviteeIdentifier);
    if (!invitedUser) {
      this.logger.error(`[inviteCollaborator] User not found with identifier: ${inviteDto.inviteeIdentifier}`);
      throw new NotFoundException('User not found with the provided email or username');
    }
    this.logger.log(`[inviteCollaborator] Invited user found: ${invitedUser.username} (${invitedUser.id})`);

    // Check if user is already a collaborator
    this.logger.log(`[inviteCollaborator] Checking if user is already a collaborator`);
    const existingCollaborator = session.collaborators.find(
      (collab) => collab.userId === invitedUser.id,
    );

    if (existingCollaborator) {
      this.logger.error(`[inviteCollaborator] User already a collaborator: ${invitedUser.id}`);
      throw new ConflictException('User is already a collaborator in this session');
    }
    this.logger.log(`[inviteCollaborator] User is not already a collaborator`);

    // Create collaborator invitation
    this.logger.log(`[inviteCollaborator] Creating collaborator invitation in database`);
    try {
      const collaborator = await this.prisma.collaborator.create({
        data: {
          poemId: sessionId,
          userId: invitedUser.id,
          sharePercentage: 0, // Will be set through ownership proposal
          contributionType: 'COLLABORATION',
          contributionHash: this.generateInvitationHash(sessionId, invitedUser.id),
          approvalStatus: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              email: true,
            },
          },
        },
      });
      this.logger.log(`[inviteCollaborator] Collaborator invitation created with ID: ${collaborator.id}`);

      // Send notification to invited user
      this.logger.log(`[inviteCollaborator] Sending notification to invited user: ${invitedUser.id}`);
      await this.notificationService.createNotification({
        userId: invitedUser.id,
        type: 'COLLABORATION_INVITE',
        title: 'Collaboration Invitation',
        message: `You've been invited to collaborate on "${session.title}"`,
        relatedPoemId: sessionId,
        relatedUserId: inviterId,
      });
      this.logger.log(`[inviteCollaborator] Notification sent successfully`);

      // Send email notification
      if (invitedUser.email) {
        this.logger.log(`[inviteCollaborator] Sending email invitation to: ${invitedUser.email}`);
        
        const inviter = await this.usersService.findById(inviterId);
        if (!inviter) {
          this.logger.error(`[inviteCollaborator] Inviter user not found: ${inviterId}`);
          throw new NotFoundException('Inviter user not found');
        }

        await this.emailService.sendCollaborationInvite({
          to: invitedUser.email,
          inviterName: inviter.username,
          sessionTitle: session.title,
          sessionId: sessionId,
        });
        this.logger.log(`[inviteCollaborator] Email invitation sent successfully`);
      } else {
        this.logger.log(`[inviteCollaborator] No email available for user, skipping email notification`);
      }

      this.logger.log(`[inviteCollaborator] Collaborator invitation process completed successfully`);
      return collaborator;
    } catch (error) {
      this.logger.error(`[inviteCollaborator] Failed to create collaborator invitation: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateContent(sessionId: string, userId: string, updateContentDto: UpdateContentDto) {
    this.logger.log(`[updateContent] Starting content update for session: ${sessionId} by user: ${userId}`);
    this.logger.debug(`[updateContent] Content length: ${updateContentDto.content.length}`);

    // Verify user is an approved collaborator
    this.logger.log(`[updateContent] Verifying user collaboration status`);
    const collaboration = await this.prisma.collaborator.findFirst({
      where: {
        poemId: sessionId,
        userId: userId,
        approvalStatus: 'APPROVED',
      },
      include: {
        poem: true,
      },
    });

    if (!collaboration) {
      this.logger.error(`[updateContent] Collaboration not found or user not approved: session=${sessionId}, user=${userId}`);
      throw new NotFoundException('Collaboration session not found or access denied');
    }
    this.logger.log(`[updateContent] User collaboration verified`);

    try {
      // Update poem content
      this.logger.log(`[updateContent] Updating poem content in database`);
      const updatedSession = await this.prisma.poem.update({
        where: { id: sessionId },
        data: {
          content: updateContentDto.content,
          excerpt: updateContentDto.content.substring(0, 150),
          updatedAt: new Date(),
        },
        include: {
          collaborators: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });
      this.logger.log(`[updateContent] Poem content updated successfully`);

      // Update collaborator contribution metrics
      this.logger.log(`[updateContent] Updating collaborator contribution metrics`);
      await this.prisma.collaborator.update({
        where: {
          id: collaboration.id,
        },
        data: {
          contributionHash: this.generateContributionHash(userId, updateContentDto.content),
          contributedAt: new Date(),
        },
      });
      this.logger.log(`[updateContent] Collaborator metrics updated successfully`);

      this.logger.log(`[updateContent] Content update completed successfully`);
      return this.mapToCollaborationSession(updatedSession);
    } catch (error) {
      this.logger.error(`[updateContent] Failed to update content: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateSession(sessionId: string, userId: string, updateSessionDto: UpdateSessionDto) {
    this.logger.log(`[updateSession] Starting session update for session: ${sessionId} by user: ${userId}`);
    this.logger.debug(`[updateSession] Update DTO: ${JSON.stringify(updateSessionDto)}`);

    // Verify user has access to the session
    this.logger.log(`[updateSession] Verifying user access to session`);
    const collaboration = await this.prisma.collaborator.findFirst({
      where: {
        poemId: sessionId,
        userId: userId,
        approvalStatus: 'APPROVED',
      },
    });

    if (!collaboration) {
      this.logger.error(`[updateSession] User does not have access to session: ${sessionId}`);
      throw new NotFoundException('Session not found or access denied');
    }

    try {
      // Update session metadata
      this.logger.log(`[updateSession] Updating session metadata in database`);
      const updatedSession = await this.prisma.poem.update({
        where: { id: sessionId },
        data: {
          title: updateSessionDto.title,
          // Add other fields as needed
          updatedAt: new Date(),
        },
        include: {
          collaborators: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });
      this.logger.log(`[updateSession] Session metadata updated successfully`);

      this.logger.log(`[updateSession] Session update completed successfully`);
      return this.mapToCollaborationSession(updatedSession);
    } catch (error) {
      this.logger.error(`[updateSession] Failed to update session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async leaveSession(sessionId: string, userId: string) {
    this.logger.log(`[leaveSession] User ${userId} leaving session: ${sessionId}`);

    try {
      // Remove user from collaborators
      this.logger.log(`[leaveSession] Removing user from collaborators`);
      const result = await this.prisma.collaborator.deleteMany({
        where: {
          poemId: sessionId,
          userId: userId,
        },
      });

      if (result.count === 0) {
        this.logger.warn(`[leaveSession] User was not a collaborator in session: ${sessionId}`);
        throw new NotFoundException('User is not a collaborator in this session');
      }

      this.logger.log(`[leaveSession] User successfully removed from session`);
      
      // Notify session owner about user leaving
      const session = await this.prisma.poem.findFirst({
        where: { id: sessionId },
        select: { authorId: true, title: true }
      });

      if (session && session.authorId !== userId) {
        this.logger.log(`[leaveSession] Sending notification to session owner`);
        await this.notificationService.createNotification({
          userId: session.authorId,
          type: 'COLLABORATION_UPDATE',
          title: 'Collaborator Left',
          message: `A collaborator has left your session: "${session.title}"`,
          relatedPoemId: sessionId,
          relatedUserId: userId,
        });
      }

      this.logger.log(`[leaveSession] Session leave process completed successfully`);
      return { success: true, message: 'Successfully left the collaboration session' };
    } catch (error) {
      this.logger.error(`[leaveSession] Failed to leave session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async proposeOwnership(sessionId: string, userId: string, proposalDto: OwnershipProposalDto) {
    this.logger.log(`[proposeOwnership] Starting ownership proposal for session: ${sessionId} by user: ${userId}`);
    this.logger.debug(`[proposeOwnership] Proposal DTO: ${JSON.stringify(proposalDto)}`);

    // Verify user is the owner or has permission
    this.logger.log(`[proposeOwnership] Verifying user ownership of session`);
    const session = await this.prisma.poem.findFirst({
      where: {
        id: sessionId,
        authorId: userId, // Only owner can propose ownership
      },
      include: {
        collaborators: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!session) {
      this.logger.error(`[proposeOwnership] Session not found or user is not owner: session=${sessionId}, user=${userId}`);
      throw new NotFoundException('Session not found or you are not the owner');
    }
    this.logger.log(`[proposeOwnership] User ownership verified`);

    // Validate total shares equal 100
    this.logger.log(`[proposeOwnership] Validating total shares percentage`);
    const totalShares = proposalDto.splits.reduce((sum, split) => sum + split.sharePercentage, 0);
    this.logger.debug(`[proposeOwnership] Total shares calculated: ${totalShares}%`);
    
    if (Math.abs(totalShares - 100) > 0.01) {
      this.logger.error(`[proposeOwnership] Invalid total shares: ${totalShares}% (must be 100%)`);
      throw new BadRequestException('Total share percentage must equal 100%');
    }
    this.logger.log(`[proposeOwnership] Total shares validation passed`);

    try {
      // Update collaborator shares
      this.logger.log(`[proposeOwnership] Updating collaborator shares in database`);
      const updatePromises = proposalDto.splits.map((split) =>
        this.prisma.collaborator.updateMany({
          where: {
            poemId: sessionId,
            userId: split.userId,
          },
          data: {
            sharePercentage: split.sharePercentage,
          },
        }),
      );

      await Promise.all(updatePromises);
      this.logger.log(`[proposeOwnership] Collaborator shares updated successfully`);

      // Notify all collaborators about ownership proposal
      this.logger.log(`[proposeOwnership] Sending notifications to collaborators`);
      const notificationPromises = session.collaborators
        .filter(collab => collab.userId !== userId) // Don't notify self
        .map(collab =>
          this.notificationService.createNotification({
            userId: collab.userId,
            type: 'COLLABORATION_INVITE', // You might want a specific type for ownership
            title: 'Ownership Proposal',
            message: `New ownership shares proposed for "${session.title}"`,
            relatedPoemId: sessionId,
            relatedUserId: userId,
          }),
        );

      await Promise.all(notificationPromises);
      this.logger.log(`[proposeOwnership] Notifications sent successfully`);

      this.logger.log(`[proposeOwnership] Ownership proposal completed successfully`);
      return this.getSession(sessionId, userId);
    } catch (error) {
      this.logger.error(`[proposeOwnership] Failed to propose ownership: ${error.message}`, error.stack);
      throw error;
    }
  }

  async approveCollaboration(sessionId: string, userId: string) {
    this.logger.log(`[approveCollaboration] User ${userId} approving collaboration for session: ${sessionId}`);

    // Find pending collaboration invitation
    this.logger.log(`[approveCollaboration] Finding pending collaboration invitation`);
    const collaborator = await this.prisma.collaborator.findFirst({
      where: {
        poemId: sessionId,
        userId: userId,
        approvalStatus: 'PENDING',
      },
    });

    if (!collaborator) {
      this.logger.error(`[approveCollaboration] Pending collaboration invitation not found: session=${sessionId}, user=${userId}`);
      throw new NotFoundException('Pending collaboration invitation not found');
    }
    this.logger.log(`[approveCollaboration] Pending invitation found with ID: ${collaborator.id}`);

    try {
      // Update collaboration status to approved
      this.logger.log(`[approveCollaboration] Updating collaboration status to APPROVED`);
      const updatedCollaborator = await this.prisma.collaborator.update({
        where: { id: collaborator.id },
        data: {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          poem: true,
        },
      });
      this.logger.log(`[approveCollaboration] Collaboration status updated successfully`);

      // Notify session owner
      this.logger.log(`[approveCollaboration] Sending notification to session owner: ${updatedCollaborator.poem.authorId}`);
      await this.notificationService.createNotification({
        userId: updatedCollaborator.poem.authorId,
        type: 'COLLABORATION_APPROVED',
        title: 'Collaboration Approved',
        message: `${updatedCollaborator.user.username} accepted your collaboration invitation`,
        relatedPoemId: sessionId,
        relatedUserId: userId,
      });
      this.logger.log(`[approveCollaboration] Owner notification sent successfully`);

      this.logger.log(`[approveCollaboration] Collaboration approval completed successfully`);
      return updatedCollaborator;
    } catch (error) {
      this.logger.error(`[approveCollaboration] Failed to approve collaboration: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSession(sessionId: string, userId: string) {
    this.logger.log(`[getSession] Retrieving session: ${sessionId} for user: ${userId}`);

    try {
      const session = await this.prisma.poem.findFirst({
        where: {
          id: sessionId,
          isCollaborative: true,
          OR: [
            { authorId: userId },
            { collaborators: { some: { userId: userId } } },
          ],
        },
        include: {
          collaborators: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                  email: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              collaborators: true,
            },
          },
        },
      });

      if (!session) {
        this.logger.error(`[getSession] Session not found or access denied: ${sessionId} for user: ${userId}`);
        throw new NotFoundException('Collaboration session not found');
      }

      this.logger.log(`[getSession] Session retrieved successfully: ${session.title}`);
      this.logger.debug(`[getSession] Session has ${session._count.collaborators} collaborators`);
      
      return this.mapToCollaborationSession(session);
    } catch (error) {
      this.logger.error(`[getSession] Failed to retrieve session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserSessions(userId: string) {
    this.logger.log(`[getUserSessions] Retrieving all sessions for user: ${userId}`);

    try {
      const sessions = await this.prisma.poem.findMany({
        where: {
          isCollaborative: true,
          OR: [
            { authorId: userId },
            { collaborators: { some: { userId: userId } } },
          ],
        },
        include: {
          collaborators: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              collaborators: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      this.logger.log(`[getUserSessions] Retrieved ${sessions.length} sessions for user: ${userId}`);
      
      return sessions.map(session => this.mapToCollaborationSession(session));
    } catch (error) {
      this.logger.error(`[getUserSessions] Failed to retrieve user sessions: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPendingInvitations(userId: string) {
    this.logger.log(`[getPendingInvitations] Retrieving pending invitations for user: ${userId}`);

    try {
      const pendingCollaborations = await this.prisma.collaborator.findMany({
        where: {
          userId: userId,
          approvalStatus: 'PENDING',
        },
        include: {
          poem: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
              collaborators: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      this.logger.log(`[getPendingInvitations] Found ${pendingCollaborations.length} pending invitations for user: ${userId}`);
      
      return pendingCollaborations.map(collab => 
        this.mapToCollaborationSession(collab.poem)
      );
    } catch (error) {
      this.logger.error(`[getPendingInvitations] Failed to retrieve pending invitations: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapToCollaborationSession(poem: any): CollaborationSession {
    this.logger.debug(`[mapToCollaborationSession] Mapping poem to collaboration session: ${poem.id}`);
    
    const session = {
      id: poem.id,
      title: poem.title,
      content: poem.content,
      createdAt: poem.createdAt,
      updatedAt: poem.updatedAt,
      status: poem.status.toLowerCase() as any,
      participants: poem.collaborators.map(collab => ({
        userId: collab.userId,
        username: collab.user.username,
        avatarUrl: collab.user.avatarUrl,
        sharePercentage: Number(collab.sharePercentage),
        contributionType: collab.contributionType.toLowerCase() as any,
        contributionHash: collab.contributionHash,
        contributedAt: collab.contributedAt,
        approvalStatus: collab.approvalStatus.toLowerCase() as any,
        isOnline: false, // You'd integrate with real-time service
        cursorPosition: null,
        charactersAdded: 0,
        linesAdded: 0,
        editsCount: 0,
      })),
      ownerId: poem.authorId,
      versionHistory: [], // You'd implement version history separately
      currentVersion: '1.0',
      ownershipProposal: null, // You'd implement ownership proposals
      totalShares: poem.collaborators.reduce((sum, collab) => 
        sum + Number(collab.sharePercentage), 0
      ),
      publishedAt: poem.publishedAt,
      nftTokenId: poem.nftTokenId,
    };

    this.logger.debug(`[mapToCollaborationSession] Session mapped successfully with ${session.participants.length} participants`);
    return session;
  }

  private generateContributionHash(userId: string, content: string): string {
    this.logger.debug(`[generateContributionHash] Generating hash for user: ${userId}, content length: ${content.length}`);
    const hash = `hash_${userId}_${Date.now()}_${Buffer.from(content).toString('base64').substring(0, 10)}`;
    this.logger.debug(`[generateContributionHash] Generated hash: ${hash}`);
    return hash;
  }

  private generateInvitationHash(sessionId: string, userId: string): string {
    this.logger.debug(`[generateInvitationHash] Generating invitation hash for session: ${sessionId}, user: ${userId}`);
    const hash = `invite_${sessionId}_${userId}_${Date.now()}`;
    this.logger.debug(`[generateInvitationHash] Generated invitation hash: ${hash}`);
    return hash;
  }
}
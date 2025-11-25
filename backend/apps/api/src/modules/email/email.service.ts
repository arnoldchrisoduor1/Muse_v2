import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendCollaborationInvite(data: {
    to: string;
    inviterName: string;
    sessionTitle: string;
    sessionId: string;
  }) {
    // Implement your email sending logic
    console.log(`Sending collaboration invite to ${data.to}`);
    // Use Nodemailer, SendGrid, etc.
  }
}
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MentorshipController } from './mentorship.controller';
import { MentorshipService } from './mentorship.service';
import { MentorshipGateway } from './mentorship.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AgoraModule } from '../agora/agora.module';
import { MailerModule } from '../mailer/mailer.module';
import { SessionReminderService } from './session-reminder.service';

@Module({
  imports: [
    PrismaModule,
    AgoraModule,
    MailerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [MentorshipController],
  providers: [MentorshipService, MentorshipGateway, SessionReminderService],
  exports: [MentorshipService],
})
export class MentorshipModule {}

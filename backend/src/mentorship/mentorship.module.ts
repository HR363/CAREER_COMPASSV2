import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MentorshipController } from './mentorship.controller';
import { MentorshipService } from './mentorship.service';
import { MentorshipGateway } from './mentorship.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AgoraModule } from '../agora/agora.module';

@Module({
  imports: [
    PrismaModule,
    AgoraModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [MentorshipController],
  providers: [MentorshipService, MentorshipGateway],
  exports: [MentorshipService],
})
export class MentorshipModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AiModule } from './ai/ai.module';
import { MentorshipModule } from './mentorship/mentorship.module';
import { AdminModule } from './admin/admin.module';
import { AgoraModule } from './agora/agora.module';
import { MessagesModule } from './messages/messages.module';
import { MailerModule } from './mailer/mailer.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    MailerModule,
    AgoraModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    AiModule,
    MentorshipModule,
    AdminModule,
    MessagesModule,
  ],
})
export class AppModule {}

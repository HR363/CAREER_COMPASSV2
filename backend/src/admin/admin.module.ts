import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AgoraModule } from '../agora/agora.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [AgoraModule, MailerModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

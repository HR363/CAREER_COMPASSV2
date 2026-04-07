import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class SessionReminderService {
  private readonly logger = new Logger(SessionReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendThirtyMinuteReminders(): Promise<void> {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 29 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 30 * 60 * 1000);

    const sessions = await this.prisma.session.findMany({
      where: {
        status: 'SCHEDULED',
        reminderSentAt: null,
        scheduledAt: {
          gt: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        mentor: {
          select: { id: true, name: true, email: true },
        },
        attendees: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    for (const session of sessions) {
      const claim = await this.prisma.session.updateMany({
        where: {
          id: session.id,
          reminderSentAt: null,
        },
        data: {
          reminderSentAt: new Date(),
        },
      });

      if (claim.count === 0) {
        continue;
      }

      const recipients = [session.mentor, ...session.attendees].filter((user) => Boolean(user.email));
      await Promise.allSettled(
        recipients.map((user) =>
          this.mailerService.sendSessionReminderEmail({
            to: user.email,
            recipientName: user.name,
            topic: session.topic || 'Mentorship Session',
            scheduledAt: session.scheduledAt,
            mentorName: session.mentor.name,
          }),
        ),
      );

      this.logger.log(`Sent 30-minute reminder for session ${session.id}`);
    }
  }
}

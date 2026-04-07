import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter?: Transporter;
  private readonly sender: string;
  private isEnabled: boolean;

  private parseBoolean(value: string | undefined): boolean | undefined {
    if (!value) {
      return undefined;
    }

    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }
    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }

    return undefined;
  }

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST')?.trim();
    const user = this.configService.get<string>('MAIL_USER')?.trim();
    const pass = this.configService.get<string>('MAIL_PASS')?.trim();
    const from = this.configService.get<string>('MAIL_FROM')?.trim() || user;
    const service = this.configService.get<string>('MAIL_SERVICE')?.trim();
    const port = Number(this.configService.get<string>('MAIL_PORT')?.trim() || 587);
    const secureFromEnv = this.parseBoolean(this.configService.get<string>('MAIL_SECURE'));
    const secure = secureFromEnv ?? port === 465;

    this.sender = from || '';
    this.isEnabled = Boolean(host && user && pass && this.sender);

    if (!this.isEnabled) {
      this.logger.warn('Mailer is disabled: set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM to enable notifications.');
      return;
    }

    const transportConfig: any = {
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    };

    if (service) {
      transportConfig.service = service;
    }

    this.transporter = createTransport(transportConfig);

    this.transporter
      .verify()
      .then(() => {
        this.logger.log(`Mailer connected successfully via ${host}:${port}`);
      })
      .catch((error) => {
        this.isEnabled = false;
        this.logger.error('Mailer authentication failed. Disabling mailer until restart and config fix.', error instanceof Error ? error.stack : undefined);
      });
  }

  async sendSessionReminderEmail(input: {
    to: string;
    recipientName: string;
    topic: string;
    scheduledAt: Date;
    mentorName: string;
  }): Promise<void> {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(input.scheduledAt);

    const subject = `Session Reminder: ${input.topic}`;
    const text = [
      `Hi ${input.recipientName},`,
      '',
      `Your mentorship session "${input.topic}" is scheduled for ${formattedDate}.`,
      `Mentor: ${input.mentorName}`,
      '',
      'Please log in to CareerCompass a few minutes early to join the session.',
      '',
      'Best regards,',
      'CareerCompass Team',
    ].join('\n');

    await this.sendMail({
      to: input.to,
      subject,
      text,
    });
  }

  async sendMentorApplicationReviewedEmail(input: {
    to: string;
    recipientName: string;
    status: string;
  }): Promise<void> {
    const normalizedStatus = input.status.toUpperCase();
    const isApproved = normalizedStatus === 'APPROVED';
    const subject = isApproved
      ? 'Mentor Application Approved'
      : 'Mentor Application Update';

    const decisionMessage = isApproved
      ? 'Congratulations. Your mentor application has been approved, and your account has been upgraded to mentor access.'
      : `Your mentor application was reviewed with status: ${normalizedStatus}.`;

    const text = [
      `Hi ${input.recipientName},`,
      '',
      decisionMessage,
      '',
      'You can log in to CareerCompass to view the latest status and next steps.',
      '',
      'Best regards,',
      'CareerCompass Team',
    ].join('\n');

    await this.sendMail({
      to: input.to,
      subject,
      text,
    });
  }

  private async sendMail(input: { to: string; subject: string; text: string }): Promise<void> {
    if (!this.isEnabled || !this.transporter) {
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.sender,
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Invalid login') || message.includes('535')) {
        this.isEnabled = false;
        this.logger.error('SMTP credentials were rejected (535). Mailer has been disabled until restart and credential update.');
      }
      this.logger.error(`Failed to send email to ${input.to}`, error instanceof Error ? error.stack : undefined);
    }
  }
}

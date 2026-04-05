import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

@Injectable()
export class AgoraService {
  private appId: string;
  private appCertificate: string;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get<string>('AGORA_APP_ID');
    this.appCertificate = this.configService.get<string>('AGORA_APP_CERTIFICATE');
  }

  /**
   * Generate RTC token for video call
   * @param channelName - Unique channel identifier (session ID)
   * @param uid - User ID (0 for auto-assignment)
   * @param role - Publisher or Subscriber
   * @param expirationTimeInSeconds - Token validity duration (default 3600s = 1 hour)
   */
  generateRtcToken(
    channelName: string,
    uid: number = 0,
    role: 'publisher' | 'subscriber' = 'publisher',
    expirationTimeInSeconds: number = 3600,
  ): string {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    return RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      rtcRole,
      privilegeExpiredTs,
    );
  }

  /**
   * Get Agora App ID (safe to expose to frontend)
   */
  getAppId(): string {
    return this.appId;
  }
}

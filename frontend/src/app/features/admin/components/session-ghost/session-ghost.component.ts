import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import AgoraRTC, { IAgoraRTCClient, IRemoteAudioTrack, IRemoteVideoTrack, UID } from 'agora-rtc-sdk-ng';
import { environment } from '../../../../../environments/environment';

interface RemoteUser {
    uid: UID;
    audioTrack?: IRemoteAudioTrack;
    videoTrack?: IRemoteVideoTrack;
}

@Component({
  selector: 'app-session-ghost',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-ghost.component.html',
  styleUrls: ['./session-ghost.component.scss']
})
export class SessionGhostComponent implements OnInit, OnDestroy {
  sessionId: string = '';
  client!: IAgoraRTCClient;
  remoteUsers: RemoteUser[] = [];
  
  isLoading = true;
  error = '';
  isJoined = false;

  constructor(
      private route: ActivatedRoute,
      private adminService: AdminService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.sessionId) {
        this.error = 'Invalid session ID';
        this.isLoading = false;
        return;
    }
    
    // Initialize the Ghost mode
    this.joinAsGhost();
  }

  async joinAsGhost(): Promise<void> {
      this.isLoading = true;
      try {
        // Initialize Agora Audience Client (Admin will not publish)
        this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8', role: 'audience' });
        this.setupEventListeners();

        // Retrieve ghost token safely designated as an audience
        const response: any = await this.adminService.getSessionGhostToken(this.sessionId).toPromise();
        const token = response.token;
        const roomId = response.roomId;
        const appId = response.appId || 'default-fall-back-id'; // using backend provided appid or default

        // Join channel seamlessly and cleanly with UID 0 (so Agora allocates a random one silently)
        await this.client.join(appId, roomId, token, 0);
        
        this.isJoined = true;
        this.isLoading = false;
        console.log('Successfully infiltrated session dynamically (Ghost mode active).');
      } catch(err) {
        console.error('Failed to ghost session', err);
        this.error = 'Failed to join session ' + err;
        this.isLoading = false;
      }
  }

  private setupEventListeners(): void {
    this.client.on('user-published', async (user, mediaType) => {
        await this.client.subscribe(user, mediaType);
        console.log('Ghost Mode: Subscribed to ', user.uid);

        if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack;
            const uidStr = user.uid.toString();
            
            // Allow angular to update view so DOM mounts the player container first
            setTimeout(() => {
                const playerContainer = document.getElementById(`video-ghost-${uidStr}`);
                if (playerContainer && remoteVideoTrack) {
                    remoteVideoTrack.play(playerContainer);
                }
            }, 0);
        }

        if (mediaType === 'audio') {
            user.audioTrack?.play();
        }

        this.updateRemoteUser(user);
    });

    this.client.on('user-unpublished', (user, mediaType) => {
        if(mediaType === 'video' && user.videoTrack) user.videoTrack.stop();
        if(mediaType === 'audio' && user.audioTrack) user.audioTrack.stop();
        console.log('Ghost Mode: Unsubscribed from ', user.uid);
    });

    this.client.on('user-joined', (user) => {
        this.remoteUsers.push({ uid: user.uid });
    });

    this.client.on('user-left', (user) => {
        this.remoteUsers = this.remoteUsers.filter(u => u.uid !== user.uid);
    });
  }

  private updateRemoteUser(user: any): void {
      const existingUser = this.remoteUsers.find(u => u.uid === user.uid);
      if (existingUser) {
          existingUser.audioTrack = user.audioTrack;
          existingUser.videoTrack = user.videoTrack;
      }
  }

  leaveGhostMode(): void {
      this.client?.leave();
      this.isJoined = false;
      this.remoteUsers = [];
      this.router.navigate(['/admin']);
  }

  ngOnDestroy(): void {
      if (this.isJoined) {
          this.leaveGhostMode();
      }
  }
}

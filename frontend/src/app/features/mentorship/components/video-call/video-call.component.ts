import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MentorshipService, Session } from '../../../../core/services/mentorship.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="video-call-container">
      <!-- Ambient Background -->
      <div class="ambient-bg"></div>

      <!-- Main Video Area (Remote or Waiting State) -->
      <div class="main-stage">
        <!-- Remote Video Stream -->
        <video #remoteVideo 
               class="remote-video"
               autoplay 
               playsinline
               [class.hidden]="!isRemoteVideoActive">
        </video>

        <!-- Remote Audio Only State (Connected but no video) -->
        <div *ngIf="isRemoteConnected && !isRemoteVideoActive" class="waiting-state fade-in">
          <div class="waiting-avatar-container">
            <div class="waiting-avatar">
              {{ (session?.mentor?.id === authService.getCurrentUser()?.id ? session?.student?.name?.charAt(0) : session?.mentor?.name?.charAt(0)) || '?' }}
            </div>
            <div class="pulse-ring ring-1" style="border-color: #10b981;"></div>
          </div>
          <h2 class="waiting-text">{{ (session?.mentor?.id === authService.getCurrentUser()?.id ? session?.student?.name : session?.mentor?.name) || 'User' }}</h2>
          <div class="audio-only-badge">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            <span>Audio Only</span>
          </div>
        </div>
        
        <!-- Waiting State (Not Connected) -->
        <div *ngIf="!isRemoteConnected" class="waiting-state fade-in">
          <div class="waiting-avatar-container">
            <div class="waiting-avatar">
              {{ (session?.mentor?.id === authService.getCurrentUser()?.id ? session?.student?.name?.charAt(0) : session?.mentor?.name?.charAt(0)) || '?' }}
            </div>
            <div class="pulse-ring ring-1"></div>
            <div class="pulse-ring ring-2"></div>
          </div>
          <h2 class="waiting-text">Waiting for {{ (session?.mentor?.id === authService.getCurrentUser()?.id ? session?.student?.name : session?.mentor?.name) || 'participant' }}...</h2>
          <p class="waiting-subtext">The session will begin automatically when they join.</p>
        </div>
      </div>

      <!-- Header Info -->
      <div class="call-header slide-down">
        <div class="header-content glass-panel">
          <div class="participant-info">
            <h1 class="font-medium">{{ session?.mentor?.name }} & {{ session?.student?.name }}</h1>
            <div class="status-badge">
              <span class="status-dot" [class.bg-green-500]="isRemoteConnected" [class.bg-yellow-500]="!isRemoteConnected"></span>
              {{ isRemoteConnected ? 'Connected' : 'Waiting' }}
            </div>
          </div>
          <div class="timer" *ngIf="isRemoteConnected">
            {{ sessionDuration }}
          </div>
        </div>
      </div>

      <!-- Floating Local Video (PiP) -->
      <div class="local-video-pip shadow-2xl" [class.hidden]="!isVideoEnabled">
        <video #localVideo 
               class="local-video"
               autoplay 
               playsinline 
               muted>
        </video>
        <div class="pip-label">You</div>
      </div>
      
      <!-- Local Video Placeholder (when camera off) -->
      <div class="local-video-pip placeholder shadow-2xl" *ngIf="!isVideoEnabled">
        <div class="avatar-placeholder">
          {{ authService.getCurrentUser()?.name?.charAt(0) || 'U' }}
        </div>
        <div class="pip-label">Camera Off</div>
      </div>

      <!-- Chat Interface (Slide Over) -->
      <div class="chat-sidebar glass-panel" [class.chat-open]="isChatOpen">
        <div class="chat-header">
          <h3>Session Chat</h3>
          <button class="close-btn" (click)="toggleChat()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="chat-messages custom-scrollbar" #chatContainer>
          <div *ngFor="let message of chatMessages" class="message-group" [class.my-message]="message.isFromUser">
            <div class="message-bubble">
              {{ message.content }}
            </div>
            <span class="message-time">{{ message.timestamp | date:'shortTime' }}</span>
          </div>
          
          <div *ngIf="chatMessages.length === 0" class="empty-chat">
            <p>Send a message to start the conversation</p>
          </div>
        </div>

        <div class="chat-input-area">
          <input type="text" 
                 [(ngModel)]="chatMessage"
                 (keydown.enter)="sendChatMessage()"
                 placeholder="Type a message..."
                 class="chat-input glass-input">
          <button (click)="sendChatMessage()" [disabled]="!chatMessage.trim()" class="send-btn">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </div>
      </div>

      <!-- Bottom Controls -->
      <div class="controls-bar-container slide-up">
        <div class="controls-bar glass-panel">
          <button (click)="toggleMute()" 
                  [class.active]="!isMuted"
                  [class.danger]="isMuted"
                  class="control-btn"
                  title="Toggle Microphone">
            <svg *ngIf="!isMuted" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            <svg *ngIf="isMuted" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
          </button>

          <button (click)="toggleVideo()" 
                  [class.active]="isVideoEnabled"
                  [class.danger]="!isVideoEnabled"
                  class="control-btn"
                  title="Toggle Camera">
            <svg *ngIf="isVideoEnabled" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <svg *ngIf="!isVideoEnabled" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path></svg>
          </button>

          <button (click)="toggleChat()" 
                  [class.active]="isChatOpen"
                  class="control-btn relative"
                  title="Toggle Chat">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <span *ngIf="hasUnreadMessages" class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-secondary-800"></span>
          </button>

          <div class="h-8 w-px bg-white/10 mx-2"></div>

          <button (click)="endCall()" 
                  class="control-btn danger-fill"
                  title="End Call">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.684A1 1 0 008.279 3H5z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    .video-call-container {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #0f1115;
      color: white;
      overflow: hidden;
    }

    .ambient-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 50%, #1f2937 0%, #000000 100%);
      opacity: 0.8;
      z-index: 1;
    }

    .main-stage {
      position: relative;
      width: 100%;
      height: 100%;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remote-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Glass Panels */
    .glass-panel {
      background: rgba(20, 20, 30, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    /* Header */
    .call-header {
      position: absolute;
      top: 24px;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: center;
      z-index: 20;
      pointer-events: none;
    }

    .header-content {
      padding: 12px 24px;
      border-radius: 99px;
      display: flex;
      align-items: center;
      gap: 24px;
      pointer-events: auto;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }

    .timer {
      font-family: 'Monaco', monospace;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
      padding-left: 24px;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Pip (Picture in Picture) */
    .local-video-pip {
      position: absolute;
      bottom: 120px;
      right: 32px;
      width: 280px;
      height: 157.5px; /* 16:9 aspect ratio */
      border-radius: 12px;
      overflow: hidden;
      z-index: 30;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      transition: all 0.3s ease;
      background: #1f2937;
    }

    .local-video-pip:hover {
      transform: scale(1.02);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .local-video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scaleX(-1); /* Mirror effect */
    }

    .pip-label {
      position: absolute;
      bottom: 8px;
      left: 8px;
      padding: 2px 8px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 4px;
      font-size: 0.75rem;
      color: white;
    }

    /* Controls Bar */
    .controls-bar-container {
      position: absolute;
      bottom: 32px;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: center;
      z-index: 40;
    }

    .controls-bar {
      padding: 12px 24px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .control-btn {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      color: white;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
    }

    .control-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .control-btn.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .control-btn.danger {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .control-btn.danger-fill {
      background: #ef4444;
      color: white;
    }

    .control-btn.danger-fill:hover {
      background: #dc2626;
    }

    /* Chat Sidebar */
    .chat-sidebar {
      position: absolute;
      top: 0;
      right: -360px;
      width: 360px;
      height: 100%;
      z-index: 35;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    .chat-sidebar.chat-open {
      transform: translateX(-360px);
    }

    .chat-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message-group {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      max-width: 85%;
    }

    .message-group.my-message {
      align-self: flex-end;
      align-items: flex-end;
    }

    .message-bubble {
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      border-bottom-left-radius: 2px;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .my-message .message-bubble {
      background: #4f46e5;
      color: white;
      border-radius: 12px;
      border-bottom-right-radius: 2px;
      border-bottom-left-radius: 12px;
    }

    .message-time {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.4);
      margin-top: 4px;
    }

    .chat-input-area {
      padding: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      gap: 10px;
    }

    .glass-input {
      flex: 1;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px 14px;
      color: white;
      outline: none;
      transition: border-color 0.2s;
    }

    .glass-input:focus {
      border-color: #6366f1;
    }

    .send-btn {
      padding: 10px;
      border-radius: 8px;
      background: #4f46e5;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .send-btn:hover {
      background: #4338ca;
    }

    .send-btn:disabled {
      background: rgba(255, 255, 255, 0.1);
      cursor: not-allowed;
      color: rgba(255, 255, 255, 0.3);
    }

    /* Waiting State Animations */
    .waiting-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .waiting-avatar-container {
      position: relative;
      width: 120px;
      height: 120px;
      margin-bottom: 32px;
    }

    .waiting-avatar {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 600;
      color: white;
      position: relative;
      z-index: 2;
    }

    .pulse-ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid rgba(99, 102, 241, 0.5);
      animation: pulse 2s infinite;
    }

    .ring-2 {
      animation-delay: 0.5s;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }

    .waiting-text {
      font-size: 1.5rem;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .waiting-subtext {
      color: rgba(255, 255, 255, 0.5);
    }

    .audio-only-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 6px 16px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 99px;
      color: #10b981;
      font-size: 0.9rem;
    }

    /* Utilities */
    .hidden { display: none !important; }
    
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.5);
    }

    /* Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  session: Session | null = null;
  
  // Agora RTC
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  
  // UI State
  isMuted = false;
  isVideoEnabled = true;
  isRemoteConnected = false;
  isRemoteVideoActive = false;
  isConnected = false;
  
  // Chat
  isChatOpen = false;
  hasUnreadMessages = false;
  chatMessages: Array<{content: string, isFromUser: boolean, timestamp: Date}> = [];
  chatMessage = '';

  // Timer
  sessionDuration = '00:00';
  private timerInterval: any;
  private startTime: number = 0;

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private mentorshipService: MentorshipService,
    private webSocketService: WebSocketService
  ) {}

  async ngOnInit(): Promise<void> {
    const sessionId = this.route.snapshot.paramMap.get('id');
    
    if (sessionId) {
      await this.loadSession(sessionId);
      await this.initializeAgoraCall();
      this.setupWebSocketListeners();
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.hasUnreadMessages = false;
      this.scrollChatToBottom();
    }
  }

  private startTimer(): void {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      this.sessionDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  private async loadSession(sessionId: string): Promise<void> {
    this.mentorshipService.getSession(sessionId).subscribe({
      next: (session: any) => {
        this.session = session;
        this.joinSession();
      },
      error: (error: any) => {
        console.error('Error loading session:', error);
        this.router.navigate(['/mentorship']);
      }
    });
  }

  private async initializeAgoraCall(): Promise<void> {
    try {
      const sessionId = this.route.snapshot.paramMap.get('id');
      if (!sessionId) return;

      // Get Agora credentials from backend
      const credentials: any = await this.mentorshipService.getVideoCallToken(sessionId).toPromise();
      
      // Create Agora client
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Set up event listeners
      this.setupAgoraEvents();

      // Join the channel
      await this.client.join(
        credentials.appId,
        credentials.channel,
        credentials.token,
        credentials.uid
      );

      // Create and publish local tracks
      [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

      // Play local video
      if (this.localVideo && this.localVideoTrack) {
        this.localVideoTrack.play(this.localVideo.nativeElement);
      }

      // Publish tracks
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      
      this.isConnected = true;

    } catch (error) {
      console.error('Error initializing Agora call:', error);
    }
  }

  private setupAgoraEvents(): void {
    if (!this.client) return;

    // Handle remote user joined
    this.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await this.client!.subscribe(user, mediaType);
      this.isRemoteConnected = true; // Mark as connected regardless of media type

      if (mediaType === 'video') {
        this.isRemoteVideoActive = true;
        setTimeout(() => {
          const remoteVideoTrack = user.videoTrack;
          if (remoteVideoTrack && this.remoteVideo) {
            remoteVideoTrack.play(this.remoteVideo.nativeElement);
          }
        }, 100);
      }

      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        if (remoteAudioTrack) {
          remoteAudioTrack.play();
        }
      }
    });

    // Handle remote user unpublished (e.g., they turned off camera)
    this.client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      if (mediaType === 'video') {
        this.isRemoteVideoActive = false;
      }
    });

    // Handle remote user left fully
    this.client.on('user-left', (user: IAgoraRTCRemoteUser) => {
      this.isRemoteConnected = false;
      this.isRemoteVideoActive = false;
    });
  }

  private setupWebSocketListeners(): void {
    this.webSocketService.onChatMessage((data: any) => {
      this.chatMessages.push({
        content: data.message,
        isFromUser: data.fromUserId !== this.authService.getCurrentUser()?.id,
        timestamp: new Date(data.timestamp)
      });
      
      if (!this.isChatOpen) {
        this.hasUnreadMessages = true;
      } else {
        this.scrollChatToBottom();
      }
    });
  }

  private async joinSession(): Promise<void> {
    if (this.session) {
      try {
        await this.webSocketService.joinRoom(this.session.roomId);
      } catch (error) {
        console.error('Error joining room:', error);
      }
    }
  }

  toggleMute(): void {
    if (this.localAudioTrack) {
      this.isMuted = !this.isMuted;
      this.localAudioTrack.setEnabled(!this.isMuted);
    }
  }

  toggleVideo(): void {
    if (this.localVideoTrack) {
      this.isVideoEnabled = !this.isVideoEnabled;
      this.localVideoTrack.setEnabled(this.isVideoEnabled);
    }
  }

  async endCall(): Promise<void> {
    if (this.session) {
      await this.mentorshipService.endSession(this.session.id).subscribe({
        next: () => {
          this.leaveSession();
        },
        error: (error: any) => {
          console.error('Error ending session:', error);
          this.leaveSession();
        }
      });
    } else {
      this.leaveSession();
    }
  }

  leaveSession(): void {
    this.cleanup();
    this.router.navigate(['/mentorship']);
  }

  sendChatMessage(): void {
    if (this.chatMessage.trim() && this.session) {
      this.webSocketService.sendChatMessage(this.session.roomId, this.chatMessage);
      this.chatMessages.push({
        content: this.chatMessage,
        isFromUser: true,
        timestamp: new Date()
      });
      this.chatMessage = '';
      this.scrollChatToBottom();
    }
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private async cleanup(): Promise<void> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Stop and close local tracks
    if (this.localAudioTrack) {
      this.localAudioTrack.stop();
      this.localAudioTrack.close();
      this.localAudioTrack = null;
    }

    if (this.localVideoTrack) {
      this.localVideoTrack.stop();
      this.localVideoTrack.close();
      this.localVideoTrack = null;
    }

    // Leave the channel
    if (this.client) {
      await this.client.leave();
      this.client = null;
    }

    this.webSocketService.disconnect();
  }
}


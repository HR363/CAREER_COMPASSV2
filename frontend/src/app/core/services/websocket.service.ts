import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;

  constructor(private authService: AuthService) {}

  connect(): void {
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    this.socket = io(environment.apiUrl, {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('join-room', { roomId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  leaveRoom(roomId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('leave-room', { roomId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  sendWebRTCOffer(roomId: string, offer: any, targetUserId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('webrtc-offer', { roomId, offer, targetUserId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  sendWebRTCAnswer(roomId: string, answer: any, targetUserId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('webrtc-answer', { roomId, answer, targetUserId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  sendIceCandidate(roomId: string, candidate: any, targetUserId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('webrtc-ice-candidate', { roomId, candidate, targetUserId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  sendChatMessage(roomId: string, message: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('chat-message', { roomId, message }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Event listeners
  onUserJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  onWebRTCOffer(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('webrtc-offer', callback);
    }
  }

  onWebRTCAnswer(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('webrtc-answer', callback);
    }
  }

  onIceCandidate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('webrtc-ice-candidate', callback);
    }
  }

  onChatMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  // Remove event listeners
  offUserJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('user-joined', callback);
    }
  }

  offUserLeft(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('user-left', callback);
    }
  }

  offWebRTCOffer(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('webrtc-offer', callback);
    }
  }

  offWebRTCAnswer(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('webrtc-answer', callback);
    }
  }

  offIceCandidate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('webrtc-ice-candidate', callback);
    }
  }

  offChatMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('chat-message', callback);
    }
  }
}

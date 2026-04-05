import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  },
})
export class MentorshipGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!user) {
        client.disconnect();
        return;
      }

      client.data.user = user;
      console.log(`User ${user.name} connected to WebSocket`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.user) {
      console.log(`User ${client.data.user.name} disconnected from WebSocket`);
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    const user = client.data.user;

    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Verify user has access to this room
    const session = await this.prisma.session.findUnique({
      where: { roomId },
      select: { mentorId: true, studentId: true, status: true },
    });

    if (!session || (session.mentorId !== user.id && session.studentId !== user.id)) {
      return { error: 'Access denied to this room' };
    }

    client.join(roomId);
    client.to(roomId).emit('user-joined', { userId: user.id, userName: user.name });
    
    return { success: true, roomId, userId: user.id };
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    const user = client.data.user;

    if (!user) return { error: 'Unauthorized' };

    client.leave(roomId);
    client.to(roomId).emit('user-left', { userId: user.id, userName: user.name });
    
    return { success: true };
  }

  @SubscribeMessage('webrtc-offer')
  async handleWebRTCOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; offer: any; targetUserId: string },
  ) {
    const { roomId, offer, targetUserId } = data;
    const user = client.data.user;

    if (!user) return { error: 'Unauthorized' };

    // Forward the offer to the target user
    client.to(roomId).emit('webrtc-offer', {
      offer,
      fromUserId: user.id,
      fromUserName: user.name,
    });

    return { success: true };
  }

  @SubscribeMessage('webrtc-answer')
  async handleWebRTCAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; answer: any; targetUserId: string },
  ) {
    const { roomId, answer, targetUserId } = data;
    const user = client.data.user;

    if (!user) return { error: 'Unauthorized' };

    // Forward the answer to the target user
    client.to(roomId).emit('webrtc-answer', {
      answer,
      fromUserId: user.id,
      fromUserName: user.name,
    });

    return { success: true };
  }

  @SubscribeMessage('webrtc-ice-candidate')
  async handleWebRTCIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; candidate: any; targetUserId: string },
  ) {
    const { roomId, candidate, targetUserId } = data;
    const user = client.data.user;

    if (!user) return { error: 'Unauthorized' };

    // Forward the ICE candidate to the target user
    client.to(roomId).emit('webrtc-ice-candidate', {
      candidate,
      fromUserId: user.id,
      fromUserName: user.name,
    });

    return { success: true };
  }

  @SubscribeMessage('chat-message')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; message: string },
  ) {
    const { roomId, message } = data;
    const user = client.data.user;

    if (!user) return { error: 'Unauthorized' };

    // Broadcast message to all users in the room
    client.to(roomId).emit('chat-message', {
      message,
      fromUserId: user.id,
      fromUserName: user.name,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }
}

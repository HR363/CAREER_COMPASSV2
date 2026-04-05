import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.sendMessage(user.id, sendMessageDto);
  }

  @Get('conversations')
  async getConversations(@CurrentUser() user: any) {
    return this.messagesService.getConversations(user.id);
  }

  @Get('conversation/:userId')
  async getConversation(
    @Param('userId') otherUserId: string,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.getConversation(user.id, otherUserId);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    return { count: await this.messagesService.getUnreadCount(user.id) };
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') messageId: string,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.markAsRead(user.id, messageId);
  }
}

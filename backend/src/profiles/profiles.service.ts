import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create a new profile if it doesn't exist
      return this.prisma.profile.create({
        data: {
          userId,
          education: '',
          skills: '[]',
          interests: '[]',
          goals: '',
        },
      });
    }

    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return this.prisma.profile.update({
        where: { userId },
        data: updateProfileDto,
      });
    } else {
      return this.prisma.profile.create({
        data: {
          userId,
          ...updateProfileDto,
        },
      });
    }
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

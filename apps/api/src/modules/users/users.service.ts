import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        points: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
        },
        badges: {
          where: { isFeatured: true },
          include: { badge: true },
          take: 3,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        points: true,
      },
    });

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

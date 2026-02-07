import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto, UpdateBadgesDisplayDto } from './dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================
  // PUBLIC PROFILE
  // ===========================================

  async getProfile(userId: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
        status: true,
        isVerified: true,
        createdAt: true,
        associationId: true,
        points: {
          select: {
            balance: true,
            lifetimeEarned: true,
          },
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          select: {
            plan: {
              select: {
                name: true,
                verifiedBadge: true,
              },
            },
          },
          take: 1,
        },
        badges: {
          where: { isFeatured: true },
          select: {
            badge: {
              select: {
                id: true,
                name: true,
                iconUrl: true,
                description: true,
              },
            },
            earnedAt: true,
          },
          take: 3,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Check if has active subscription with verified badge
    const hasVerifiedBadge =
      user.subscriptions.length > 0 && user.subscriptions[0].plan.verifiedBadge;

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isVerified: hasVerifiedBadge,
      isMe: userId === currentUserId,
      stats: {
        points: user.points?.balance || 0,
        lifetimePoints: user.points?.lifetimeEarned || 0,
      },
      badges: user.badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        iconUrl: ub.badge.iconUrl,
        description: ub.badge.description,
        earnedAt: ub.earnedAt,
      })),
      subscription: user.subscriptions.length > 0 ? user.subscriptions[0].plan.name : null,
      memberSince: user.createdAt,
    };
  }

  async getUserBadges(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const badges = await this.prisma.userBadge.findMany({
      where: { userId },
      select: {
        badge: {
          select: {
            id: true,
            name: true,
            iconUrl: true,
            description: true,
            criteriaType: true,
            criteriaValue: true,
          },
        },
        earnedAt: true,
        isFeatured: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    return {
      data: badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        iconUrl: ub.badge.iconUrl,
        description: ub.badge.description,
        criteria: {
          type: ub.badge.criteriaType,
          value: ub.badge.criteriaValue,
        },
        earnedAt: ub.earnedAt,
        isFeatured: ub.isFeatured,
      })),
      total: badges.length,
      featured: badges.filter((b) => b.isFeatured).length,
    };
  }

  async getUserRankings(userId: string, associationId: string) {
    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, associationId: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Get all users in association for ranking calculation
    const allUsers = await this.prisma.user.findMany({
      where: { associationId, status: 'ACTIVE' },
      select: {
        id: true,
        points: { select: { lifetimeEarned: true } },
      },
    });

    // Sort by lifetime points
    const sorted = allUsers
      .map((u) => ({ id: u.id, points: u.points?.lifetimeEarned || 0 }))
      .sort((a, b) => b.points - a.points);

    const userIndex = sorted.findIndex((u) => u.id === userId);
    const userPoints = sorted[userIndex]?.points || 0;

    // Calculate event check-ins
    const checkInCount = await this.prisma.pointTransaction.count({
      where: { userId, source: 'EVENT_CHECKIN' },
    });

    // Calculate strava km
    const stravaConnection = await this.prisma.stravaConnection.findUnique({
      where: { userId },
      select: { id: true },
    });

    let stravaKm = 0;
    if (stravaConnection) {
      const stravaStats = await this.prisma.stravaActivity.aggregate({
        where: { connectionId: stravaConnection.id },
        _sum: { distanceKm: true },
      });
      stravaKm = Math.round((stravaStats._sum.distanceKm || 0) * 10) / 10;
    }

    return {
      data: [
        {
          type: 'points',
          name: 'Ranking Geral',
          position: userIndex + 1,
          totalParticipants: allUsers.length,
          value: userPoints,
          unit: 'pontos',
        },
        {
          type: 'events',
          name: 'Eventos',
          position: null, // Would need full ranking calculation
          totalParticipants: allUsers.length,
          value: checkInCount,
          unit: 'check-ins',
        },
        {
          type: 'strava',
          name: 'Strava',
          position: null, // Would need full ranking calculation
          totalParticipants: null,
          value: stravaKm,
          unit: 'km',
        },
      ],
    };
  }

  // ===========================================
  // PROFILE MANAGEMENT
  // ===========================================

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    let usernameIsChanging = false;

    if (dto.username) {
      // Fetch current user to check username change cooldown
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, usernameChangedAt: true },
      });

      usernameIsChanging = currentUser?.username !== dto.username;

      if (usernameIsChanging) {
        // Enforce 30-day cooldown
        if (currentUser?.usernameChangedAt) {
          const cooldownMs = 30 * 24 * 60 * 60 * 1000;
          const elapsed = Date.now() - currentUser.usernameChangedAt.getTime();
          if (elapsed < cooldownMs) {
            const daysRemaining = Math.ceil((cooldownMs - elapsed) / (24 * 60 * 60 * 1000));
            throw new BadRequestException(
              `Você só pode alterar o username a cada 30 dias. Tente novamente em ${daysRemaining} dia(s).`,
            );
          }
        }

        // Check username availability
        const existingUser = await this.prisma.user.findUnique({
          where: { username: dto.username },
          select: { id: true },
        });

        if (existingUser && existingUser.id !== userId) {
          throw new ConflictException('Este username já está em uso');
        }
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.username && { username: dto.username }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(usernameIsChanging && { usernameChangedAt: new Date() }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        phone: true,
        avatarUrl: true,
        usernameChangedAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateBadgesDisplay(userId: string, dto: UpdateBadgesDisplayDto) {
    // Verify all badges belong to user
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId, badgeId: { in: dto.badgeIds } },
      select: { badgeId: true },
    });

    if (userBadges.length !== dto.badgeIds.length) {
      throw new BadRequestException('Um ou mais badges não pertencem a este usuário');
    }

    // Update badges: set all to not featured, then set selected to featured
    await this.prisma.$transaction(async (tx) => {
      // Reset all featured badges
      await tx.userBadge.updateMany({
        where: { userId, isFeatured: true },
        data: { isFeatured: false },
      });

      // Set new featured badges
      await tx.userBadge.updateMany({
        where: { userId, badgeId: { in: dto.badgeIds } },
        data: { isFeatured: true },
      });
    });

    // Return updated badges
    const updatedBadges = await this.prisma.userBadge.findMany({
      where: { userId, isFeatured: true },
      select: {
        badge: {
          select: {
            id: true,
            name: true,
            iconUrl: true,
          },
        },
      },
    });

    return {
      featuredBadges: updatedBadges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        iconUrl: ub.badge.iconUrl,
      })),
    };
  }

  // ===========================================
  // USERNAME AVAILABILITY
  // ===========================================

  async checkUsernameAvailability(username: string, currentUserId?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    const isAvailable = !existingUser || existingUser.id === currentUserId;

    return { username, isAvailable };
  }
}

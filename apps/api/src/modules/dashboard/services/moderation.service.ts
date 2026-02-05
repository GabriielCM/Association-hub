import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ReportReason, ReportStatus, ReportTargetType } from '@prisma/client';
import {
  ReportListItemDto,
  SuspendUserResponseDto,
} from '../dto/moderation.dto';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async checkSuspension(userId: string, associationId: string): Promise<void> {
    const now = new Date();

    const activeSuspension = await this.prisma.userSuspension.findFirst({
      where: {
        userId,
        associationId,
        liftedAt: null,
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
    });

    if (activeSuspension) {
      const message = activeSuspension.endsAt
        ? `Você está suspenso até ${activeSuspension.endsAt.toLocaleDateString('pt-BR')}`
        : 'Você está permanentemente suspenso';

      throw new ForbiddenException(message);
    }
  }

  async isUserSuspended(
    userId: string,
    associationId: string,
  ): Promise<boolean> {
    const now = new Date();

    const activeSuspension = await this.prisma.userSuspension.findFirst({
      where: {
        userId,
        associationId,
        liftedAt: null,
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
    });

    return !!activeSuspension;
  }

  async createReport(
    reporterId: string,
    associationId: string,
    targetType: ReportTargetType,
    targetId: string,
    reason: ReportReason,
    description?: string,
  ): Promise<string> {
    // Validate target exists
    if (targetType === 'POST') {
      const post = await this.prisma.post.findUnique({
        where: { id: targetId },
      });
      if (!post) {
        throw new NotFoundException('Post não encontrado');
      }
    } else if (targetType === 'COMMENT') {
      const comment = await this.prisma.feedComment.findUnique({
        where: { id: targetId },
      });
      if (!comment) {
        throw new NotFoundException('Comentário não encontrado');
      }
    }

    const report = await this.prisma.report.create({
      data: {
        reporterId,
        associationId,
        targetType,
        targetId,
        postId: targetType === 'POST' ? targetId : null,
        reason,
        description,
      },
    });

    return report.id;
  }

  async listReports(
    associationId: string,
    status?: ReportStatus,
    offset = 0,
    limit = 20,
  ): Promise<{ reports: ReportListItemDto[]; total: number }> {
    const where = {
      associationId,
      ...(status && { status }),
    };

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports: reports.map((r) => ({
        id: r.id,
        type: r.targetType.toLowerCase() as 'post' | 'comment',
        target_id: r.targetId,
        reason: r.reason,
        description: r.description || undefined,
        reporter: {
          id: r.reporter.id,
          name: r.reporter.name,
          avatar_url: r.reporter.avatarUrl || undefined,
        },
        created_at: r.createdAt,
        status: r.status,
      })),
      total,
    };
  }

  async resolveReport(
    reportId: string,
    resolvedById: string,
    status: 'RESOLVED' | 'DISMISSED',
    resolution?: string,
  ): Promise<void> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Denúncia não encontrada');
    }

    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        resolvedById,
        resolvedAt: new Date(),
        resolution,
      },
    });
  }

  async suspendUser(
    userId: string,
    associationId: string,
    suspendedById: string,
    reason: string,
    durationDays?: number,
  ): Promise<SuspendUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Calculate end date
    let endsAt: Date | null = null;
    if (durationDays) {
      endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + durationDays);
    }

    await this.prisma.userSuspension.create({
      data: {
        userId,
        associationId,
        suspendedById,
        reason,
        durationDays,
        endsAt,
      },
    });

    return {
      success: true,
      suspended_until: endsAt || undefined,
    };
  }

  async liftSuspension(
    suspensionId: string,
    liftedById: string,
  ): Promise<void> {
    const suspension = await this.prisma.userSuspension.findUnique({
      where: { id: suspensionId },
    });

    if (!suspension) {
      throw new NotFoundException('Suspensão não encontrada');
    }

    if (suspension.liftedAt) {
      throw new ForbiddenException('Suspensão já foi levantada');
    }

    await this.prisma.userSuspension.update({
      where: { id: suspensionId },
      data: {
        liftedById,
        liftedAt: new Date(),
      },
    });
  }

  async liftUserSuspension(
    userId: string,
    associationId: string,
    liftedById: string,
  ): Promise<void> {
    const now = new Date();

    const activeSuspension = await this.prisma.userSuspension.findFirst({
      where: {
        userId,
        associationId,
        liftedAt: null,
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
    });

    if (!activeSuspension) {
      throw new NotFoundException('Usuário não está suspenso');
    }

    await this.prisma.userSuspension.update({
      where: { id: activeSuspension.id },
      data: {
        liftedById,
        liftedAt: new Date(),
      },
    });
  }
}

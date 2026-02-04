import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CardHistoryQueryDto, ListCardsQueryDto, UpdateCardStatusDto } from './dto';
import { createHmac } from 'crypto';

@Injectable()
export class CardService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================
  // USER ENDPOINTS
  // ===========================================

  async getCard(userId: string) {
    // Get or create card for user
    let card = await this.prisma.memberCard.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            memberId: true,
            association: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                phone: true,
                email: true,
                website: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      // Auto-create card for user
      await this.createCardForUser(userId);
      card = await this.prisma.memberCard.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              memberId: true,
              association: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  phone: true,
                  email: true,
                  website: true,
                  address: true,
                },
              },
            },
          },
        },
      });
    }

    return {
      id: card!.id,
      cardNumber: card!.cardNumber,
      status: card!.status,
      statusReason: card!.statusReason,
      issuedAt: card!.issuedAt,
      expiresAt: card!.expiresAt,
      user: {
        id: card!.user.id,
        name: card!.user.name,
        avatarUrl: card!.user.avatarUrl,
        memberId: card!.user.memberId,
      },
      association: card!.user.association,
    };
  }

  async getCardStatus(userId: string) {
    const card = await this.prisma.memberCard.findUnique({
      where: { userId },
      select: {
        status: true,
        statusReason: true,
        expiresAt: true,
      },
    });

    if (!card) {
      // Create card if not exists
      await this.createCardForUser(userId);
      return { status: 'ACTIVE', statusReason: null, expiresAt: null };
    }

    return card;
  }

  async getQrCode(userId: string) {
    let card = await this.prisma.memberCard.findUnique({
      where: { userId },
      select: {
        id: true,
        cardNumber: true,
        qrCodeData: true,
        qrCodeHash: true,
        status: true,
      },
    });

    if (!card) {
      card = await this.createCardForUser(userId);
    }

    if (card.status !== 'ACTIVE') {
      throw new BadRequestException('Carteirinha inativa. Entre em contato com a associação.');
    }

    return {
      qrCodeData: card.qrCodeData,
      qrCodeHash: card.qrCodeHash,
      cardNumber: card.cardNumber,
    };
  }

  async getCardHistory(userId: string, query: CardHistoryQueryDto) {
    const { page = 1, perPage = 20, type } = query;
    const skip = (page - 1) * perPage;

    const card = await this.prisma.memberCard.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!card) {
      return {
        data: [],
        meta: {
          currentPage: page,
          perPage,
          totalPages: 0,
          totalCount: 0,
        },
      };
    }

    const where: any = { cardId: card.id };
    if (type) {
      where.type = type;
    }

    const [logs, total] = await Promise.all([
      this.prisma.cardUsageLog.findMany({
        where,
        orderBy: { scannedAt: 'desc' },
        skip,
        take: perPage,
        include: {
          partner: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
        },
      }),
      this.prisma.cardUsageLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        id: log.id,
        type: log.type,
        location: log.location,
        address: log.address,
        partner: log.partner,
        scannedAt: log.scannedAt,
        metadata: log.metadata,
      })),
      meta: {
        currentPage: page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        totalCount: total,
      },
    };
  }

  // ===========================================
  // ADMIN ENDPOINTS
  // ===========================================

  async listCards(associationId: string, query: ListCardsQueryDto) {
    const { page = 1, perPage = 20, search, status } = query;
    const skip = (page - 1) * perPage;

    const where: any = {
      user: { associationId },
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { cardNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [cards, total] = await Promise.all([
      this.prisma.memberCard.findMany({
        where,
        orderBy: { issuedAt: 'desc' },
        skip,
        take: perPage,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.memberCard.count({ where }),
    ]);

    return {
      data: cards.map((card) => ({
        id: card.id,
        cardNumber: card.cardNumber,
        status: card.status,
        statusReason: card.statusReason,
        issuedAt: card.issuedAt,
        user: card.user,
      })),
      meta: {
        currentPage: page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        totalCount: total,
      },
    };
  }

  async updateCardStatus(cardId: string, dto: UpdateCardStatusDto) {
    const card = await this.prisma.memberCard.findUnique({
      where: { id: cardId },
      select: { id: true },
    });

    if (!card) {
      throw new NotFoundException('Carteirinha não encontrada');
    }

    const updated = await this.prisma.memberCard.update({
      where: { id: cardId },
      data: {
        status: dto.status,
        statusReason: dto.reason || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      cardNumber: updated.cardNumber,
      status: updated.status,
      statusReason: updated.statusReason,
      user: updated.user,
    };
  }

  // ===========================================
  // HELPERS
  // ===========================================

  private async createCardForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        associationId: true,
        association: { select: { slug: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Generate card number
    const year = new Date().getFullYear();
    const lastCard = await this.prisma.memberCard.findFirst({
      where: { cardNumber: { startsWith: `${user.association.slug.toUpperCase()}-${year}` } },
      orderBy: { cardNumber: 'desc' },
    });

    let sequence = 1;
    if (lastCard) {
      const lastSequence = parseInt(lastCard.cardNumber.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    const cardNumber = `${user.association.slug.toUpperCase()}-${year}-${String(sequence).padStart(5, '0')}`;

    // Generate QR code data
    const qrData = {
      user_id: userId,
      card_number: cardNumber,
      timestamp: Date.now(),
      type: 'member_card',
    };

    const qrCodeData = JSON.stringify(qrData);
    const qrCodeHash = this.generateQrHash(qrCodeData);

    const card = await this.prisma.memberCard.create({
      data: {
        userId,
        cardNumber,
        qrCodeData,
        qrCodeHash,
      },
    });

    return card;
  }

  private generateQrHash(data: string): string {
    const secret = process.env.QR_CODE_SECRET || 'ahub-qr-secret-key';
    return createHmac('sha256', secret).update(data).digest('hex');
  }

  // ===========================================
  // QR CODE VALIDATION (for external use)
  // ===========================================

  async validateQrCode(qrCodeData: string, qrCodeHash: string) {
    const expectedHash = this.generateQrHash(qrCodeData);

    if (expectedHash !== qrCodeHash) {
      return { valid: false, error: 'QR Code inválido' };
    }

    try {
      const data = JSON.parse(qrCodeData);

      if (data.type !== 'member_card') {
        return { valid: false, error: 'Tipo de QR Code inválido' };
      }

      const card = await this.prisma.memberCard.findUnique({
        where: { cardNumber: data.card_number },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              status: true,
            },
          },
        },
      });

      if (!card) {
        return { valid: false, error: 'Carteirinha não encontrada' };
      }

      if (card.status !== 'ACTIVE') {
        return { valid: false, error: 'Carteirinha inativa', status: card.status };
      }

      if (card.user.status !== 'ACTIVE') {
        return { valid: false, error: 'Usuário inativo' };
      }

      return {
        valid: true,
        user: {
          id: card.user.id,
          name: card.user.name,
          avatarUrl: card.user.avatarUrl,
        },
        card: {
          id: card.id,
          cardNumber: card.cardNumber,
        },
      };
    } catch {
      return { valid: false, error: 'QR Code mal formatado' };
    }
  }

  async logCardUsage(
    cardId: string,
    userId: string,
    type: 'CHECKIN' | 'BENEFIT_USED' | 'EVENT_VALIDATION' | 'QR_SCANNED',
    options?: {
      partnerId?: string;
      location?: string;
      address?: string;
      metadata?: any;
    },
  ) {
    return this.prisma.cardUsageLog.create({
      data: {
        cardId,
        userId,
        type,
        partnerId: options?.partnerId,
        location: options?.location,
        address: options?.address,
        metadata: options?.metadata,
      },
    });
  }
}

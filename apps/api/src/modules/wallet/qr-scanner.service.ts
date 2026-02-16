import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CardService } from '../card/card.service';
import { PointsService } from '../points/points.service';
import { PdvCheckoutService } from '../pdv/pdv-checkout.service';
import { QrCodeType, QrScanResult } from './dto';
import { createHmac } from 'crypto';

@Injectable()
export class QrScannerService {
  private readonly logger = new Logger(QrScannerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cardService: CardService,
    private readonly pointsService: PointsService,
    private readonly pdvCheckoutService: PdvCheckoutService,
  ) {}

  /**
   * Detecta o tipo de QR Code e processa adequadamente
   */
  async processQrCode(
    qrCodeData: string,
    qrCodeHash: string = '',
    userId: string,
  ): Promise<QrScanResult> {
    this.logger.log(`[QR SCAN] Received scan request. Data length=${qrCodeData.length}, hash=${qrCodeHash ? 'present' : 'empty'}, userId=${userId}`);
    this.logger.debug(`[QR SCAN] Raw qrCodeData: ${qrCodeData.substring(0, 200)}`);

    // 1. Parse QR data first to detect type
    let data: any;
    try {
      data = JSON.parse(qrCodeData);
    } catch (e) {
      this.logger.warn(`[QR SCAN] JSON parse failed: ${(e as Error).message}. Raw data: ${qrCodeData.substring(0, 100)}`);
      return {
        type: QrCodeType.MEMBER_CARD,
        valid: false,
        error: 'QR Code mal formatado',
      };
    }

    // 2. Detect type
    const type = this.detectQrType(data);
    this.logger.log(`[QR SCAN] Parsed data.type="${data.type}" → detected: ${type}`);

    // 3. Validate hash only for types that require it
    //    PDV checkout QRs are ephemeral (5min TTL) and validated by checkout code
    if (type !== QrCodeType.PDV_PAYMENT) {
      if (!this.validateHash(qrCodeData, qrCodeHash)) {
        this.logger.warn(`[QR SCAN] Hash validation failed for type=${type}`);
        return {
          type,
          valid: false,
          error: 'QR Code inválido ou adulterado',
        };
      }
    } else {
      this.logger.log(`[QR SCAN] Skipping hash validation for PDV_PAYMENT`);
    }

    // 4. Process by type
    this.logger.log(`[QR SCAN] Processing type=${type}`);
    switch (type) {
      case QrCodeType.MEMBER_CARD:
        return this.processMemberCard(data, userId);

      case QrCodeType.EVENT_CHECKIN:
        return this.processEventCheckin(data, userId);

      case QrCodeType.USER_TRANSFER:
        return this.processUserTransfer(data, userId);

      case QrCodeType.PDV_PAYMENT:
        return this.processPdvPayment(data, userId);

      default:
        return {
          type: QrCodeType.MEMBER_CARD,
          valid: false,
          error: 'Tipo de QR Code não reconhecido',
        };
    }
  }

  /**
   * Detecta o tipo do QR Code baseado no campo 'type'
   */
  private detectQrType(data: any): QrCodeType {
    const typeMap: Record<string, QrCodeType> = {
      member_card: QrCodeType.MEMBER_CARD,
      event_checkin: QrCodeType.EVENT_CHECKIN,
      user_transfer: QrCodeType.USER_TRANSFER,
      pdv_payment: QrCodeType.PDV_PAYMENT,
      pdv_checkout: QrCodeType.PDV_PAYMENT,
    };

    return typeMap[data.type] || QrCodeType.MEMBER_CARD;
  }

  /**
   * Processa QR Code de carteirinha de membro
   */
  private async processMemberCard(data: any, scannerId: string): Promise<QrScanResult> {
    // Apenas admins podem escanear carteirinhas de outros
    const scanner = await this.prisma.user.findUnique({
      where: { id: scannerId },
      select: { role: true },
    });

    // Usuarios comuns: redirecionar para fluxo de transferencia de pontos
    if (scanner?.role !== 'ADMIN' && scanner?.role !== 'DISPLAY') {
      return this.processUserTransfer(data, scannerId);
    }

    // Validate card
    const validation = await this.cardService.validateQrCode(
      JSON.stringify(data),
      this.generateHash(JSON.stringify(data)),
    );

    if (!validation.valid) {
      return {
        type: QrCodeType.MEMBER_CARD,
        valid: false,
        error: validation.error,
      };
    }

    // Log usage
    if (validation.card) {
      await this.cardService.logCardUsage(
        validation.card.id,
        data.user_id,
        'QR_SCANNED',
        { location: 'Scanner App' },
      );
    }

    return {
      type: QrCodeType.MEMBER_CARD,
      valid: true,
      data: {
        user: validation.user,
        card: validation.card,
      },
      action: 'display_member_info',
    };
  }

  /**
   * Processa QR Code de check-in em evento
   * Nota: Eventos serão implementados na Fase 3, por enquanto retorna placeholder
   */
  private async processEventCheckin(data: any, userId: string): Promise<QrScanResult> {
    // TODO: Implementar na Fase 3 - Eventos
    // Por enquanto, retorna informação de que eventos não estão disponíveis

    return {
      type: QrCodeType.EVENT_CHECKIN,
      valid: false,
      error: 'Check-in de eventos será implementado na Fase 3',
      data: {
        eventId: data.event_id,
        eventName: data.event_name || 'Evento',
      },
      action: 'event_checkin_pending',
    };
  }

  /**
   * Processa QR Code para transferência de pontos
   */
  private async processUserTransfer(data: any, senderId: string): Promise<QrScanResult> {
    const recipientId = data.user_id;

    // Não pode transferir para si mesmo
    if (recipientId === senderId) {
      return {
        type: QrCodeType.USER_TRANSFER,
        valid: false,
        error: 'Você não pode transferir pontos para você mesmo',
      };
    }

    // Get recipient info
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        status: true,
      },
    });

    if (!recipient) {
      return {
        type: QrCodeType.USER_TRANSFER,
        valid: false,
        error: 'Usuário não encontrado',
      };
    }

    if (recipient.status !== 'ACTIVE') {
      return {
        type: QrCodeType.USER_TRANSFER,
        valid: false,
        error: 'Usuário inativo',
      };
    }

    // Get sender balance
    const senderBalance = await this.pointsService.getBalance(senderId);

    return {
      type: QrCodeType.USER_TRANSFER,
      valid: true,
      data: {
        recipient: {
          id: recipient.id,
          name: recipient.name,
          username: recipient.username,
          avatarUrl: recipient.avatarUrl,
        },
        senderBalance: senderBalance.balance,
      },
      action: 'open_transfer_flow',
    };
  }

  /**
   * Processa QR Code de pagamento PDV
   */
  private async processPdvPayment(data: any, userId: string): Promise<QrScanResult> {
    this.logger.log(`[QR SCAN] processPdvPayment called. code=${data.code}, userId=${userId}`);
    const code = data.code;
    if (!code) {
      return {
        type: QrCodeType.PDV_PAYMENT,
        valid: false,
        error: 'QR Code de checkout inválido',
      };
    }

    try {
      const details = await this.pdvCheckoutService.getCheckoutDetails(code, userId);
      return {
        type: QrCodeType.PDV_PAYMENT,
        valid: true,
        data: details,
        action: 'open_pdv_checkout',
      };
    } catch (err: any) {
      return {
        type: QrCodeType.PDV_PAYMENT,
        valid: false,
        error: err.message || 'Checkout não encontrado ou expirado',
      };
    }
  }

  /**
   * Valida o hash do QR Code
   */
  private validateHash(data: string, hash: string): boolean {
    const expectedHash = this.generateHash(data);
    return expectedHash === hash;
  }

  /**
   * Gera hash HMAC-SHA256 para QR Code
   */
  private generateHash(data: string): string {
    const secret = process.env.QR_CODE_SECRET || 'ahub-qr-secret-key';
    return createHmac('sha256', secret).update(data).digest('hex');
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';

export interface QrCodeData {
  type: 'event_checkin';
  event_id: string;
  checkin_number: number;
  security_token: string;
  timestamp: number;
  expires_at: number;
}

export interface DisplayData {
  event: {
    id: string;
    title: string;
    description: string;
    category: string;
    color: string;
    startDate: Date;
    endDate: Date;
    locationName: string;
    bannerDisplay: string[];
    pointsTotal: number;
    checkinsCount: number;
    checkinInterval: number;
    status: string;
    isPaused: boolean;
  };
  association: {
    name: string;
    logoUrl: string | null;
  };
  currentCheckin: {
    number: number;
    points: number;
  };
  qrCode: QrCodeData;
  stats: {
    totalCheckIns: number;
  };
}

@Injectable()
export class DisplayService {
  constructor(private readonly eventsService: EventsService) {}

  async getDisplayData(eventId: string): Promise<DisplayData> {
    const event = await this.eventsService.getEventForDisplay(eventId);

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    const currentCheckinNumber = this.calculateCurrentCheckinNumber(event);
    const pointsPerCheckin = Math.floor(event.pointsTotal / event.checkinsCount);

    const qrCode = this.generateQrCode(
      event.id,
      currentCheckinNumber,
      event.qrSecret,
    );

    return {
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        color: event.color,
        startDate: event.startDate,
        endDate: event.endDate,
        locationName: event.locationName,
        bannerDisplay: event.bannerDisplay,
        pointsTotal: event.pointsTotal,
        checkinsCount: event.checkinsCount,
        checkinInterval: event.checkinInterval,
        status: event.status,
        isPaused: event.isPaused,
      },
      association: {
        name: event.association.name,
        logoUrl: event.association.logoUrl,
      },
      currentCheckin: {
        number: currentCheckinNumber,
        points: pointsPerCheckin,
      },
      qrCode,
      stats: {
        totalCheckIns: event._count.checkIns,
      },
    };
  }

  generateQrCode(
    eventId: string,
    checkinNumber: number,
    secret: string,
  ): QrCodeData {
    const timestamp = Math.floor(Date.now() / 1000);
    const expiresAt = timestamp + 120; // 2 minutes validity

    const securityToken = this.eventsService.generateSecurityToken(
      eventId,
      checkinNumber,
      timestamp,
      secret,
    );

    return {
      type: 'event_checkin',
      event_id: eventId,
      checkin_number: checkinNumber,
      security_token: securityToken,
      timestamp,
      expires_at: expiresAt,
    };
  }

  private calculateCurrentCheckinNumber(event: {
    startDate: Date;
    checkinsCount: number;
    checkinInterval: number;
    status: string;
  }): number {
    if (event.status !== 'ONGOING') {
      return 1;
    }

    const now = Date.now();
    const start = event.startDate.getTime();
    const elapsedMinutes = (now - start) / (1000 * 60);
    const checkinNumber = Math.floor(elapsedMinutes / event.checkinInterval) + 1;

    return Math.min(checkinNumber, event.checkinsCount);
  }

  async getQrCodeForEvent(eventId: string): Promise<QrCodeData | null> {
    const event = await this.eventsService.getEventForDisplay(eventId);

    if (!event || event.status !== 'ONGOING' || event.isPaused) {
      return null;
    }

    const currentCheckinNumber = this.calculateCurrentCheckinNumber(event);

    return this.generateQrCode(event.id, currentCheckinNumber, event.qrSecret);
  }
}

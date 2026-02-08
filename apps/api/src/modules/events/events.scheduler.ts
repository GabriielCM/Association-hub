import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from './events.service';
import { DisplayService } from './display.service';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsScheduler {
  private readonly logger = new Logger(EventsScheduler.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly displayService: DisplayService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // Rotate QR codes every 60 seconds
  @Cron('*/60 * * * * *')
  async rotateQrCodes() {
    try {
      const ongoingEvents = await this.eventsService.getOngoingEvents();

      for (const event of ongoingEvents) {
        if (!event.isPaused) {
          const qrData = await this.displayService.getQrCodeForEvent(event.id);
          if (qrData) {
            this.eventsGateway.broadcastQrUpdate(event.id, qrData);
          }
        }
      }

      if (ongoingEvents.length > 0) {
        this.logger.debug(`Rotated QR codes for ${ongoingEvents.length} events`);
      }
    } catch (error) {
      this.logger.error('Error rotating QR codes:', error);
    }
  }

  // Check event status transitions every minute and broadcast changes
  @Cron(CronExpression.EVERY_MINUTE)
  async checkEventTransitions() {
    try {
      const { toOngoing, toEnded } =
        await this.eventsService.transitionEventStatuses();

      // Broadcast status changes via WebSocket so Display and admin update in real-time
      for (const event of toOngoing) {
        this.eventsGateway.broadcastStatusChange(
          event.id,
          'ONGOING',
          event.isPaused,
        );
        this.logger.log(`Event ${event.id} transitioned SCHEDULED -> ONGOING`);
      }

      for (const event of toEnded) {
        this.eventsGateway.broadcastStatusChange(
          event.id,
          'ENDED',
          false,
          'Evento encerrado',
        );
        this.logger.log(`Event ${event.id} transitioned ONGOING -> ENDED`);
      }
    } catch (error) {
      this.logger.error('Error transitioning event statuses:', error);
    }
  }
}

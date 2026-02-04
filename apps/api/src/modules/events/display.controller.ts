import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { DisplayService } from './display.service';

@Controller('display')
export class DisplayController {
  constructor(private readonly displayService: DisplayService) {}

  // Public endpoint - no auth required
  @Get(':eventId')
  async getDisplayPage(@Param('eventId') eventId: string, @Res() res: Response) {
    try {
      const data = await this.displayService.getDisplayData(eventId);

      // Return HTML page for display
      const html = this.generateDisplayHtml(data);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      res.status(404).send(this.generate404Html());
    }
  }

  @Get(':eventId/data')
  async getDisplayData(@Param('eventId') eventId: string) {
    return this.displayService.getDisplayData(eventId);
  }

  private generateDisplayHtml(data: any): string {
    const { event, association, currentCheckin, qrCode, stats } = data;
    const qrCodeJson = JSON.stringify(qrCode);

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${event.title} - Display</title>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, ${event.color}dd 0%, ${event.color}99 100%);
      min-height: 100vh;
      color: white;
      overflow: hidden;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 40px;
      text-align: center;
    }

    .logo {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      background: white;
      margin-bottom: 24px;
      object-fit: contain;
    }

    .title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .datetime {
      font-size: 24px;
      opacity: 0.9;
      margin-bottom: 40px;
    }

    .qr-container {
      background: white;
      padding: 24px;
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      margin-bottom: 32px;
    }

    #qrcode {
      width: 400px;
      height: 400px;
    }

    .instructions {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .checkin-info {
      background: rgba(255,255,255,0.2);
      padding: 16px 32px;
      border-radius: 100px;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .counter {
      font-size: 20px;
      opacity: 0.9;
    }

    .status-badge {
      position: fixed;
      top: 24px;
      right: 24px;
      background: rgba(0,0,0,0.3);
      padding: 12px 24px;
      border-radius: 100px;
      font-size: 16px;
    }

    .paused {
      background: #F59E0B;
      color: white;
      font-size: 32px;
      padding: 40px;
      border-radius: 16px;
    }

    .ended {
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    ${association.logoUrl ? `<img src="${association.logoUrl}" alt="${association.name}" class="logo">` : ''}

    <h1 class="title">${event.title}</h1>
    <p class="datetime">${new Date(event.startDate).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>

    ${event.status === 'ONGOING' && !event.isPaused ? `
      <div class="qr-container">
        <canvas id="qrcode"></canvas>
      </div>

      <p class="instructions">Escaneie para fazer Check-in</p>

      <div class="checkin-info">
        CHECK-IN ${currentCheckin.number} de ${event.checkinsCount} &bull; +${currentCheckin.points} pontos
      </div>

      <p class="counter">&#10003; ${stats.totalCheckIns} check-ins realizados</p>
    ` : ''}

    ${event.isPaused ? `
      <div class="paused">
        Check-ins temporariamente pausados
      </div>
    ` : ''}

    ${event.status === 'SCHEDULED' ? `
      <div class="paused">
        Evento comeca em breve
      </div>
    ` : ''}

    ${event.status === 'ENDED' ? `
      <div class="ended">
        <p style="font-size: 32px;">Evento encerrado</p>
        <p style="margin-top: 16px; font-size: 24px;">Obrigado pela participacao!</p>
      </div>
    ` : ''}
  </div>

  <div class="status-badge" id="status">
    ${event.status === 'ONGOING' ? 'Ao Vivo' : event.status}
  </div>

  <script>
    const eventId = '${event.id}';
    let qrData = ${qrCodeJson};

    function renderQrCode() {
      const canvas = document.getElementById('qrcode');
      if (!canvas) return;

      QRCode.toCanvas(canvas, JSON.stringify(qrData), {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }

    // Initial render
    renderQrCode();

    // WebSocket connection for real-time updates
    function connectWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(protocol + '//' + window.location.host + '/ws/events');

      ws.onopen = () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify({ event: 'subscribe', data: { event_id: eventId } }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.event === 'qr_update' && data.data.event_id === eventId) {
          qrData = data.data;
          renderQrCode();
        }

        if (data.event === 'counter_update' && data.data.event_id === eventId) {
          const counter = document.querySelector('.counter');
          if (counter) {
            counter.innerHTML = '&#10003; ' + data.data.total + ' check-ins realizados';
          }
        }

        if (data.event === 'status_change' && data.data.event_id === eventId) {
          // Reload page on status change
          window.location.reload();
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    // Fallback: Polling every 30 seconds
    setInterval(async () => {
      try {
        const response = await fetch('/display/' + eventId + '/data');
        const data = await response.json();
        qrData = data.qrCode;
        renderQrCode();

        const counter = document.querySelector('.counter');
        if (counter) {
          counter.innerHTML = '&#10003; ' + data.stats.totalCheckIns + ' check-ins realizados';
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 30000);

    // Try WebSocket connection
    try {
      connectWebSocket();
    } catch (e) {
      console.log('WebSocket not available, using polling');
    }
  </script>
</body>
</html>
    `;
  }

  private generate404Html(): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Evento nao encontrado</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #1F2937;
      color: white;
      text-align: center;
    }
    h1 { font-size: 48px; margin-bottom: 16px; }
    p { font-size: 20px; opacity: 0.7; }
  </style>
</head>
<body>
  <div>
    <h1>Evento nao encontrado</h1>
    <p>Verifique o link e tente novamente</p>
  </div>
</body>
</html>
    `;
  }
}

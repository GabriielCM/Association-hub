import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { QrScannerService } from './qr-scanner.service';
import { WalletController } from './wallet.controller';
import { CardModule } from '../card/card.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [CardModule, PointsModule],
  controllers: [WalletController],
  providers: [WalletService, QrScannerService],
  exports: [WalletService, QrScannerService],
})
export class WalletModule {}

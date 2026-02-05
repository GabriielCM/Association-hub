import { Module, forwardRef } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { QrScannerService } from './qr-scanner.service';
import { WalletController } from './wallet.controller';
import { CardModule } from '../card/card.module';
import { PointsModule } from '../points/points.module';
import { PdvModule } from '../pdv/pdv.module';

@Module({
  imports: [CardModule, PointsModule, forwardRef(() => PdvModule)],
  controllers: [WalletController],
  providers: [WalletService, QrScannerService],
  exports: [WalletService, QrScannerService],
})
export class WalletModule {}

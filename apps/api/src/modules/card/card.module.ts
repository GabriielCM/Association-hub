import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { PartnersService } from './partners.service';
import { CardController, AdminCardController } from './card.controller';
import { BenefitsController, AdminPartnersController } from './partners.controller';

@Module({
  controllers: [
    CardController,
    AdminCardController,
    BenefitsController,
    AdminPartnersController,
  ],
  providers: [CardService, PartnersService],
  exports: [CardService, PartnersService],
})
export class CardModule {}

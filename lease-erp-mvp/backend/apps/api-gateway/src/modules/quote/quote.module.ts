import { Module } from '@nestjs/common';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';
import { CalculationService } from './calculation.service';

@Module({
  controllers: [QuoteController],
  providers: [QuoteService, CalculationService],
  exports: [QuoteService],
})
export class QuoteModule {}

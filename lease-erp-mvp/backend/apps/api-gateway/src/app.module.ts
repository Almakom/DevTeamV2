import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/database';
import { AuthModule } from '@app/auth';
import { CrmModule } from './modules/crm/crm.module';
import { QuoteModule } from './modules/quote/quote.module';
import { ContractModule } from './modules/contract/contract.module';
import { AssetModule } from './modules/asset/asset.module';
import { DocumentModule } from './modules/document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    CrmModule,
    QuoteModule,
    ContractModule,
    AssetModule,
    DocumentModule,
  ],
})
export class AppModule {}

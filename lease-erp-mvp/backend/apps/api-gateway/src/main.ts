import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@app/common/filters';
import { TransformInterceptor } from '@app/common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api/v1'));

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Leasing ERP API')
    .setDescription('API documentation for Leasing Management ERP System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('CRM', 'Customer Relationship Management')
    .addTag('Quotes', 'Quote and Calculation Management')
    .addTag('Contracts', 'Contract Management')
    .addTag('Assets', 'Asset and Fleet Management')
    .addTag('Documents', 'Document Management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT', 4000);
  await app.listen(port);

  console.log(`
    🚀 Leasing ERP API Gateway is running!
    📝 API: http://localhost:${port}/${configService.get('API_PREFIX', 'api/v1')}
    📚 Docs: http://localhost:${port}/api/docs
  `);
}

bootstrap();

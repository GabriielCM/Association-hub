import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Serve uploaded files (avatars, etc.) outside the API prefix
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // Security headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://ahub.com.br', 'https://admin.ahub.com.br']
      : true,
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('A-hub API')
      .setDescription('API do aplicativo A-hub para associações')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticação')
      .addTag('users', 'Usuários')
      .addTag('points', 'Sistema de Pontos')
      .addTag('admin/points', 'Admin - Sistema de Pontos')
      .addTag('rankings', 'Rankings e Leaderboards')
      .addTag('subscriptions', 'Assinaturas')
      .addTag('admin/subscriptions', 'Admin - Assinaturas')
      .addTag('Profile', 'Perfil do Usuário')
      .addTag('Card', 'Carteirinha Digital')
      .addTag('Admin - Cards', 'Gestão de Carteirinhas')
      .addTag('Benefits', 'Parceiros e Benefícios')
      .addTag('Admin - Partners', 'Gestão de Parceiros')
      .addTag('Wallet', 'Minha Carteira')
      .addTag('events', 'Eventos')
      .addTag('display', 'Display para TVs/Kiosks')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();

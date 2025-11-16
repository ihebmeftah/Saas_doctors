import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:3000'], // URL de votre frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Activer la validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = 3000;
  await app.listen(port);
  console.log(`🚀 Backend démarré sur http://localhost:${port}`);
}
bootstrap();
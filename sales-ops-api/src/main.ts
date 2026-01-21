import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración CORS – esto permite peticiones desde el frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174','http://localhost:3000',],  // agrega 5174 (Vite a veces cambia puerto)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
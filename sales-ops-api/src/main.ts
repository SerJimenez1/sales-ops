import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config(); // ← AGREGADO AQUÍ (carga .env al inicio del proceso)

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS completo para pruebas (permite TODO)
  app.enableCors({
    origin: ['https://mejikai-crm.vercel.app', 'http://localhost:5173'], // ← AGREGADA LA RUTA DE VERCEL AQUÍ
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend corriendo en http://192.168.18.6:${port}`);
}

bootstrap();
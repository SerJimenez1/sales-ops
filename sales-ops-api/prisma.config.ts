// prisma.config.ts
import 'dotenv/config';           // carga .env automáticamente
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',  // ruta a tu schema
  migrations: {
    path: 'prisma/migrations',     // carpeta de migraciones (por defecto)
  },
  datasource: {
    url: env('DATABASE_URL'),      // lee de .env
  },
});
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();  // ← Carga .env automáticamente (instala si no lo tienes)

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida en .env');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const empresas = [
    {
      ruc: '20456789012',
      nombre: 'Fibertel',
      dominio: 'gmail.com',
    },
    {
      ruc: '20512345678',
      nombre: 'Claro',
      dominio: 'google.com',
    },
    {
      ruc: '20123456789',
      nombre: 'Movistar',
      dominio: 'hotmail.com',
    },
    {
      ruc: '20678901234',
      nombre: 'Entel',
      dominio: 'yahoo.com',
    },
    {
      ruc: '20987654321',
      nombre: 'Bitel',
      dominio: 'outlook.com',
    },
    {
      ruc: '20345678901',
      nombre: 'Test Empresa',
      dominio: 'example.com',
    },
    {
      ruc: '20789012345',
      nombre: 'Tecsup',
      dominio: 'tecsup.edu.pe',
    },
  ];

  for (const empresa of empresas) {
    await prisma.empresa.upsert({
      where: { ruc: empresa.ruc },
      update: empresa,
      create: empresa,
    });
    console.log(`Empresa upsert: ${empresa.nombre} (${empresa.ruc}) - Dominio: ${empresa.dominio}`);
  }

  console.log('Seed completado: todas las empresas insertadas o actualizadas.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
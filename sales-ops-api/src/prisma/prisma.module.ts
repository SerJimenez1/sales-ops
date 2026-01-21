import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],  // ← Exporta el servicio para que otros módulos lo inyecten
})
export class PrismaModule {}
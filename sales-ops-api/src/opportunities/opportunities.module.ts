import { Module } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';
import { PrismaModule } from '../prisma/prisma.module';  // ← Agrega esta línea

@Module({
  imports: [PrismaModule],  // ← ¡Aquí es clave!
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
})
export class OpportunitiesModule {}
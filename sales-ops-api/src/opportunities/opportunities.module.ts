import { Module } from '@nestjs/common';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { PrismaModule } from 'prisma/prisma.module';
import { EmailModule } from '../services/email.module';  // ← Agrega esta línea

@Module({
  imports: [
    PrismaModule,
    EmailModule,  // ← Importa aquí para que OpportunitiesController pueda usar EmailService
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
})
export class OpportunitiesModule {}
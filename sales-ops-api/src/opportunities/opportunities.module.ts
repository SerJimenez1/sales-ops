import { Module } from '@nestjs/common';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { EmailModule } from '../services/email.module';  // ← Agrega esta línea

@Module({
  imports: [
    EmailModule,  // ← Importa aquí para que OpportunitiesController pueda usar EmailService
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
})
export class OpportunitiesModule {}
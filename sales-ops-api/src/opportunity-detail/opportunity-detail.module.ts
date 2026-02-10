import { Module } from '@nestjs/common';
import { OpportunityDetailService } from './opportunity-detail.service';
import { OpportunityDetailController } from './opportunity-detail.controller';

@Module({
  imports: [], // Prisma eliminado, pendiente nueva implementación de BD
  controllers: [OpportunityDetailController],
  providers: [OpportunityDetailService],
  exports: [OpportunityDetailService], // para usarlo en otros módulos si necesitas
})
export class OpportunityDetailModule {}
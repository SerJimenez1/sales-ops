import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from 'prisma/prisma.module'; // Ajusta la ruta si es necesario

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
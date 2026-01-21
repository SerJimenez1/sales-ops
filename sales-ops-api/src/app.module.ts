import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OpportunitiesModule,
    PrismaModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],  // ← ¡Esto es clave! Exporta para que otros módulos lo usen
})
export class AppModule {}
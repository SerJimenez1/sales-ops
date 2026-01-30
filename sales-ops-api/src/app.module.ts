import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';  // ← debe apuntar a src/auth/auth.module.ts

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OpportunitiesModule,
    PrismaModule,
    AuthModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],  // ← ¡Esto es clave! Exporta para que otros módulos lo usen
})
export class AppModule {}
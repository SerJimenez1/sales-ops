import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GmailModule } from './gmail/gmail.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmailModule } from './services/email.module';
import { SlaService } from './services/sla.service';  // ← Agrega este import

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    OpportunitiesModule,
    PrismaModule,
    AuthModule,
    GmailModule,
    DashboardModule,
    EmailModule,
  ],
  providers: [
    SlaService,  // ← Agrega aquí (o en un módulo global si prefieres)
  ],
})
export class AppModule {}
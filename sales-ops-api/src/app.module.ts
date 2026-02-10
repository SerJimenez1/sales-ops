import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { AuthModule } from './auth/auth.module';
import { GmailModule } from './gmail/gmail.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmailModule } from './services/email.module';
import { SlaService } from './services/sla.service';
import { OpportunityDetailModule } from './opportunity-detail/opportunity-detail.module';
import { AttachmentsModule } from './attachments/attachments.module'; // ← esta línea es la clave

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    OpportunitiesModule,
    AuthModule,
    GmailModule,
    DashboardModule,
    EmailModule,
    OpportunityDetailModule,
    AttachmentsModule, // ← asegúrate de que esté aquí
  ],
  providers: [SlaService],
})
export class AppModule {}
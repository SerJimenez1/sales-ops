import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // ← Agregado para cron/polling
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GmailModule } from './gmail/gmail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), // ← Necesario para setInterval o @Cron
    OpportunitiesModule,
    PrismaModule,
    AuthModule,
    GmailModule,
  ],
})
export class AppModule {}
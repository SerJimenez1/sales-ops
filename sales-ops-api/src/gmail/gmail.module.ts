import { Module, OnModuleInit } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GmailService],
  exports: [GmailService],
})
export class GmailModule implements OnModuleInit {
  constructor(private gmailService: GmailService) {}

  async onModuleInit() {
    // Inicia polling cada 5 minutos
    setInterval(() => this.gmailService.pollInbox(), 5 * 60 * 1000);
    console.log('Polling de Gmail iniciado cada 5 minutos');
  }
}
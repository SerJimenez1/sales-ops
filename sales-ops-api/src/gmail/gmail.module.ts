import { Module, OnModuleInit } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { EmailModule } from '../services/email.module';  // ← Import correcto (ruta relativa)
import { OpportunitiesModule } from '../opportunities/opportunities.module';
import { OpportunitiesService } from '../opportunities/opportunities.service'; // ← AGREGADO: solo esta línea (import del servicio)

@Module({
  imports: [
    EmailModule,// ← Aquí, en el array imports (solo una vez)
    OpportunitiesModule, 
  ],
  providers: [
    GmailService,
    OpportunitiesService, // ← AGREGADO: solo esta línea (provider explícito)
  ],
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
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class SlaService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkSlaVencidos() {
    const now = new Date();

    const vencidas = await this.prisma.opportunity.findMany({
      where: {
        slaDueDate: { lt: now },
        status: { not: 'pago' },
      },
      include: { responsable: true },
    });

    console.log(`[SLA Check] Encontradas ${vencidas.length} oportunidades vencidas para notificar - ${now.toLocaleTimeString()}`);

    for (const opp of vencidas) {
      if (opp.responsable?.email) {
        await this.emailService.sendEmail(
          opp.responsable.email,
          'SLA VENCIDO - Oportunidad',
          `La oportunidad "${opp.asunto || 'Sin asunto'}" venció el SLA.\n` +
          `Prioridad: ${opp.prioridad}\n` +
          `Creada: ${opp.createdAt.toLocaleString()}\n` +
          `ID: ${opp.id}\n` +
          `Ver detalles: http://192.168.18.6:5173/opportunities/${opp.id}`
        );

        console.log(`[SLA Check] Notificación enviada para Opportunity ${opp.id}`);
      }
    }
  }

  async testSlaVencidos() {
    await this.checkSlaVencidos();
    console.log('Test de SLA vencidos ejecutado manualmente');
  }
}
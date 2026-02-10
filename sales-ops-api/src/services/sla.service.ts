import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { supabaseAdmin as supabase } from '../lib/supabase';
import { EmailService } from './email.service';

@Injectable()
export class SlaService {
  constructor(private emailService: EmailService) {}

  private readonly SLA_DURATION_MS = 4 * 60 * 60 * 1000; // 4 horas (configurable)
  private notified80 = new Map<string, Date>(); // Evita spam en la misma ejecución

  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkSla() {
    const now = new Date();

    const { data: opps, error } = await supabase
      .from('opportunity')
      .select(`
        *,
        responsable:users!responsable_id (email, nombre)
      `)
      .not('status', 'eq', 'pago')
      .not('sla_due_date', 'is', null);

    if (error) {
      console.error('[SLA Check] Error al consultar oportunidades:', error.message);
      return;
    }

    console.log(`[SLA Check] Revisando ${opps.length} oportunidades con SLA - ${now.toLocaleTimeString()}`);

    let countVencidas = 0;
    let count80 = 0;

    for (const opp of opps) {
      if (!opp.responsable?.email) continue;

      const dueDate = new Date(opp.sla_due_date);
      const diffMs = dueDate.getTime() - now.getTime();

      // Caso 1: VENCIDO
      if (diffMs < 0) {
        countVencidas++;

        await this.emailService.sendEmail(
          opp.responsable.email,
          'SLA VENCIDO - Oportunidad',
          `La oportunidad "${opp.asunto || 'Sin asunto'}" ya venció el SLA.\n` +
          `Prioridad: ${opp.prioridad || 'media'}\n` +
          `Creada: ${new Date(opp.created_at).toLocaleString()}\n` +
          `ID: ${opp.id}\n` +
          `Ver detalles: http://192.168.18.6:5173/opportunities/${opp.id}`
        );

        console.log(`[SLA VENCIDO] Enviado para ${opp.id}`);
        continue;
      }

      // Caso 2: SLA al 80% (queda ≤20% del tiempo original)
      const remainingPercent = diffMs / this.SLA_DURATION_MS;
      if (remainingPercent <= 0.2) {
        const remainingHours = Math.ceil(diffMs / (1000 * 60 * 60));

        // Evitar spam en la misma ejecución
        const lastNotified = this.notified80.get(opp.id);
        if (!lastNotified || now.getTime() - lastNotified.getTime() > 60 * 60 * 1000) { // 1 hora cooldown
          count80++;

          await this.emailService.sendEmail(
            opp.responsable.email,
            'SLA cerca de vencer (80%) - Oportunidad',
            `La oportunidad "${opp.asunto || 'Sin asunto'}" está al 80% del SLA (queda menos del 20% del tiempo).\n` +
            `Tiempo restante aproximado: ${remainingHours} hora(s).\n` +
            `Prioridad: ${opp.prioridad || 'media'}\n` +
            `Creada: ${new Date(opp.created_at).toLocaleString()}\n` +
            `ID: ${opp.id}\n` +
            `Ver detalles: http://192.168.18.6:5173/opportunities/${opp.id}`
          );

          console.log(`[SLA 80%] Enviado para ${opp.id} (restan ~${remainingHours}h)`);
          this.notified80.set(opp.id, now);
        }
      }
    }

    console.log(`[SLA Resumen] ${count80} al 80% - ${countVencidas} vencidas - Total revisadas: ${opps.length}`);
  }

  async testSla() {
    await this.checkSla();
    console.log('Test de SLA ejecutado manualmente');
  }
}
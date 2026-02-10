import { Injectable } from '@nestjs/common';
import { supabaseAdmin as supabase } from '../lib/supabase';

@Injectable()
export class DashboardService {
  async getGroupedOpportunities() {
    const statuses = ['en_cola', 'en_cotizacion', 'cotizacion_enviada', 'ganado', 'pago'];

    const grouped = {
      en_cola: [],
      en_cotizacion: [],
      cotizacion_enviada: [],
      ganado: [],
      pago: [],
    };

    for (const status of statuses) {
      const { data: opportunities, error } = await supabase
        .from('opportunity')
        .select(`
          id,
          codigo,
          status,
          remitente,
          asunto,
          body,
          empresa_id,
          area_id,
          prioridad,
          responsable_id,
          sla_due_date,
          created_at,
          responsable:users!responsable_id (nombre)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false }); // más reciente primero

      if (error) {
        console.error(`Error al consultar oportunidades para status ${status}:`, error.message);
        continue;
      }

      opportunities.forEach(opp => {
        grouped[status].push({
          id: opp.id,
          asunto: opp.asunto || 'Sin asunto',
          remitente: opp.remitente || 'Desconocido',
          empresaRuc: opp.empresa_id || 'Sin empresa', // si quieres RUC real, agrega join con empresa
          area: opp.area_id || 'Sin área',
          prioridad: opp.prioridad || 'media',
          responsable: opp.responsable?.[0]?.nombre || 'Sin asignar', // ← CORREGIDO AQUÍ (accede al primer elemento del array)
          colaboradores: [], // opcional
          slaDueDate: opp.sla_due_date,
          createdAt: opp.created_at,
          
        });
      });
    }

    return grouped;
  }
}
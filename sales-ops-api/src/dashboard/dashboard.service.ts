import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getGroupedOpportunities() {
    const opportunities = await this.prisma.opportunity.findMany({
      include: {
        responsable: true, // Para traer nombre del responsable
      },
      orderBy: {
        createdAt: 'desc', // Orden por más reciente primero
      },
    });

    const grouped = {
      en_cola: [],
      en_cotizacion: [],
      cotizacion_enviada: [],
      ganado: [],
      pago: [],
    };

    opportunities.forEach(opp => {
      const group = grouped[opp.status];
      if (group) {
        group.push({
          id: opp.id,
          asunto: opp.asunto || 'Sin asunto',
          remitente: opp.remitente || 'Desconocido',
          empresaRuc: opp.empresaRuc || 'Sin empresa',
          area: opp.area || 'Sin área',
          prioridad: opp.prioridad || 'media',
          responsable: opp.responsable ? opp.responsable.name : 'Sin asignar',
          colaboradores: [], // Opcional, si lo agregas después
          slaDueDate: opp.slaDueDate,
          createdAt: opp.createdAt,
        });
      }
    });

    return grouped;
  }
}
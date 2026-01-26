import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  // Método para GET: listar todas las oportunidades con filtros 
async findAll(filters: { status?: string; prioridad?: string } = {}) {
    return this.prisma.opportunity.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.prioridad ? { prioridad: filters.prioridad } : {}),
      },
      orderBy: {
        slaDueDate: 'asc',  // vencen antes primero (ideal para dashboard TV y tablero)
      },
      include: {
        attachments: true,     // si tienes adjuntos, los trae
        responsable: true,     // si agregas usuarios/responsables después
      },
    });
  }


// Versión agrupada por status (para Kanban y dashboard TV incluye conteo de por columnas)
async findAllGrouped() {
    const statuses = ['en_cola', 'en_cotizacion', 'cotizacion_enviada', 'ganado', 'pago'];
  
    const grouped: Record<string, any> = {};
  
    for (const status of statuses) {
      const opportunities = await this.prisma.opportunity.findMany({
        where: { status },
        orderBy: { slaDueDate: 'asc' },
        include: { attachments: true },
      });
  
      grouped[status] = {
        items: opportunities,
        count: opportunities.length,
        expiredCount: opportunities.filter(o => o.slaDueDate && new Date(o.slaDueDate) < new Date()).length,
      };
    }
  
    return grouped;
  }
  async update(id: string, updateDto: { status?: string }) {
    return this.prisma.opportunity.update({
      where: { id },
      data: updateDto,
    });
  }
  // Método para POST: crear una nueva oportunidad
  async create(data: {
    remitente?: string;
    asunto?: string;
    body?: string;
    empresaRuc?: string;
    area?: string;
    prioridad?: string;
    responsableId?: string;
  }) {
    return this.prisma.opportunity.create({
      data: {
        remitente: data.remitente,
        asunto: data.asunto,
        body: data.body,
        empresaRuc: data.empresaRuc,
        area: data.area,
        prioridad: data.prioridad || 'media',
        responsableId: data.responsableId,
        status: 'en_cola',
        // SLA básico: 4 horas desde ahora (configurable después)
        slaDueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
      },
    });
  }
}
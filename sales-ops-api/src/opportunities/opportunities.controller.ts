import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { EmailService } from '../services/email.service';  // ← Importamos el servicio

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
    private readonly emailService: EmailService,  // ← Inyectamos EmailService
  ) {}

  @Get()
  async findAll() {
    return this.opportunitiesService.findAll();
  }

  @Get('grouped')
  async getGrouped() {
    return this.opportunitiesService.findAllGrouped();
  }

  @Get('templates/:empresaId')
  async getTemplatesByEmpresa(@Param('empresaId') empresaId: string) {
    const templates = await this.opportunitiesService.getTemplatesByEmpresa(empresaId);
    return templates;
  }

  @Post()
  async create(@Body() createOpportunityDto: CreateOpportunityDto) {
    // Creamos la Opportunity trayendo el responsable
    const newOpp = await this.opportunitiesService.create(createOpportunityDto);

    // Enviar notificación al responsable (si tiene)
    if (newOpp.responsable?.email) {
      await this.emailService.sendEmail(
        newOpp.responsable.email,
        'Nueva oportunidad asignada (creada manualmente)',
        `Se te asignó la oportunidad: ${newOpp.asunto || 'Sin asunto'}\n` +
        `RUC: ${newOpp.empresaRuc || 'No detectado'}\n` +
        `Prioridad: ${newOpp.prioridad}\n` +
        `Creada: ${newOpp.createdAt.toLocaleString()}\n` +
        `ID: ${newOpp.id}`
      );
    }

    return newOpp;
  }

  @Post(':id/create-template-copy')
async createTemplateCopy(
  @Param('id') opportunityId: string,
  @Body() body: { templateId: string },
  ) {
  return this.opportunitiesService.createTemplateCopy(opportunityId, body);
}

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.opportunitiesService.update(id, updateDto);
  }
}
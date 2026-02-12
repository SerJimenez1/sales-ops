import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { EmailService } from '../services/email.service';
import { supabaseAdmin as supabase } from '../lib/supabase';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
    private readonly emailService: EmailService,
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
    return this.opportunitiesService.getTemplatesByEmpresa(empresaId);
  }

  @Get('proveedores')
  async getProveedores() {
    const { data, error } = await supabase
      .from('proveedor')
      .select('id, razon_social, ruc, rubro, contacto, telefono, email, ciudad, activo')
      .eq('activo', true)
      .order('razon_social');

    if (error) throw new Error(error.message);
    return data || [];
  }

  // ✅ IMPORTANTE: Este endpoint debe estar ANTES de @Get(':id')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id); // ✅ Usa el método del service
  }

  @Post()
  async create(@Body() createOpportunityDto: CreateOpportunityDto) {
    const newOpp = await this.opportunitiesService.create(createOpportunityDto);

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

  @Post(':id/pagos')
async crearPago(
  @Param('id') opportunityId: string,
  @Body() body: any, // monto, fecha_pago, metodo, banco, numero_operacion, etc.
) {
  const { data, error } = await supabase
    .from('pago')
    .insert({
      opportunity_id: opportunityId,
      ...body,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

@Get(':id/pagos')
async getPagos(@Param('id') opportunityId: string) {
  const { data, error } = await supabase
    .from('pago')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('fecha_pago', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.opportunitiesService.update(id, updateDto);
  }

  // ✅ CORREGIDO: Usa el método linkProveedor del service
  @Patch(':id/proveedor')
  async vincularProveedor(
    @Param('id') id: string,
    @Body() body: { proveedorId: string; esPrincipal: boolean },
  ) {
    return this.opportunitiesService.linkProveedor(id, body);
  }
}
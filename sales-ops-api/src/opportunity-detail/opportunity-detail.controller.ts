import { Controller, Get, Patch, Param, Body, NotFoundException } from '@nestjs/common';
import { OpportunityDetailService } from './opportunity-detail.service';

@Controller('opportunities')
export class OpportunityDetailController {
  constructor(private readonly detailService: OpportunityDetailService) {}

  @Get(':id/detail')
  async findOne(@Param('id') id: string) {
    const detail = await this.detailService.findOne(id);
    if (!detail) {
      throw new NotFoundException('Detalle no encontrado para esta oportunidad');
    }
    return detail;
  }

  @Patch(':id/detail')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.detailService.upsert(id, data);
  }
}
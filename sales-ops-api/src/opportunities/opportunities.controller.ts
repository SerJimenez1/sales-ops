import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';  // ← Aquí el fix
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto'; // si lo tienes

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  async findAll() {
    return this.opportunitiesService.findAll();
  }

  @Get('grouped')
  async getGrouped() {
    return this.opportunitiesService.findAllGrouped();
  }

  @Post()
  create(@Body() createOpportunityDto: CreateOpportunityDto) {
    return this.opportunitiesService.create(createOpportunityDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.opportunitiesService.update(id, updateDto);
  }
}
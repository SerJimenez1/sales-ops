import { Controller, Get, Post, Body } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto'; // si lo tienes

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  async findAll() {
    return this.opportunitiesService.findAll();
  }

  @Get('grouped')  // ← ¡Esta es la ruta clave!
  async getGrouped() {
    return this.opportunitiesService.findAllGrouped();
  }

  @Post()
  create(@Body() createOpportunityDto: CreateOpportunityDto) {
    return this.opportunitiesService.create(createOpportunityDto);
  }
}
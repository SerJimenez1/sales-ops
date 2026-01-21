import { IsString, IsOptional } from 'class-validator';

export class CreateOpportunityDto {
  @IsString()
  @IsOptional()
  remitente?: string;

  @IsString()
  @IsOptional()
  asunto?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  empresaRuc?: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsString()
  @IsOptional()
  prioridad?: string;

  @IsString()
  @IsOptional()
  responsableId?: string;
}
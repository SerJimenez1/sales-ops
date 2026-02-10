import { Injectable } from '@nestjs/common';
import { supabaseAdmin as supabase } from '../lib/supabase';

@Injectable()
export class OpportunityDetailService {
  async findOne(opportunityId: string) {
    const { data, error } = await supabase
      .from('opportunity_detail')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(`Error al buscar detalle: ${error.message}`);
    }

    return data || null;
  }

  async upsert(opportunityId: string, data: any) {
    const { data: result, error } = await supabase
      .from('opportunity_detail')
      .upsert({
        opportunity_id: opportunityId,
        entidad_area: data.entidadArea,
        objeto: data.objeto,
        fecha_limite_presentacion: data.fechaLimite ? new Date(data.fechaLimite) : null,
        lugar_entrega_servicio: data.lugar,
        monto_referencial: data.montoReferencial,
        observaciones: data.observaciones,
      }, {
        onConflict: 'opportunity_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al guardar detalle: ${error.message}`);
    }

    return result;
  }
}
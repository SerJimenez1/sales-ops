import { Injectable } from '@nestjs/common';
import { supabaseAdmin as supabase } from '../lib/supabase';

@Injectable()
export class OpportunitiesService {
  // GET /opportunities - Listar todas con filtros opcionales
  async findAll(filters: { status?: string; prioridad?: string } = {}) {
    let query = supabase.from('opportunity').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.prioridad) {
      query = query.eq('prioridad', filters.prioridad);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al listar oportunidades: ${error.message}`);
    }

    return data || [];
  }

  // GET /opportunities/grouped - Para el tablero Kanban
  async findAllGrouped() {
    const statuses = [
      'en_cola',
      'en_cotizacion',
      'cotizacion_enviada',
      'ganado',
      'pago',
    ];

    const grouped: Record<string, { items: any[]; count: number; expiredCount: number }> = {};

    for (const status of statuses) {
      const { data, error } = await supabase
        .from('opportunity')
        .select(`
          id,
          codigo,
          status,
          remitente,
          asunto,
          body,
          empresa_id,
          entidad_publica_id,
          area_id,
          responsable_id,
          prioridad,
          sla_due_date,
          created_at,
          responsable:users!responsable_id (nombre),
          empresa:empresa!empresa_id (ruc, razon_social),
          entidad_publica:entidad_publica!entidad_publica_id (ruc, razon_social),
          opportunity_detail(*),
          attachments:attachment!opportunity_id (*)
        `)
        .eq('status', status)
        .order('sla_due_date', { ascending: true });

      if (error) {
        console.error(`Error al agrupar por ${status}:`, error.message);
        grouped[status] = { items: [], count: 0, expiredCount: 0 };
        continue;
      }

      const now = new Date();
      const expiredCount = data.filter(opp => opp.sla_due_date && new Date(opp.sla_due_date) < now).length;

      grouped[status] = {
        items: data || [],
        count: data.length,
        expiredCount,
      };
    }

    return grouped;
  }

  // PATCH /opportunities/:id - Actualizar estado o campos básicos
  async update(id: string, updateDto: { status?: string }) {
    const { data, error } = await supabase
      .from('opportunity')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar oportunidad: ${error.message}`);
    }

    return data;
  }

  // POST /opportunities - Crear una nueva oportunidad
  async create(data: {
    remitente?: string;
    asunto?: string;
    body?: string;
    empresaRuc?: string;
    area?: string;
    prioridad?: string;
    responsableId?: string;
    status?: string;
    slaDueDate?: string;
    codigo?: string;
  }) {
    const { data: opp, error } = await supabase
      .from('opportunity')
      .insert({
        remitente: data.remitente,
        asunto: data.asunto,
        body: data.body,
        empresa_id: data.empresaRuc,
        area_id: data.area,
        prioridad: data.prioridad || 'media',
        responsable_id: data.responsableId,
        status: data.status || 'en_cola',
        sla_due_date: data.slaDueDate || null,
        codigo: data.codigo || `OPP-${Date.now()}`,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear oportunidad: ${error.message}`);
    }

    return opp;
  }

  async getTemplatesByEmpresa(empresaId: string) {
    const { data, error } = await supabase
      .from('template')
      .select('id, nombre, tipo, storage_key, activo, created_at')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(`Error al listar plantillas: ${error.message}`);
    }

    return data || [];
  }

  async createTemplateCopy(opportunityId: string, body: { templateId: string }) {
    // 1. Buscar la plantilla
    const { data: template, error: templateError } = await supabase
      .from('template')
      .select('storage_key, nombre, tipo')
      .eq('id', body.templateId)
      .eq('activo', true)
      .single();

    if (templateError || !template) {
      throw new Error('Plantilla no encontrada o inactiva');
    }

    // 2. LIMPIAR la ruta (quitar prefijo "templates/" si existe)
    const cleanPath = template.storage_key.replace(/^templates\//, '');
    
    console.log('[DEBUG] Storage key guardado en BD:', template.storage_key);
    console.log('[DEBUG] Clean path:', cleanPath);

    // 3. DESCARGAR el archivo del bucket templates
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('templates')
      .download(cleanPath);

    if (downloadError) {
      throw new Error(`Error al descargar plantilla: ${downloadError.message}`);
    }

    // 4. Preparar el nuevo nombre y ruta
    const extension = template.tipo === 'excel' ? 'xlsx' : 
                      template.tipo === 'word' ? 'docx' : 'pdf';
    const newFileName = `${template.nombre}-${Date.now()}.${extension}`;
    const newPath = `${opportunityId}/${newFileName}`;

    console.log('[DEBUG] Nueva ruta en attachments:', newPath);

    // 5. SUBIR al bucket attachments
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(newPath, fileBlob, {
        contentType: template.tipo === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : template.tipo === 'word' 
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Error al subir copia: ${uploadError.message}`);
    }

    // 6. Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(newPath);

    // 7. Crear attachment en la oportunidad
    const { data: attachment, error: attachError } = await supabase
      .from('attachment')
      .insert({
        opportunity_id: opportunityId,
        tipo: 'tdr',
        origen: 'manual',
        file_name: newFileName,
        storage_key: newPath,
        content_type: template.tipo === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : template.tipo === 'word' 
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/pdf',
        size_kb: Math.round(fileBlob.size / 1024),
        uploaded_by: null, // ← CORREGIDO: null real (sin comillas) – permite NULL en uuid
      })
      .select()
      .single();

    if (attachError) {
      throw new Error(`Error al registrar copia: ${attachError.message}`);
    }

    return { 
      publicUrl: publicUrlData.publicUrl, 
      attachment 
    };
  }
}
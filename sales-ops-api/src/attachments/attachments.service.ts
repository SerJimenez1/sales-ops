import { Injectable } from '@nestjs/common';
import { supabaseAdmin as supabase } from '../lib/supabase';

@Injectable()
export class AttachmentsService {
  async uploadFile(opportunityId: string, file: Express.Multer.File, type: string) {
    console.log('[ATTACH] Iniciando subida para opportunityId:', opportunityId);
    console.log('[ATTACH] Archivo recibido:', file.originalname, file.size, file.mimetype);

    const fileName = `${opportunityId}/${Date.now()}-${file.originalname}`;
    console.log('[ATTACH] Subiendo a Storage con key:', fileName);

    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error('[ATTACH] Error en Storage:', error.message);
      throw new Error(`Error al subir archivo: ${error.message}`);
    }

    console.log('[ATTACH] Subida OK en Storage:', data);

    const publicUrl = supabase.storage.from('attachments').getPublicUrl(fileName).data.publicUrl;
    console.log('[ATTACH] Public URL:', publicUrl);

    const { data: attachment, error: dbError } = await supabase
      .from('attachment')
      .insert({
        opportunity_id: opportunityId,
        file_name: file.originalname,
        storage_key: fileName,
        content_type: file.mimetype,
        size_kb: file.size / 1024,
        tipo: type,
        origen: 'manual',
        uploaded_by: null, // ← CORREGIDO (null o UUID real)
      })
      .select()
      .single();

    if (dbError) {
      console.error('[ATTACH] Error al guardar en BD:', dbError.message);
      throw new Error(`Error al guardar metadata: ${dbError.message}`);
    }

    console.log('[ATTACH] Registro creado en BD:', attachment);

    return { publicUrl, attachment };
  }
}
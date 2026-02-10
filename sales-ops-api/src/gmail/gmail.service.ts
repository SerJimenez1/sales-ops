import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { EmailService } from '../services/email.service';
import { OpportunitiesService } from '../opportunities/opportunities.service'; // ← SOLO ESTA LÍNEA AGREGADA

@Injectable()
export class GmailService {
  private gmail: any;

  constructor(
    private emailService: EmailService,
    private opportunitiesService: OpportunitiesService,
  ) {
    const auth = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async pollInbox() {
    try {
      console.log('Iniciando polling de Gmail Inbox...');

      const res = await this.gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread label:INBOX',
        maxResults: 5,
      });

      const messages = res.data.messages || [];

      if (messages.length === 0) {
        console.log('No hay correos nuevos no leídos en Inbox.');
        return;
      }

      console.log(`Encontrados ${messages.length} correos nuevos.`);

      for (const msg of messages) {
        const emailRes = await this.gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });

        const email = emailRes.data;

        const headers = email.payload?.headers || [];

        const from = headers.find((h: any) => h.name === 'From')?.value || 'desconocido';
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'Sin asunto';
        const dateStr = headers.find((h: any) => h.name === 'Date')?.value || new Date().toISOString();

        // Detección automática de Empresa/RUC por dominio del remitente
        let empresaRuc: string | null = null;
        let fromDomain = from.split('@').pop()?.trim().toLowerCase() || null;
        if (fromDomain && fromDomain.endsWith('>')) {
          fromDomain = fromDomain.slice(0, -1);
        }
        console.log('Dominio del remitente detectado:', fromDomain);

        if (fromDomain) {
          // TODO: Buscar empresa por dominio con la nueva base de datos
          console.log('Búsqueda de empresa por dominio pendiente de nueva BD');
        }

        // Crear Opportunity automáticamente desde el correo
        try {
          const newOpp = await this.opportunitiesService.create({
            remitente: from,
            asunto: subject,
            codigo: `OPP-${Date.now()}`, // ← AGREGADO: genera un código único automático
            body: email.snippet || 'Sin cuerpo visible',
            empresaRuc: empresaRuc || undefined,
            area: undefined,
            prioridad: 'media',
            responsableId: undefined,
            status: 'en_cola',
            slaDueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // SLA 4 horas desde ahora
          });

          console.log('Opportunity creada automáticamente desde correo:', newOpp.id);
        } catch (createError) {
          console.error('Error al crear Opportunity desde correo:', createError);
        }

        // Marcar como leído
        await this.gmail.users.messages.modify({
          userId: 'me',
          id: msg.id,
          requestBody: {
            removeLabelIds: ['UNREAD'],
          },
        });
      }
    } catch (error) {
      console.error('Error en polling de Gmail:', error);
    }
  }
}
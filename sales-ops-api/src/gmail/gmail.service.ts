import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';  // Ruta correcta (ajusta si está en otra ubicación)
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GmailService {
  private gmail: any;

  constructor(private prisma: PrismaService) {
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
          fromDomain = fromDomain.slice(0, -1); // Quita ">" final si existe
        }
        console.log('Dominio del remitente detectado:', fromDomain); // Log para depurar

        if (fromDomain) {
          const empresa = await this.prisma.empresa.findFirst({
            where: { dominio: fromDomain },
          });
          if (empresa) {
            empresaRuc = empresa.ruc;
            console.log('Empresa detectada por dominio:', empresa.nombre, empresa.ruc);
          } else {
            console.log('No se encontró empresa para dominio:', fromDomain);
          }
        }

        // Crear Opportunity con detección de empresa
        await this.prisma.opportunity.create({
          data: {
            remitente: from,
            asunto: subject,
            createdAt: new Date(dateStr),
            body: email.snippet || 'Sin contenido',
            status: 'en_cola',
            prioridad: 'media',
            empresaRuc: empresaRuc,
          },
        });

        console.log('Opportunity creada desde correo:', subject, 'Empresa/RUC:', empresaRuc || 'No detectado');

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
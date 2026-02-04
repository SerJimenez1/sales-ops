import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';  // Ruta correcta
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { EmailService } from '../services/email.service'; // ← Importamos el servicio de email

@Injectable()
export class GmailService {
  private gmail: any;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService, // ← Inyectamos EmailService
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
        const newOpp = await this.prisma.opportunity.create({
          data: {
            remitente: from,
            asunto: subject,
            createdAt: new Date(dateStr),
            body: email.snippet || 'Sin contenido',
            status: 'en_cola',
            prioridad: 'media',
            empresaRuc: empresaRuc,
          },
          include: { responsable: true }, // ← Traemos el responsable para enviar email
        });

        console.log('Opportunity creada desde correo:', subject, 'Empresa/RUC:', empresaRuc || 'No detectado');

        // Notificación al responsable (si tiene responsable asignado)
        if (newOpp.responsable?.email) {
          await this.emailService.sendEmail(
            newOpp.responsable.email,
            'Nueva oportunidad asignada',
            `Se te asignó la oportunidad: ${newOpp.asunto || 'Sin asunto'}\n` +
            `RUC: ${newOpp.empresaRuc || 'No detectado'}\n` +
            `Prioridad: ${newOpp.prioridad}\n` +
            `Creada: ${newOpp.createdAt.toLocaleString()}\n` +
            `ID: ${newOpp.id}`
          );
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
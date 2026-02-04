import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Mejikai CRM" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html: `<p>${text.replace(/\n/g, '<br>')}</p>`, // Versión HTML simple
      });
      console.log('Email enviado:', info.messageId);
    } catch (error) {
      console.error('Error enviando email:', error);
    }
  }
}
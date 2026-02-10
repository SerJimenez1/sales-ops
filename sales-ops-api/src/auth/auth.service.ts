import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  constructor() {
    console.log('GOOGLE_REFRESH_TOKEN cargado:', process.env.GOOGLE_REFRESH_TOKEN ? 'Sí' : 'No');
    console.log('OAuth2Client inicializado con client_id:', process.env.GOOGLE_CLIENT_ID);
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://mail.google.com/'],
    });
  }

  async getTokens(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      console.log('Tokens obtenidos exitosamente:', tokens);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error al obtener tokens:', error);
      throw new Error('Fallo al obtener tokens de Google: ' + (error as any).message);
    }
  }
}
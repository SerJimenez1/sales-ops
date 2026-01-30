import { Controller, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';  // ← Cambiado a import type

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  getAuthUrl() {
    return { url: this.authService.getAuthUrl() };
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const tokens = await this.authService.getTokens(code);
      console.log('Tokens obtenidos:', tokens);

      // Muestra en pantalla los tokens (para pruebas)
      res.send(`
        <h1>Tokens obtenidos</h1>
        <pre>${JSON.stringify(tokens, null, 2)}</pre>
        <p>Copia el refresh_token y agrégalo a .env</p>
      `);
    } catch (error) {
      console.error('Error en callback:', error);
      res.status(500).send('Error al obtener tokens: ' + error.message);
    }
  }
}
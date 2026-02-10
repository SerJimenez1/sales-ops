import { Controller, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

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

      res.send(`
        <h1>Tokens obtenidos exitosamente</h1>
        <pre>${JSON.stringify(tokens, null, 2)}</pre>
        <p><strong>¡Copia el refresh_token y agrégalo a .env como GOOGLE_REFRESH_TOKEN!</strong></p>
        <p>Puedes cerrar esta pestaña ahora.</p>
      `);
    } catch (error) {
      console.error('Error en callback:', error);
      res.status(500).send(`
        <h1>Error al obtener tokens</h1>
        <pre>${error.message}</pre>
        <p>Intenta de nuevo o revisa la consola del backend.</p>
      `);
    }
  }
}
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService], // opcional, si lo usas en otros módulos
})
export class AuthModule {}
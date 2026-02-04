import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService],  // ← Obligatorio para que otros módulos lo usen
})
export class EmailModule {}  // ← Export nombrado, clase EmailModule
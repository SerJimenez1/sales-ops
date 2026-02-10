import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { MulterModule } from '@nestjs/platform-express'; // para manejar archivos

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/temp', // carpeta temporal para archivos antes de subir a Supabase
    }),
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService], // para usarlo en otros módulos si necesitas
})
export class AttachmentsModule {}
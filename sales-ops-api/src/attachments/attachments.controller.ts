import { Controller, Post, Get, UploadedFile, UseInterceptors, Body } from '@nestjs/common'; // ← agrega Get aquí
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { opportunityId: string; type: string },
  ) {
    return this.attachmentsService.uploadFile(body.opportunityId, file, body.type);
  }

  // Endpoint temporal para test (GET)
  @Get('test-upload')
  async testUpload() {
    return { message: 'Endpoint /attachments está mapeado correctamente' };
  }
}
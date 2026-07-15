import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    // MulterModule handles multipart/form-data (file uploads).
    // memoryStorage keeps the file in RAM as a Buffer; we then write it to disk.
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}

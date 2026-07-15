import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import * as path from 'path';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_TYPES.includes(file.mimetype)) throw new BadRequestException('Only PNG, JPEG, GIF, and WEBP are allowed');
    if (file.size > MAX_SIZE) throw new BadRequestException('File must be 5MB or smaller');

    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : '';
    const filename = `${randomUUID()}${safeExt}`;

    const uploadsDir = path.join(process.cwd(), '..', 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), file.buffer);

    return { url: `/uploads/${filename}` };
  }
}

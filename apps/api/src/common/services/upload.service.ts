import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { sanitizeFilename } from '../utils/filename.util';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class UploadService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  async uploadStoryMedia(file: Express.Multer.File): Promise<UploadResult> {
    this.validateFile(file);

    const isVideo = file.mimetype.startsWith('video/');
    const folder = isVideo ? 'stories/videos' : 'stories/images';

    return this.saveFile(file, folder);
  }

  async uploadPostImage(file: Express.Multer.File): Promise<UploadResult> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não permitido. Use JPG, PNG ou WebP.');
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Imagem muito grande. Máximo 10MB.');
    }

    return this.saveFile(file, 'posts');
  }

  async uploadCover(file: Express.Multer.File): Promise<UploadResult> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não permitido. Use JPG, PNG ou WebP.');
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Imagem muito grande. Máximo 10MB.');
    }

    return this.saveFile(file, 'covers');
  }

  async uploadAvatar(file: Express.Multer.File): Promise<UploadResult> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não permitido. Use JPG, PNG ou WebP.');
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Imagem muito grande. Máximo 10MB.');
    }

    return this.saveFile(file, 'avatars');
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        'Tipo de arquivo não permitido. Use JPG, PNG, WebP ou MP4.',
      );
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Imagem muito grande. Máximo 10MB.');
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      throw new BadRequestException('Vídeo muito grande. Máximo 50MB.');
    }
  }

  private async saveFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    const ext = path.extname(sanitizeFilename(file.originalname)) || '.bin';
    const filename = `${uuid()}${ext}`;
    const folderPath = path.join(this.uploadDir, folder);

    // Ensure folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, filename);

    // Write buffer to file
    fs.writeFileSync(filePath, file.buffer);

    // In production, this would return a CloudFront/S3 URL
    // For local dev, return a path served by the static file middleware
    const url = `/uploads/${folder}/${filename}`;

    return {
      url,
      key: `${folder}/${filename}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }
}

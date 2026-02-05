import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AttachmentType } from '@prisma/client';

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES: Record<string, AttachmentType> = {
  'image/jpeg': AttachmentType.IMAGE,
  'image/png': AttachmentType.IMAGE,
  'image/gif': AttachmentType.IMAGE,
  'video/mp4': AttachmentType.VIDEO,
  'video/quicktime': AttachmentType.VIDEO,
  'application/pdf': AttachmentType.DOCUMENT,
  'application/msword': AttachmentType.DOCUMENT,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': AttachmentType.DOCUMENT,
};

interface UploadFileInput {
  userId: string;
  associationId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string; // URL where the file was uploaded (S3, etc.)
}

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate and register an uploaded file
   * Returns a temporary upload record valid for 1 hour
   */
  async registerUpload(input: UploadFileInput) {
    // Validate file size
    if (input.sizeBytes > MAX_FILE_SIZE) {
      throw new BadRequestException({
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }

    // Validate MIME type
    const attachmentType = ALLOWED_MIME_TYPES[input.mimeType];
    if (!attachmentType) {
      throw new BadRequestException({
        code: 'INVALID_FILE_TYPE',
        message: `File type ${input.mimeType} is not allowed`,
      });
    }

    // Create temporary upload record (expires in 1 hour)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const upload = await this.prisma.supportUpload.create({
      data: {
        userId: input.userId,
        associationId: input.associationId,
        type: attachmentType,
        url: input.url,
        filename: input.filename,
        sizeBytes: input.sizeBytes,
        mimeType: input.mimeType,
        expiresAt,
      },
    });

    this.logger.log(`Registered upload ${upload.id} for user ${input.userId}`);

    return {
      data: {
        id: upload.id,
        type: upload.type,
        url: upload.url,
        filename: upload.filename,
        sizeBytes: upload.sizeBytes,
        mimeType: upload.mimeType,
        expiresAt: upload.expiresAt,
      },
    };
  }

  /**
   * Validate that attachment IDs exist and belong to user
   */
  async validateAttachments(attachmentIds: string[], userId: string): Promise<boolean> {
    if (!attachmentIds.length) return true;

    const uploads = await this.prisma.supportUpload.findMany({
      where: {
        id: { in: attachmentIds },
        userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (uploads.length !== attachmentIds.length) {
      throw new BadRequestException({
        code: 'ATTACHMENT_EXPIRED',
        message: 'One or more attachments are expired or invalid',
      });
    }

    return true;
  }

  /**
   * Clean up expired uploads
   * Should be called periodically by a cron job
   */
  async cleanupExpiredUploads() {
    const result = await this.prisma.supportUpload.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} expired uploads`);
    }

    return result.count;
  }

  /**
   * Get allowed MIME types for client
   */
  getAllowedMimeTypes() {
    return {
      data: {
        maxSizeBytes: MAX_FILE_SIZE,
        maxSizeMB: MAX_FILE_SIZE / 1024 / 1024,
        allowedTypes: Object.keys(ALLOWED_MIME_TYPES),
      },
    };
  }
}

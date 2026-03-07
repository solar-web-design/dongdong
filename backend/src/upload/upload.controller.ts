import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.hwp', '.hwpx', '.txt', '.zip'];
const FILE_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/x-hwp',
  'application/haansofthwp',
  'text/plain',
  'application/zip',
];
const ALL_EXTENSIONS = [...IMAGE_EXTENSIONS, ...FILE_EXTENSIONS];
const ALL_MIME_TYPES = [...IMAGE_MIME_TYPES, ...FILE_MIME_TYPES];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function createFileInterceptor(allowedExt: string[], allowedMime: string[], maxSize: number) {
  return FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${ext}`);
      },
    }),
    limits: { fileSize: maxSize },
    fileFilter: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!allowedExt.includes(ext)) {
        cb(new BadRequestException('허용되지 않는 파일 확장자입니다'), false);
        return;
      }
      if (!allowedMime.includes(file.mimetype)) {
        cb(new BadRequestException('허용되지 않는 MIME 타입입니다'), false);
        return;
      }
      cb(null, true);
    },
  });
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(createFileInterceptor(IMAGE_EXTENSIONS, IMAGE_MIME_TYPES, MAX_IMAGE_SIZE))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 필요합니다');
    }
    return this.uploadService.uploadFile(file);
  }

  @Post('file')
  @UseInterceptors(createFileInterceptor(ALL_EXTENSIONS, ALL_MIME_TYPES, MAX_FILE_SIZE))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 필요합니다');
    }
    return this.uploadService.uploadFile(file);
  }
}

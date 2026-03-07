import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
  }

  uploadFile(file: Express.Multer.File): { url: string; originalName: string; size: number } {
    return {
      url: `${this.baseUrl}/uploads/${file.filename}`,
      originalName: file.originalname,
      size: file.size,
    };
  }
}

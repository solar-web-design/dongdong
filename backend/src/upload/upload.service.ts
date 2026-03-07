import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
  }

  uploadImage(file: Express.Multer.File): { url: string } {
    return { url: `${this.baseUrl}/uploads/${file.filename}` };
  }
}

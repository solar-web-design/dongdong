import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 쿠키 파서 (HttpOnly 쿠키 JWT 인증)
  app.use(cookieParser());

  // 정적 파일 서빙 (업로드 이미지) — globalPrefix 적용 전에 설정
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // CORS - 허용 origin 명시 (helmet보다 먼저 설정)
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  app.enableCors({
    origin: (origin, callback) => {
      // 서버 간 요청 (origin 없음) 허용
      if (!origin) return callback(null, true);
      // 명시적 origin 매칭
      if (corsOrigins.includes(origin)) return callback(null, true);
      // *.aidongdong.co.kr 서브도메인 허용
      if (/^https?:\/\/([a-z0-9-]+\.)?aidongdong\.co\.kr$/.test(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  });

  // 보안 헤더 (X-Frame-Options, X-Content-Type-Options 등)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // 입력 검증 - whitelist로 허용되지 않은 필드 차단
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

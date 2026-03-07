import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private getJwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다');
    return secret;
  }

  private getJwtRefreshSecret(): string {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret)
      throw new Error('JWT_REFRESH_SECRET 환경변수가 설정되지 않았습니다');
    return secret;
  }

  async register(dto: RegisterDto, tenantId?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('이미 등록된 이메일입니다');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        university: dto.university,
        department: dto.department,
        admissionYear: dto.admissionYear,
        graduationYear: dto.graduationYear,
        studentId: dto.studentId,
        bio: dto.bio,
        company: dto.company,
        position: dto.position,
        location: dto.location,
        ...(tenantId && { tenantId }),
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.password) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    if (user.status === 'PENDING') {
      throw new ForbiddenException('가입 승인 대기 중입니다');
    }
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('정지된 계정입니다');
    }
    if (user.status === 'WITHDRAWN') {
      throw new UnauthorizedException('탈퇴한 계정입니다');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    // Refresh Token 해시 후 DB 저장
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    const { password, refreshToken, ...userWithoutSensitive } = user;
    return {
      ...tokens,
      user: userWithoutSensitive,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.getJwtRefreshSecret(),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
      }

      // 해시 비교로 검증
      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
      }

      const tokens = await this.generateTokens(user.id, user.email);

      const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
      });

      return tokens;
    } catch {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: '로그아웃 되었습니다' };
  }

  async oauthKakao(code: string, tenantId?: string) {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.configService.get('KAKAO_CLIENT_ID') || '',
        client_secret: this.configService.get('KAKAO_CLIENT_SECRET') || '',
        redirect_uri: this.configService.get('KAKAO_CALLBACK_URL') || '',
        code,
      }),
    });
    if (!tokenRes.ok) throw new UnauthorizedException('카카오 인증에 실패했습니다');
    const tokenData = await tokenRes.json();

    const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!profileRes.ok) throw new UnauthorizedException('카카오 프로필 조회에 실패했습니다');
    const profile = await profileRes.json();

    const kakaoId = String(profile.id);
    const email = profile.kakao_account?.email;
    const name = profile.kakao_account?.profile?.nickname || '카카오 사용자';
    const profileImage = profile.kakao_account?.profile?.profile_image_url;

    return this.handleOAuthLogin({ kakaoId, email, name, profileImage, tenantId });
  }

  async oauthGoogle(code: string, tenantId?: string) {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.configService.get('GOOGLE_CLIENT_ID') || '',
        client_secret: this.configService.get('GOOGLE_CLIENT_SECRET') || '',
        redirect_uri: this.configService.get('GOOGLE_CALLBACK_URL') || '',
        code,
      }),
    });
    if (!tokenRes.ok) throw new UnauthorizedException('구글 인증에 실패했습니다');
    const tokenData = await tokenRes.json();

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!profileRes.ok) throw new UnauthorizedException('구글 프로필 조회에 실패했습니다');
    const profile = await profileRes.json();

    return this.handleOAuthLogin({
      googleId: profile.id,
      email: profile.email,
      name: profile.name || '구글 사용자',
      profileImage: profile.picture,
      tenantId,
    });
  }

  private async handleOAuthLogin(data: {
    kakaoId?: string;
    googleId?: string;
    email?: string;
    name: string;
    profileImage?: string;
    tenantId?: string;
  }) {
    const where = data.kakaoId
      ? { kakaoId: data.kakaoId }
      : { googleId: data.googleId! };

    let user = await this.prisma.user.findUnique({ where });
    let isNewUser = false;

    if (!user && data.email) {
      user = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: data.kakaoId ? { kakaoId: data.kakaoId } : { googleId: data.googleId },
        });
      }
    }

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          email: data.email || `${data.kakaoId || data.googleId}@oauth.local`,
          name: data.name,
          profileImage: data.profileImage,
          university: '',
          ...(data.kakaoId ? { kakaoId: data.kakaoId } : { googleId: data.googleId }),
          ...(data.tenantId && { tenantId: data.tenantId }),
        },
      });
    }

    if (user.status === 'SUSPENDED') throw new ForbiddenException('정지된 계정입니다');
    if (user.status === 'WITHDRAWN') throw new UnauthorizedException('탈퇴한 계정입니다');

    const tokens = await this.generateTokens(user.id, user.email);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    const { password, refreshToken, ...userWithoutSensitive } = user;
    return { ...tokens, user: userWithoutSensitive, isNewUser };
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getJwtSecret(),
        expiresIn: '30m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.getJwtRefreshSecret(),
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}

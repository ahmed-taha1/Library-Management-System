import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma';
import { AppConfigService } from '../../config';
import { LoginDto, RefreshTokenDto } from './dto';
import {
  InvalidCredentialsException,
  InvalidTokenException,
  TokenExpiredException,
  TokenRevokedException,
} from '../../common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: AppConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    return this.generateTokens(user.id, user.email);
  }

  async refresh(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new InvalidTokenException('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      throw new TokenRevokedException();
    }

    if (storedToken.expiresAt < new Date()) {
      throw new TokenExpiredException();
    }

    // Revoke the old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(storedToken.user.id, storedToken.user.email);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(refreshToken);

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + this.config.REFRESH_TOKEN_EXPIRATION),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

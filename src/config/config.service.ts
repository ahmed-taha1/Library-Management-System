import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get PORT(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get CONNECTION_STRING(): string {
    return this.configService.get<string>('CONNECTION_STRING', 'postgresql://user:password@localhost:5432/library_db');
  }

  get JWT_SECRET(): string {
    return this.configService.get<string>('JWT_SECRET', 'defaultSecret');
  }

  get JWT_EXPIRATION(): string {
    return this.configService.get<string>('JWT_EXPIRATION', '15m');
  }

  get REFRESH_TOKEN_EXPIRATION(): number {
    const value = this.configService.get<string>('REFRESH_TOKEN_EXPIRATION');
    return value ? parseInt(value, 10) : 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  }
}

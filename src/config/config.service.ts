import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get PORT(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get CONNECTION_STRING(): string {
    return this.configService.get<string>('CONNECTION_STRING', 'mongodb://localhost:27017/myapp');
  }

  get JWT_SECRET(): string {
    return this.configService.get<string>('JWT_SECRET', 'defaultSecret');
  }

  get JWT_EXPIRATION(): number {
    return this.configService.get<number>('JWT_EXPIRATION', 3600);
  }
}

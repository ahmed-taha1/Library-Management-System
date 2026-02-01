import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfigModule } from './config';
import { PrismaModule } from './prisma';
import { AuthModule } from './features/auth';
import { BooksModule } from './features/books';
import { BorrowersModule } from './features/borrowers';
import { BorrowingsModule } from './features/borrowings';
import { AnalyticsModule } from './features/analytics';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 60 seconds default
      max: 100,   // max items in cache
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // default limit
      },
    ]),
    AuthModule,
    BooksModule,
    BorrowersModule,
    BorrowingsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}

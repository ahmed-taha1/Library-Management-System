import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, Inject } from '@nestjs/common';
import { CacheInterceptor, CacheTTL, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(
    private booksService: BooksService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 creates per minute
  async create(@Body() dto: CreateBookDto) {
    const result = await this.booksService.create(dto);
    await this.invalidateCache();
    return result;
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30000) // 30 seconds
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.booksService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('search')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 searches per minute
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30000) // 30 seconds
  search(
    @Query('q') q: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.booksService.search(
      q || '',
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30000) // 30 seconds
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    const result = await this.booksService.update(id, dto);
    await this.invalidateCache();
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.booksService.remove(id);
    await this.invalidateCache();
    return result;
  }

  private async invalidateCache() {
    try {
      if (this.cacheManager.reset) {
        await this.cacheManager.reset();
      } else if (this.cacheManager.store?.reset) {
        await this.cacheManager.store.reset();
      }
    } catch {
      console.warn('Failed to invalidate cache');
    }
  }
}

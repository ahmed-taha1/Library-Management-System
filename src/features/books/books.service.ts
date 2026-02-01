import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateBookDto, UpdateBookDto } from './dto';
import { BookNotFoundException, BookIsbnExistsException } from '../../common/exceptions';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    const existing = await this.prisma.book.findUnique({
      where: { isbn: dto.isbn },
    });

    if (existing) {
      throw new BookIsbnExistsException(dto.isbn);
    }

    return this.prisma.book.create({ data: dto });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });

    if (!book) {
      throw new BookNotFoundException(id);
    }

    return book;
  }

  async search(q: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { author: { contains: q, mode: 'insensitive' } },
            { isbn: { contains: q, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { author: { contains: q, mode: 'insensitive' } },
            { isbn: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, dto: UpdateBookDto) {
    await this.findOne(id);

    if (dto.isbn) {
      const existing = await this.prisma.book.findFirst({
        where: { isbn: dto.isbn, NOT: { id } },
      });

      if (existing) {
        throw new BookIsbnExistsException(dto.isbn);
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }
}

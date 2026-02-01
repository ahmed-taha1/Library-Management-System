import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateBorrowerDto, UpdateBorrowerDto } from './dto';
import {
  BorrowerNotFoundException,
  BorrowerEmailExistsException,
  BorrowerHasActiveBorrowingsException,
} from '../../common/exceptions';

@Injectable()
export class BorrowersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBorrowerDto) {
    const existing = await this.prisma.borrower.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BorrowerEmailExistsException(dto.email);
    }

    return this.prisma.borrower.create({ data: dto });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.borrower.findMany({
        skip,
        take: limit,
        orderBy: { registeredAt: 'desc' },
      }),
      this.prisma.borrower.count(),
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
    const borrower = await this.prisma.borrower.findUnique({
      where: { id },
      include: {
        borrowings: {
          where: { returnedAt: null },
          include: { book: true },
        },
      },
    });

    if (!borrower) {
      throw new BorrowerNotFoundException(id);
    }

    return borrower;
  }

  async update(id: string, dto: UpdateBorrowerDto) {
    await this.findOne(id);

    if (dto.email) {
      const existing = await this.prisma.borrower.findFirst({
        where: { email: dto.email, NOT: { id } },
      });

      if (existing) {
        throw new BorrowerEmailExistsException(dto.email);
      }
    }

    return this.prisma.borrower.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const borrower = await this.prisma.borrower.findUnique({
      where: { id },
      include: { borrowings: { where: { returnedAt: null } } },
    });

    if (!borrower) {
      throw new BorrowerNotFoundException(id);
    }

    if (borrower.borrowings.length > 0) {
      throw new BorrowerHasActiveBorrowingsException(id, borrower.borrowings.length);
    }

    return this.prisma.borrower.delete({ where: { id } });
  }
}

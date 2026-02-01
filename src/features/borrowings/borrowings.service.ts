import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CheckoutDto } from './dto';
import {
  BorrowerNotFoundException,
  BookNotFoundException,
  BookNotAvailableException,
  BorrowingNotFoundException,
  BookAlreadyReturnedException,
} from '../../common/exceptions';

@Injectable()
export class BorrowingsService {
  constructor(private prisma: PrismaService) {}

  async checkout(dto: CheckoutDto) {
    // Check if borrower exists
    const borrower = await this.prisma.borrower.findUnique({
      where: { id: dto.borrowerId },
    });

    if (!borrower) {
      throw new BorrowerNotFoundException(dto.borrowerId);
    }

    // Check if book exists and has available quantity
    const book = await this.prisma.book.findUnique({
      where: { id: dto.bookId },
    });

    if (!book) {
      throw new BookNotFoundException(dto.bookId);
    }

    // Count active borrowings for this book
    const activeBorrowings = await this.prisma.borrowing.count({
      where: { bookId: dto.bookId, returnedAt: null },
    });

    if (activeBorrowings >= book.quantity) {
      throw new BookNotAvailableException(dto.bookId, book.title);
    }

    // Create borrowing record
    return this.prisma.borrowing.create({
      data: {
        borrowerId: dto.borrowerId,
        bookId: dto.bookId,
        dueDate: new Date(dto.dueDate),
      },
      include: {
        borrower: true,
        book: true,
      },
    });
  }

  async return(id: string) {
    const borrowing = await this.prisma.borrowing.findUnique({
      where: { id },
    });

    if (!borrowing) {
      throw new BorrowingNotFoundException(id);
    }

    if (borrowing.returnedAt) {
      throw new BookAlreadyReturnedException(id);
    }

    return this.prisma.borrowing.update({
      where: { id },
      data: { returnedAt: new Date() },
      include: {
        borrower: true,
        book: true,
      },
    });
  }

  async findByBorrower(borrowerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.borrowing.findMany({
        where: { borrowerId },
        skip,
        take: limit,
        orderBy: { borrowedAt: 'desc' },
        include: { book: true },
      }),
      this.prisma.borrowing.count({ where: { borrowerId } }),
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

  async findActiveBorrowings(borrowerId: string) {
    return this.prisma.borrowing.findMany({
      where: { borrowerId, returnedAt: null },
      include: { book: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOverdue(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const [data, total] = await Promise.all([
      this.prisma.borrowing.findMany({
        where: {
          returnedAt: null,
          dueDate: { lt: now },
        },
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          borrower: true,
          book: true,
        },
      }),
      this.prisma.borrowing.count({
        where: {
          returnedAt: null,
          dueDate: { lt: now },
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

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.borrowing.findMany({
        skip,
        take: limit,
        orderBy: { borrowedAt: 'desc' },
        include: {
          borrower: true,
          book: true,
        },
      }),
      this.prisma.borrowing.count(),
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
}

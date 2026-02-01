import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

interface BorrowingExportData {
  id: string;
  borrowerName: string;
  borrowerEmail: string;
  bookTitle: string;
  bookIsbn: string;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getBorrowingsForPeriod(startDate: Date, endDate: Date): Promise<BorrowingExportData[]> {
    const borrowings = await this.prisma.borrowing.findMany({
      where: {
        borrowedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        borrower: true,
        book: true,
      },
      orderBy: { borrowedAt: 'desc' },
    });

    return borrowings.map((b) => ({
      id: b.id,
      borrowerName: b.borrower.name,
      borrowerEmail: b.borrower.email,
      bookTitle: b.book.title,
      bookIsbn: b.book.isbn,
      borrowedAt: b.borrowedAt,
      dueDate: b.dueDate,
      returnedAt: b.returnedAt,
      status: this.getBorrowingStatus(b.returnedAt, b.dueDate),
    }));
  }

  async getOverdueBorrowingsForPeriod(startDate: Date, endDate: Date): Promise<BorrowingExportData[]> {
    const now = new Date();

    const borrowings = await this.prisma.borrowing.findMany({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
          lt: now,
        },
        returnedAt: null,
      },
      include: {
        borrower: true,
        book: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return borrowings.map((b) => ({
      id: b.id,
      borrowerName: b.borrower.name,
      borrowerEmail: b.borrower.email,
      bookTitle: b.book.title,
      bookIsbn: b.book.isbn,
      borrowedAt: b.borrowedAt,
      dueDate: b.dueDate,
      returnedAt: b.returnedAt,
      status: 'Overdue',
    }));
  }

  async getAnalyticsSummary(startDate: Date, endDate: Date) {
    const now = new Date();

    const [totalBorrowings, activeBorrowings, overdueBorrowings, returnedBorrowings] = await Promise.all([
      this.prisma.borrowing.count({
        where: {
          borrowedAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.borrowing.count({
        where: {
          borrowedAt: { gte: startDate, lte: endDate },
          returnedAt: null,
          dueDate: { gte: now },
        },
      }),
      this.prisma.borrowing.count({
        where: {
          borrowedAt: { gte: startDate, lte: endDate },
          returnedAt: null,
          dueDate: { lt: now },
        },
      }),
      this.prisma.borrowing.count({
        where: {
          borrowedAt: { gte: startDate, lte: endDate },
          returnedAt: { not: null },
        },
      }),
    ]);

    return {
      period: { startDate, endDate },
      totalBorrowings,
      activeBorrowings,
      overdueBorrowings,
      returnedBorrowings,
    };
  }

  generateCsv(data: BorrowingExportData[]): string {
    const headers = [
      'ID',
      'Borrower Name',
      'Borrower Email',
      'Book Title',
      'Book ISBN',
      'Borrowed At',
      'Due Date',
      'Returned At',
      'Status',
    ];

    const rows = data.map((item) => [
      item.id,
      this.escapeCsvField(item.borrowerName),
      item.borrowerEmail,
      this.escapeCsvField(item.bookTitle),
      item.bookIsbn,
      this.formatDate(item.borrowedAt),
      this.formatDate(item.dueDate),
      item.returnedAt ? this.formatDate(item.returnedAt) : '',
      item.status,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  private getBorrowingStatus(returnedAt: Date | null, dueDate: Date): string {
    if (returnedAt) return 'Returned';
    if (new Date() > dueDate) return 'Overdue';
    return 'Active';
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BorrowingNotFoundException extends BaseException {
  constructor(identifier?: string) {
    super(
      identifier ? `Borrowing record with ID "${identifier}" not found` : 'Borrowing record not found',
      HttpStatus.NOT_FOUND,
      'BORROWING_NOT_FOUND',
      identifier ? { identifier } : undefined,
    );
  }
}

export class BookAlreadyReturnedException extends BaseException {
  constructor(borrowingId: string) {
    super(
      'This book has already been returned',
      HttpStatus.BAD_REQUEST,
      'BOOK_ALREADY_RETURNED',
      { borrowingId },
    );
  }
}

export class BorrowerAlreadyHasBookException extends BaseException {
  constructor(borrowerId: string, bookId: string) {
    super(
      'Borrower already has an active borrowing for this book',
      HttpStatus.BAD_REQUEST,
      'BORROWER_ALREADY_HAS_BOOK',
      { borrowerId, bookId },
    );
  }
}

export class MaxBorrowingsExceededException extends BaseException {
  constructor(borrowerId: string, maxAllowed: number) {
    super(
      `Borrower has reached the maximum number of borrowings (${maxAllowed})`,
      HttpStatus.BAD_REQUEST,
      'MAX_BORROWINGS_EXCEEDED',
      { borrowerId, maxAllowed },
    );
  }
}

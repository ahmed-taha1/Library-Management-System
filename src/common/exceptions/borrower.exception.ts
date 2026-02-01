import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BorrowerNotFoundException extends BaseException {
  constructor(identifier?: string) {
    super(
      identifier ? `Borrower with ID "${identifier}" not found` : 'Borrower not found',
      HttpStatus.NOT_FOUND,
      'BORROWER_NOT_FOUND',
      identifier ? { identifier } : undefined,
    );
  }
}

export class BorrowerEmailExistsException extends BaseException {
  constructor(email: string) {
    super(
      `Borrower with email "${email}" already exists`,
      HttpStatus.CONFLICT,
      'BORROWER_EMAIL_EXISTS',
      { email },
    );
  }
}

export class BorrowerHasActiveBorrowingsException extends BaseException {
  constructor(borrowerId: string, count: number) {
    super(
      `Cannot delete borrower with ${count} active borrowing(s). Please return all books first.`,
      HttpStatus.BAD_REQUEST,
      'BORROWER_HAS_ACTIVE_BORROWINGS',
      { borrowerId, activeBorrowingsCount: count },
    );
  }
}

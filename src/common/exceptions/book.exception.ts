import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BookNotFoundException extends BaseException {
  constructor(identifier?: string) {
    super(
      identifier ? `Book with ID "${identifier}" not found` : 'Book not found',
      HttpStatus.NOT_FOUND,
      'BOOK_NOT_FOUND',
      identifier ? { identifier } : undefined,
    );
  }
}

export class BookIsbnExistsException extends BaseException {
  constructor(isbn: string) {
    super(
      `Book with ISBN "${isbn}" already exists`,
      HttpStatus.CONFLICT,
      'BOOK_ISBN_EXISTS',
      { isbn },
    );
  }
}

export class BookNotAvailableException extends BaseException {
  constructor(bookId: string, title?: string) {
    super(
      title ? `No copies of "${title}" are currently available` : 'No copies of this book are currently available',
      HttpStatus.BAD_REQUEST,
      'BOOK_NOT_AVAILABLE',
      { bookId, title },
    );
  }
}

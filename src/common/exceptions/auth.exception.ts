import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class InvalidCredentialsException extends BaseException {
  constructor() {
    super(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
      'AUTH_INVALID_CREDENTIALS',
    );
  }
}

export class InvalidTokenException extends BaseException {
  constructor(message = 'Invalid or expired token') {
    super(message, HttpStatus.UNAUTHORIZED, 'AUTH_INVALID_TOKEN');
  }
}

export class TokenExpiredException extends BaseException {
  constructor() {
    super('Token has expired', HttpStatus.UNAUTHORIZED, 'AUTH_TOKEN_EXPIRED');
  }
}

export class TokenRevokedException extends BaseException {
  constructor() {
    super('Token has been revoked', HttpStatus.UNAUTHORIZED, 'AUTH_TOKEN_REVOKED');
  }
}

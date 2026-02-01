import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { CheckoutDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('borrowings')
@UseGuards(JwtAuthGuard)
export class BorrowingsController {
  constructor(private borrowingsService: BorrowingsService) {}

  @Post()
  checkout(@Body() dto: CheckoutDto) {
    return this.borrowingsService.checkout(dto);
  }

  @Patch(':id/return')
  return(@Param('id') id: string) {
    return this.borrowingsService.return(id);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.borrowingsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('overdue')
  findOverdue(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.borrowingsService.findOverdue(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('borrower/:borrowerId')
  findByBorrower(
    @Param('borrowerId') borrowerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.borrowingsService.findByBorrower(
      borrowerId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('borrower/:borrowerId/active')
  findActiveBorrowings(@Param('borrowerId') borrowerId: string) {
    return this.borrowingsService.findActiveBorrowings(borrowerId);
  }
}

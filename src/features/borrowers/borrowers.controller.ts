import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BorrowersService } from './borrowers.service';
import { CreateBorrowerDto, UpdateBorrowerDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('borrowers')
@UseGuards(JwtAuthGuard)
export class BorrowersController {
  constructor(private borrowersService: BorrowersService) {}

  @Post()
  create(@Body() dto: CreateBorrowerDto) {
    return this.borrowersService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.borrowersService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.borrowersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBorrowerDto) {
    return this.borrowersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.borrowersService.remove(id);
  }
}

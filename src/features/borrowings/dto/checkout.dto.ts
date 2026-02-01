import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  borrowerId: string;

  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsDateString()
  dueDate: string;
}

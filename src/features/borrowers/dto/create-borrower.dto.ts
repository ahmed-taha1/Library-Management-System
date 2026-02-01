import { IsString, IsNotEmpty, IsEmail, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBorrowerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s]+$/, { message: 'Phone number can only contain digits, +, -, and spaces' })
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  address: string;
}

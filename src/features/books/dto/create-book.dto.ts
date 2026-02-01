import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  author: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  @Matches(/^[0-9]{10,13}$/, { message: 'ISBN must be 10 or 13 digits' })
  @Transform(({ value }) => value?.trim().replace(/-/g, ''))
  isbn: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number = 1;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  shelf: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  section: string;
}

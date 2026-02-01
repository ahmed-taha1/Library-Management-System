import { IsOptional, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';

function getDefaultStartDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), 0, 0, 0);
}

function getDefaultEndDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
}

export class DateRangeDto {
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : getDefaultStartDate()))
  @IsDate({ message: 'startDate must be a valid date (YYYY-MM-DD)' })
  startDate: Date = getDefaultStartDate();

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : getDefaultEndDate()))
  @IsDate({ message: 'endDate must be a valid date (YYYY-MM-DD)' })
  endDate: Date = getDefaultEndDate();
}

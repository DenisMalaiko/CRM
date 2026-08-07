import { IsInt, IsString, Length, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCalendarificParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsString()
  @Length(2, 2)
  countryCode: string;
}

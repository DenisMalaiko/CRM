import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetCalendarificParamsDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  countryCode: string;
}

export class GetCalendarificQueryDto {
  @ApiPropertyOptional({ default: 'uk' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  language?: string = 'uk';
}

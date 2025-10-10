import { IsEmail, IsString, MinLength, IsBoolean } from 'class-validator';

export class AdminDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  isAdmin: boolean;

  @IsString()
  @MinLength(8)
  password: string;
}
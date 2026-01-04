import { IsEmail, IsString, MinLength, IsBoolean, IsEnum } from 'class-validator';

export class AdminSignUpDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
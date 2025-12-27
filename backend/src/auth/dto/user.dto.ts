import { IsEmail, IsString, MinLength, IsEnum, IsDefined } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { UserRoleUI } from '../../enums/UserRole';
import { UserStatusUI } from '../../enums/UserStatus';
import { AgencySignUpDto } from "../../agency/dto/agency.dto";

export class UserSignUpDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRoleUI)
  role: UserRoleUI = UserRoleUI.Marketer;

  @IsEnum(UserStatusUI)
  status: UserStatusUI = UserStatusUI.Active;
}

export class SignUpDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => UserSignUpDto)
  user: UserSignUpDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => AgencySignUpDto)
  agency: AgencySignUpDto;
}

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
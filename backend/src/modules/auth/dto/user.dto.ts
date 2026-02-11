import { IsEmail, IsString, MinLength, IsEnum, IsDefined } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { UserRoleUI } from '../../../shared/enums/UserRole';
import { UserStatusUI } from '../../../shared/enums/UserStatus';
import { AgencyBaseDto } from "../../agency/dto/agency.dto";

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
  @Type(() => AgencyBaseDto)
  agency: AgencyBaseDto;
}

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
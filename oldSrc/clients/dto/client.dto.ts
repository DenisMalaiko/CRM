import {IsOptional, IsString, IsUUID, IsEmail, IsBoolean, IsDate} from "class-validator";

export class ClientDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  agencyId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  countryCode: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  address: string;

  @IsString()
  role: string;

  @IsBoolean()
  isActive: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
import { IsString, IsArray, IsOptional, IsUUID } from "class-validator";

export class AudienceBaseDto {
  @IsUUID()
  @IsOptional()
  businessId: string;

  @IsString()
  name: string;

  @IsString()
  ageRange: string;

  @IsString()
  gender: string;

  @IsString()
  geo: string;

  @IsArray()
  pains: string[];

  @IsArray()
  desires: string[];

  @IsArray()
  triggers: string[];

  @IsArray()
  interests: string[];

  @IsOptional()
  @IsString()
  incomeLevel?: string;
}

export class CreateAudienceDto extends AudienceBaseDto {}

export class UpdateAudienceDto extends AudienceBaseDto {}

export class AudienceIdParamDto {
  @IsUUID()
  id: string;
}
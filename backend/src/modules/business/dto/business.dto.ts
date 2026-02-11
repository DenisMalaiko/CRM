import { IsString, IsUUID, IsEnum } from "class-validator";
import { BusinessStatusUI } from "../../../shared/enums/BusinessStatus";

export class BusinessBaseDto {
  @IsUUID()
  agencyId: string;

  @IsString()
  name: string;

  @IsString()
  website: string;

  @IsString()
  industry: string;

  @IsEnum(BusinessStatusUI)
  status: BusinessStatusUI;
}

export class CreateBusinessDto extends BusinessBaseDto {}

export class UpdateBusinessDto extends BusinessBaseDto {}

export class BusinessIdParamDto {
  @IsUUID()
  id: string;
}
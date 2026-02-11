import {IsEnum, IsString, IsUUID} from 'class-validator';
import { PlansUI } from "../../../shared/enums/Plans";

export class AgencyBaseDto {
  @IsString()
  name: string;

  @IsEnum(PlansUI)
  plan: PlansUI;
}

export class CreateAgencyDto extends AgencyBaseDto {}

export class UpdateAgencyDto extends AgencyBaseDto {}

export class AgencyIdParamDto {
  @IsUUID()
  id: string;
}


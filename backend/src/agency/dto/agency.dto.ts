import { IsEnum, IsString } from 'class-validator';
import { PlansUI } from "../../enums/Plans";

export class AgencySignUpDto {
  @IsString()
  name: string;

  @IsEnum(PlansUI)
  plan: PlansUI;
}


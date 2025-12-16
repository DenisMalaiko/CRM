import { UserDto } from "./user.dto";
import { AgencyDto } from "../../agency/dto/agency.dto";

export class SignUpDto {
  user: UserDto;
  agency: AgencyDto;
}
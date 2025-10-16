import { UserDto } from "./user.dto";
import { BusinessDto } from "../../business/dto/business.dto";

export class SignUpDto {
  user: UserDto;
  business: BusinessDto;
}
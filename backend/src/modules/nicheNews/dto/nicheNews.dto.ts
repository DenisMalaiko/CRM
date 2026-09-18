import { IsString, IsUUID } from 'class-validator';

export class BusinessIdParamDto {
  @IsUUID()
  @IsString()
  businessId: string;
}

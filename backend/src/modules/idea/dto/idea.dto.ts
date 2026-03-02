import {IsDateString, IsUUID, IsEnum} from 'class-validator';
import { IdeaStatus } from "@prisma/client";


export class IdeaIdParamDto {
  @IsUUID()
  id: string;
}

export class IdeaParamsDto {
  @IsDateString()
  onlyPostsNewerThan: string;
}

export class IdeaUpdateDto {
  @IsEnum(IdeaStatus)
  status: IdeaStatus;
}
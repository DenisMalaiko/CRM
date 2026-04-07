import {IsUUID, IsEnum} from "class-validator";
import {IdeaStatus} from "@prisma/client";

export class IdeaAIIdParamDto {
  @IsUUID()
  id: string;
}
export class IdeaAIUpdateDto {
  @IsEnum(IdeaStatus)
  status: IdeaStatus;
}
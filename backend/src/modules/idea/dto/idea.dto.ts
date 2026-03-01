import {IsDateString, IsUUID} from 'class-validator';


export class IdeaIdParamDto {
  @IsUUID()
  id: string;
}

export class IdeaParamsDto {
  @IsDateString()
  onlyPostsNewerThan: string;
}
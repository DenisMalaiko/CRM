import { IsDateString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { IdeaStatus, IdeaSourceType } from '@prisma/client';

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

export class IdeaFilterDto {
  @IsOptional()
  @IsEnum(IdeaSourceType)
  sourceType?: IdeaSourceType;
}

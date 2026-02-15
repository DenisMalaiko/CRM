import {IsBoolean, IsOptional, IsString, isString, IsUUID, IsDateString} from 'class-validator';

export class CompetitorBaseDto {
  @IsUUID()
  @IsOptional()
  businessId: string;

  @IsString()
  name: string;

  @IsString()
  facebookLink: string;

  @IsBoolean()
  isActive: boolean;
}

export class CreateCompetitorDto extends CompetitorBaseDto {}

export class UpdateCompetitorDto extends CompetitorBaseDto {}

export class CompetitorIdParamDto {
  @IsUUID()
  id: string;
}

export class CompetitorPostParamsDto {
  @IsDateString()
  onlyPostsNewerThan: string;
}

export class CompetitorAdsParamsDto {
  @IsString()
  activeStatus: string;

  @IsString()
  period: string;

  @IsString()
  sortBy: string;
}
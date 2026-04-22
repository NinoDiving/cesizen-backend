import {
  IsBoolean,
  IsOptional,
  IsString
} from 'class-validator';

export class UpdateActivitiesDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsBoolean()
  @IsOptional()
  isSuspend?: boolean;

  @IsString()
  @IsOptional()
  typeId?: string;
}

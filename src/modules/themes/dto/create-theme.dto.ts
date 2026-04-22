import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateThemeDto {
  @ApiProperty({ example: 'Stress' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  display_order?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiProperty({ example: 'uuid-ressource', required: false })
  @IsUUID()
  @IsOptional()
  ressourceId?: string;
}

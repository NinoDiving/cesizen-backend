import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRessourceDto {
  @ApiProperty({ example: 'Guide de méditation' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Un guide complet pour débuter la méditation.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Contenu détaillé de la ressource...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'https://example.com/guide.pdf' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'uuid-type-ressource' })
  @IsUUID()
  @IsNotEmpty()
  typeId: string;

  @ApiProperty({ example: 'uuid-illustration' })
  @IsUUID()
  @IsNotEmpty()
  illustrationId: string;
}

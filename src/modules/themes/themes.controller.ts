import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThemesService } from './themes.service';

@ApiTags('Themes')
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les thèmes visibles (sous-menus)' })
  @ApiResponse({ status: 200, description: 'Liste des thèmes récupérée avec succès' })
  findAll() {
    return this.themesService.findAllVisible();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un thème par son identifiant' })
  @ApiResponse({ status: 200, description: 'Thème récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Thème non trouvé' })
  findOne(@Param('id') id: string) {
    return this.themesService.findOne(id);
  }
}

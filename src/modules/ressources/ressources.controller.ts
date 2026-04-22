import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RessourcesService } from './ressources.service';

@ApiTags('Ressources')
@Controller('ressources')
export class RessourcesController {
  constructor(private readonly ressourcesService: RessourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les ressources' })
  @ApiResponse({ status: 200, description: 'Liste des ressources récupérée avec succès' })
  findAll() {
    return this.ressourcesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère une ressource par son identifiant' })
  @ApiResponse({ status: 200, description: 'Ressource récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Ressource non trouvée' })
  findOne(@Param('id') id: string) {
    return this.ressourcesService.findOne(id);
  }
}

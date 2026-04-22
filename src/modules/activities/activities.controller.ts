import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une activité par ID' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.getActivitiesById(id);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ajouter une activité aux favoris' })
  addFavorite(@Param('id') id: string, @Req() req: any) {
    return this.activitiesService.addFavorite(req.user.sub, id);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retirer une activité des favoris' })
  removeFavorite(@Param('id') id: string, @Req() req: any) {
    return this.activitiesService.removeFavorite(req.user.sub, id);
  }
}

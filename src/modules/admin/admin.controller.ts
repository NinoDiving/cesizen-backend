import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ActivitiesService } from '../activities/activities.service';
import { CreateActivitiesDto } from '../activities/dto/createActivities.dto';
import { UpdateActivitiesDto } from '../activities/dto/updateActivities.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateRessourceDto } from '../ressources/dto/create-ressource.dto';
import { UpdateRessourceDto } from '../ressources/dto/update-ressource.dto';
import { RessourcesService } from '../ressources/ressources.service';
import { CreateThemeDto } from '../themes/dto/create-theme.dto';
import { UpdateThemeDto } from '../themes/dto/update-theme.dto';
import { ThemesService } from '../themes/themes.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly activitiesService: ActivitiesService,
    private readonly themesService: ThemesService,
    private readonly ressourcesService: RessourcesService,
  ) {}

  @Post('create-admin')
  @ApiOperation({ summary: 'Créer un nouvel administrateur' })
  createAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createAdmin(createUserDto);
  }

  @Patch('suspend-user/:id')
  @ApiOperation({ summary: 'Suspendre un utilisateur' })
  suspendUser(@Param('id') id: string) {
    return this.usersService.suspend(id);
  }

  @Patch('activate-user/:id')
  @ApiOperation({ summary: 'Réactiver un utilisateur' })
  activateUser(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Delete('delete-user/:id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('create-activities')
  @ApiOperation({ summary: 'Créer une activité' })
  createActivities(@Body() createActivitiesDto: CreateActivitiesDto) {
    return this.activitiesService.create(createActivitiesDto);
  }

  @Patch('update-activities/:id')
  @ApiOperation({ summary: 'Mettre à jour une activité' })
  updateActivities(@Param('id') id: string, @Body() updateActivitiesDto: UpdateActivitiesDto) {
    return this.activitiesService.update(id, updateActivitiesDto);
  }

  @Patch('suspend-activities/:id')
  @ApiOperation({ summary: 'Suspendre une activité' })
  suspendActivities(@Param('id') id: string) {
    return this.activitiesService.suspend(id);
  }

  @Patch('activate-activities/:id')
  @ApiOperation({ summary: 'Réactiver une activité' })
  activateActivities(@Param('id') id: string) {
    return this.activitiesService.activate(id);
  }

  @Delete('delete-activities/:id')
  @ApiOperation({ summary: 'Supprimer une activité' })
  deleteActivities(@Param('id') id: string) {
    return this.activitiesService.delete(id);
  }

  @Post('create-ressource')
  @ApiOperation({ summary: 'Créer une ressource' })
  createRessource(@Body() createRessourceDto: CreateRessourceDto) {
    return this.ressourcesService.create(createRessourceDto);
  }

  @Patch('update-ressource/:id')
  @ApiOperation({ summary: 'Mettre à jour une ressource' })
  updateRessource(@Param('id') id: string, @Body() updateRessourceDto: UpdateRessourceDto) {
    return this.ressourcesService.update(id, updateRessourceDto);
  }

  @Delete('delete-ressource/:id')
  @ApiOperation({ summary: 'Supprimer une ressource' })
  removeRessource(@Param('id') id: string) {
    return this.ressourcesService.remove(id);
  }

  @Post('create-theme')
  @ApiOperation({ summary: 'Créer un thème' })
  createTheme(@Body() createThemeDto: CreateThemeDto) {
    return this.themesService.create(createThemeDto);
  }

  @Patch('update-theme/:id')
  @ApiOperation({ summary: 'Mettre à jour un thème' })
  updateTheme(@Param('id') id: string, @Body() updateThemeDto: UpdateThemeDto) {
    return this.themesService.update(id, updateThemeDto);
  }

  @Delete('delete-theme/:id')
  @ApiOperation({ summary: 'Supprimer un thème' })
  removeTheme(@Param('id') id: string) {
    return this.themesService.remove(id);
  }
}

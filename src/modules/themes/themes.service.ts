import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ThemeNotFoundException } from './exceptions/themes.exceptions';
import { RessourceNotFoundException } from '../ressources/exceptions/ressources.exceptions';

@Injectable()
export class ThemesService {
  constructor(private prisma: PrismaService) {}

  async findAllVisible() {
    return this.prisma.theme_Menu.findMany({
      where: { isVisible: true },
      orderBy: { display_order: 'asc' },
    });
  }

  async findOne(id: string) {
    const theme = await this.prisma.theme_Menu.findUnique({
      where: { id },
      include: { ressource: true },
    });

    if (!theme) {
      throw new ThemeNotFoundException(id);
    }

    return theme;
  }

  async findAll() {
    return this.prisma.theme_Menu.findMany({
      orderBy: { display_order: 'asc' },
    });
  }

  async create(dto: CreateThemeDto) {
    if (dto.ressourceId) {
      await this.checkRessource(dto.ressourceId);
    }
    return this.prisma.theme_Menu.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateThemeDto) {
    await this.findOne(id);
    if (dto.ressourceId) {
      await this.checkRessource(dto.ressourceId);
    }
    return this.prisma.theme_Menu.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.theme_Menu.delete({
      where: { id },
    });
  }

  private async checkRessource(ressourceId: string) {
    const ressource = await this.prisma.ressource.findUnique({ where: { id: ressourceId } });
    if (!ressource) throw new RessourceNotFoundException(ressourceId);
  }
}

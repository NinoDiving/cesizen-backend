import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRessourceDto } from './dto/create-ressource.dto';
import { UpdateRessourceDto } from './dto/update-ressource.dto';
import { RessourceNotFoundException, TypeRessourceNotFoundException, IllustrationNotFoundException } from './exceptions/ressources.exceptions';

@Injectable()
export class RessourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ressource.findMany({
      include: {
        type: true,
        illustration: true,
        themeMenus: true,
      },
    });
  }

  async findOne(id: string) {
    const ressource = await this.prisma.ressource.findUnique({
      where: { id },
      include: {
        type: true,
        illustration: true,
        themeMenus: true,
      },
    });

    if (!ressource) {
      throw new RessourceNotFoundException(id);
    }

    return ressource;
  }

  async create(dto: CreateRessourceDto) {
    await this.checkRelations(dto.typeId, dto.illustrationId);
    return this.prisma.ressource.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateRessourceDto) {
    await this.findOne(id);
    await this.checkRelations(dto.typeId, dto.illustrationId);
    return this.prisma.ressource.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ressource.delete({
      where: { id },
    });
  }

  private async checkRelations(typeId?: string, illustrationId?: string) {
    if (typeId) {
      const type = await this.prisma.type_Ressource.findUnique({ where: { id: typeId } });
      if (!type) throw new TypeRessourceNotFoundException(typeId);
    }
    if (illustrationId) {
      const illustration = await this.prisma.illustration.findUnique({ where: { id: illustrationId } });
      if (!illustration) throw new IllustrationNotFoundException(illustrationId);
    }
  }
}

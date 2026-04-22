import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateActivitiesDto } from './dto/createActivities.dto';
import { UpdateActivitiesDto } from './dto/updateActivities.dto';
import { ActivityNotFoundException, TypeActivityNotFoundException } from './exceptions/activities.exceptions';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getActivitiesById(id: string) {
    const activity = await this.prismaService.activity.findUnique({
      where: { id },
    });
    if (!activity) {
      throw new ActivityNotFoundException(id);
    }
    return activity;
  }

  async create(createActivitiesDto: CreateActivitiesDto) {
    await this.checkTypeActivity(createActivitiesDto.typeId);
    return await this.prismaService.activity.create({
      data: { ...createActivitiesDto },
    });
  }

  async update(id: string, updateActivityDto: UpdateActivitiesDto) {
    await this.getActivitiesById(id);
    if (updateActivityDto.typeId) {
      await this.checkTypeActivity(updateActivityDto.typeId);
    }
    return await this.prismaService.activity.update({
      where: { id },
      data: { ...updateActivityDto },
    });
  }

  async delete(id: string) {
    await this.getActivitiesById(id);
    return await this.prismaService.activity.delete({
      where: { id },
    });
  }

  async suspend(id: string) {
    await this.getActivitiesById(id);
    return await this.prismaService.activity.update({
      where: { id },
      data: { isSuspend: true },
    });
  }

  async activate(id: string) {
    await this.getActivitiesById(id);
    return await this.prismaService.activity.update({
      where: { id },
      data: { isSuspend: false },
    });
  }

  async addFavorite(userId: string, activityId: string) {
    await this.getActivitiesById(activityId);
    
    return await this.prismaService.user_Activity.create({
      data: {
        userId,
        activityId,
      },
    });
  }

  async removeFavorite(userId: string, activityId: string) {
    await this.getActivitiesById(activityId);

    return await this.prismaService.user_Activity.delete({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
    });
  }

  private async checkTypeActivity(typeId: string) {
    const type = await this.prismaService.type_Activity.findUnique({
      where: { id: typeId },
    });
    if (!type) {
      throw new TypeActivityNotFoundException(typeId);
    }
  }
}

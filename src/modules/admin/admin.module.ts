import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ThemesModule } from '../themes/themes.module';
import { RessourcesModule } from '../ressources/ressources.module';

@Module({
  imports: [UsersModule, ActivitiesModule, ThemesModule, RessourcesModule],
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}

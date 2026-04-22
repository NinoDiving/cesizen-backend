import { Module } from '@nestjs/common';
import { RessourcesService } from './ressources.service';
import { RessourcesController } from './ressources.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RessourcesController],
  providers: [RessourcesService],
  exports: [RessourcesService],
})
export class RessourcesModule {}

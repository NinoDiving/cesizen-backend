import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivitiesModule } from './modules/activities/activities.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ThemesModule } from './modules/themes/themes.module';
import { RessourcesModule } from './modules/ressources/ressources.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallbackSecret',
        signOptions: { expiresIn: '1d' },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ActivitiesModule,
    AdminModule,
    ThemesModule,
    RessourcesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

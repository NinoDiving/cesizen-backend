import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role } from '@prisma/client';
import request from 'supertest';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { ActivitiesService } from '../../activities/activities.service';
import { RessourcesService } from '../../ressources/ressources.service';
import { ThemesService } from '../../themes/themes.service';
import { UsersService } from '../../users/users.service';
import { AdminController } from '../admin.controller';

describe('AdminController', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let activitiesService: ActivitiesService;
  let dbHelper: TestDbHelper;
  let prisma: PrismaClient;
  let jwtService: JwtService;

  beforeAll(async () => {
    dbHelper = new TestDbHelper('admin_controller_http');
    await dbHelper.setupTestDb();

    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        UsersService,
        ActivitiesService,
        ThemesService,
        RessourcesService,
        dbHelper.getPrismaProvider(),
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    app = testingModule.createNestApplication();
    await app.init();

    usersService = testingModule.get<UsersService>(UsersService);
    activitiesService = testingModule.get<ActivitiesService>(ActivitiesService);
    jwtService = testingModule.get<JwtService>(JwtService);
    prisma = testingModule.get<PrismaService>(PrismaService) as unknown as PrismaClient;
  });

  afterAll(async () => {
    await app.close();
    await dbHelper.cleanupPrismaConnection(prisma);
    await dbHelper.cleanupTestDb();
  });

  describe('Admin Delegation (HTTP)', () => {
    beforeEach(() => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ 
        sub: 'admin-id',
        role: Role.ADMIN 
      });
    });

    it('POST /admin/create-admin (Should delegate to UsersService)', async () => {
      const spy = jest.spyOn(usersService, 'createAdmin').mockResolvedValue({} as any);
      const dto = { email: 'new-admin@test.com' };

      await request(app.getHttpServer())
        .post('/admin/create-admin')
        .set('Authorization', 'Bearer admin-token')
        .send(dto)
        .expect(201);

      expect(spy).toHaveBeenCalled();
    });

    it('PATCH /admin/suspend-user/:id (Should delegate to UsersService)', async () => {
      const spy = jest.spyOn(usersService, 'suspend').mockResolvedValue({} as any);

      await request(app.getHttpServer())
        .patch('/admin/suspend-user/user-123')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(spy).toHaveBeenCalledWith('user-123');
    });

    it('POST /admin/create-activities (Should delegate to ActivitiesService)', async () => {
      const spy = jest.spyOn(activitiesService, 'create').mockResolvedValue({} as any);
      const dto = { title: 'New Activity' };

      await request(app.getHttpServer())
        .post('/admin/create-activities')
        .set('Authorization', 'Bearer admin-token')
        .send(dto)
        .expect(201);

      expect(spy).toHaveBeenCalled();
    });

    it('Should return 403 if user is not ADMIN', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ 
        sub: 'member-id',
        role: Role.MEMBER 
      });

      await request(app.getHttpServer())
        .post('/admin/create-activities')
        .set('Authorization', 'Bearer member-token')
        .expect(403);
    });
  });
});

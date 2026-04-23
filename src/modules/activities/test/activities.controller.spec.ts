import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { ActivitiesController } from '../activities.controller';
import { ActivitiesService } from '../activities.service';
import { UsersService } from '../../users/users.service';

describe('ActivitiesController (Integration HTTP)', () => {
  let app: INestApplication;
  let service: ActivitiesService;
  let dbHelper: TestDbHelper;
  let prisma: PrismaClient;
  let jwtService: JwtService;

  beforeAll(async () => {
    dbHelper = new TestDbHelper('activities_controller_http');
    await dbHelper.setupTestDb();

    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        ActivitiesService,
        dbHelper.getPrismaProvider(),
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ isSuspend: false }),
          },
        },
      ],
    }).compile();

    app = testingModule.createNestApplication();
    await app.init();

    service = testingModule.get<ActivitiesService>(ActivitiesService);
    jwtService = testingModule.get<JwtService>(JwtService);
    prisma = testingModule.get<PrismaService>(PrismaService) as unknown as PrismaClient;
  });

  afterAll(async () => {
    await app.close();
    await dbHelper.cleanupPrismaConnection(prisma);
    await dbHelper.cleanupTestDb();
  });

  it('GET /activities/:id (Should return activity)', async () => {
    const type = await prisma.type_Activity.create({ data: { name: 'Test' } });
    const activity = await prisma.activity.create({
      data: {
        title: 'Test Route',
        description: 'Desc',
        content: 'Content',
        url: 'http://test.com',
        typeId: type.id,
      },
    });

    return request(app.getHttpServer())
      .get(`/activities/${activity.id}`)
      .expect(200)
      .then((res) => {
        expect(res.body.id).toBe(activity.id);
      });
  });

  describe('Favorites (HTTP)', () => {
    beforeEach(() => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: 'user-id' });
    });

    it('POST /activities/:id/favorite (Should add favorite)', async () => {
      const spy = jest.spyOn(service, 'addFavorite').mockResolvedValue({} as any);
      
      await request(app.getHttpServer())
        .post('/activities/act-id/favorite')
        .set('Authorization', 'Bearer dummy-token')
        .expect(201);
      
      expect(spy).toHaveBeenCalledWith('user-id', 'act-id');
    });

    it('DELETE /activities/:id/favorite (Should remove favorite)', async () => {
      const spy = jest.spyOn(service, 'removeFavorite').mockResolvedValue({} as any);
      
      await request(app.getHttpServer())
        .delete('/activities/act-id/favorite')
        .set('Authorization', 'Bearer dummy-token')
        .expect(200);
      
      expect(spy).toHaveBeenCalledWith('user-id', 'act-id');
    });

    it('POST /activities/:id/favorite (Should return 401 without token)', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

      await request(app.getHttpServer())
        .post('/activities/act-id/favorite')
        .expect(401);
    });
  });
});

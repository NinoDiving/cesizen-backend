import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { ThemesController } from '../themes.controller';
import { ThemesService } from '../themes.service';

describe('ThemesController (Integration HTTP)', () => {
  let app: INestApplication;
  let dbHelper: TestDbHelper;
  let prisma: PrismaClient;

  beforeAll(async () => {
    dbHelper = new TestDbHelper('themes_controller_http');
    await dbHelper.setupTestDb();

    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [ThemesController],
      providers: [
        ThemesService,
        dbHelper.getPrismaProvider(),
      ],
    }).compile();

    app = testingModule.createNestApplication();
    await app.init();

    prisma = testingModule.get<PrismaService>(PrismaService) as unknown as PrismaClient;
  });

  afterAll(async () => {
    await app.close();
    await dbHelper.cleanupPrismaConnection(prisma);
    await dbHelper.cleanupTestDb();
  });

  it('GET /themes (Should return visible themes)', async () => {
    await prisma.theme_Menu.create({
      data: { name: 'Visible', isVisible: true, display_order: 1 },
    });
    await prisma.theme_Menu.create({
      data: { name: 'Hidden', isVisible: false, display_order: 2 },
    });

    return request(app.getHttpServer())
      .get('/themes')
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Visible');
      });
  });
});

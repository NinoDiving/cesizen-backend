import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { RessourcesController } from '../ressources.controller';
import { RessourcesService } from '../ressources.service';

describe('RessourcesController', () => {
  let app: INestApplication;
  let dbHelper: TestDbHelper;
  let prisma: PrismaClient;

  beforeAll(async () => {
    dbHelper = new TestDbHelper('ressources_controller_http');
    await dbHelper.setupTestDb();

    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [RessourcesController],
      providers: [
        RessourcesService,
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

  it('GET /ressources (Should return all ressources)', async () => {
    const type = await prisma.type_Ressource.create({ data: { name: 'Article' } });
    const illustration = await prisma.illustration.create({ data: { url: 'img' } });
    
    await prisma.ressource.create({
      data: {
        title: 'HTTP Test',
        description: 'D',
        content: 'C',
        url: 'U',
        typeId: type.id,
        illustrationId: illustration.id,
      },
    });

    return request(app.getHttpServer())
      .get('/ressources')
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].title).toBe('HTTP Test');
      });
  });
});

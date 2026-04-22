import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role } from '@prisma/client';
import request from 'supertest';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController (Integration HTTP)', () => {
  let app: INestApplication;
  let dbHelper: TestDbHelper;
  let prisma: PrismaClient;

  beforeAll(async () => {
    dbHelper = new TestDbHelper('users_controller_http');
    await dbHelper.setupTestDb();

    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
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

    prisma = testingModule.get<PrismaService>(PrismaService) as unknown as PrismaClient;
  });

  afterAll(async () => {
    await app.close();
    await dbHelper.cleanupPrismaConnection(prisma);
    await dbHelper.cleanupTestDb();
  });

  it('GET /users (Should return all users)', async () => {
    await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: 'hash',
        first_name: 'Test',
        last_name: 'User',
        role: Role.MEMBER,
      },
    });

    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .then((res) => {
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].email).toBe('test@test.com');
      });
  });
});

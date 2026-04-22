import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { PrismaClient } from '@prisma/client';
import { JwtModule } from '@nestjs/jwt';

describe('AuthController (Local Authentication)', () => {
  let controller: AuthController;
  let dbHelper: TestDbHelper;
  let prisma: PrismaClient;

  beforeAll(async () => {
    dbHelper = new TestDbHelper('auth_ctrl_local');
    await dbHelper.setupTestDb();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        dbHelper.getPrismaProvider(),
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    prisma = module.get<PrismaService>(PrismaService) as unknown as PrismaClient;
  });

  afterAll(async () => {
    await dbHelper.cleanupPrismaConnection(prisma);
    await dbHelper.cleanupTestDb();
  });

  it('should register via controller', async () => {
    const dto = {
      email: 'ctrl-local@example.com',
      password: 'Password123!',
      first_name: 'Jane',
      last_name: 'Doe',
    };
    const result = await controller.register(dto);
    expect(result.userId).toBeDefined();
    expect(result.accessToken).toBeDefined();
  });
});

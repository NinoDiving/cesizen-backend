import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { UsersService } from '../users.service';

describe('UsersService (Integration)', () => {
  let service: UsersService;
  let dbHelper: TestDbHelper;
  let prisma: PrismaClient;

  beforeAll(async () => {
    dbHelper = new TestDbHelper('users_service');
    await dbHelper.setupTestDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        dbHelper.getPrismaProvider(),
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService) as unknown as PrismaClient;
  });

  afterAll(async () => {
    await dbHelper.cleanupPrismaConnection(prisma);
    await dbHelper.cleanupTestDb();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('User Operations', () => {
    beforeEach(async () => {
      await prisma.user_Activity.deleteMany();
      await prisma.user.deleteMany();
    });

    it('should create a regular user', async () => {
      const dto = {
        email: 'user@test.com',
        password: 'password',
        first_name: 'User',
        last_name: 'Regular',
      };
      const user = await service.create(dto);
      expect(user.email).toBe(dto.email);
      expect(user.role).toBe(Role.MEMBER);
    });

    it('should create an admin user', async () => {
      const dto = {
        email: 'admin@test.com',
        password: 'password',
        first_name: 'Admin',
        last_name: 'User',
      };
      const user = await service.createAdmin(dto);
      expect(user.email).toBe(dto.email);
      expect(user.role).toBe(Role.ADMIN);
    });

    it('should suspend and activate a user', async () => {
      const created = await prisma.user.create({
        data: {
          email: 'status@test.com',
          password: 'hash',
          first_name: 'Status',
          last_name: 'User',
        },
      });

      await service.suspend(created.id);
      let user = await prisma.user.findUnique({ where: { id: created.id } });
      expect(user?.isSuspend).toBe(true);

      await service.activate(created.id);
      user = await prisma.user.findUnique({ where: { id: created.id } });
      expect(user?.isSuspend).toBe(false);
    });
  });
});

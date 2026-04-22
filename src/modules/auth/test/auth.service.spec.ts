import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';

describe('AuthService (Local Authentication)', () => {
  let authService: AuthService;
  let prisma: PrismaClient;
  let dbHelper: TestDbHelper;
  const testEmail = 'local-test@example.com';
  const testPassword = 'Password123!';

  beforeAll(async () => {
    dbHelper = new TestDbHelper('auth_service_local');
    await dbHelper.setupTestDb();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        UsersService,
        dbHelper.getPrismaProvider(),
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService) as unknown as PrismaClient;
  });

  afterAll(async () => {
    await dbHelper.cleanupPrismaConnection(prisma);
    await dbHelper.cleanupTestDb();
  });

  describe('register', () => {
    it('should hash password and return a JWT', async () => {
      const result = await authService.register({
        email: testEmail,
        password: testPassword,
        first_name: 'Local',
        last_name: 'User',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.userId).toBeDefined();
      
      const user = await prisma.user.findUnique({ where: { email: testEmail } });
      expect(user).toBeDefined();
      expect(user?.password).not.toBe(testPassword);
    });
  });

  describe('authenticate', () => {
    it('should login with correct credentials', async () => {
      const result = await authService.authenticate(testEmail, testPassword);
      expect(result.accessToken).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      await expect(authService.authenticate(testEmail, 'wrong')).rejects.toThrow();
    });
  });
});

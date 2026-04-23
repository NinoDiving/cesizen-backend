import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from '../../users/users.service';
import { UserSuspendedException } from '../exceptions/auth.exceptions';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: {
        authorization: authHeader,
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when token is valid and user not suspended', async () => {
    const payload = { sub: 'user-id', email: 'test@test.com', role: 'ADMIN' };
    mockJwtService.verifyAsync.mockResolvedValue(payload);
    mockUsersService.findOne.mockResolvedValue({ id: 'user-id', isSuspend: false });
    
    const context = createMockContext('Bearer valid-token');
    const result = await guard.canActivate(context);
    
    expect(result).toBe(true);
    expect(context.switchToHttp().getRequest()['user']).toEqual(payload);
  });

  it('should throw UserSuspendedException when user is suspended', async () => {
    const payload = { sub: 'user-id', email: 'test@test.com', role: 'ADMIN' };
    mockJwtService.verifyAsync.mockResolvedValue(payload);
    mockUsersService.findOne.mockResolvedValue({ id: 'user-id', isSuspend: true });
    
    const context = createMockContext('Bearer valid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(UserSuspendedException);
  });

  it('should throw UnauthorizedException when token is missing', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token format is invalid', async () => {
    const context = createMockContext('invalid-format');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token verification fails', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
    
    const context = createMockContext('Bearer invalid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});

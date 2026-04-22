import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { RolesGuard } from '../guards/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (user?: any): ExecutionContext => {
    const request = {
      user,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    
    const context = createMockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if user has the required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    
    const context = createMockContext({ role: Role.ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if user has one of the required roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.MEMBER]);
    
    const context = createMockContext({ role: Role.MEMBER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user does not have the required role', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    
    const context = createMockContext({ role: Role.MEMBER });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is missing', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    
    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user role is missing', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    
    const context = createMockContext({ id: 'some-id' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

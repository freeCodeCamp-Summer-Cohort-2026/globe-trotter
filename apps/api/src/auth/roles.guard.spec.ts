import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ROLES_KEY } from './roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const createContext = (user: unknown, roles?: unknown[]) => {
    const handler = () => undefined;
    const controller = class {};

    if (roles) {
      Reflect.defineMetadata(ROLES_KEY, roles, handler);
    }

    return {
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = moduleRef.get(RolesGuard);
  });

  it('allows the request when no @Roles metadata is present', () => {
    expect(guard.canActivate(createContext({ role: 'learner' }))).toBe(true);
  });

  it('throws 401 when the request is not authenticated', () => {
    expect(() => guard.canActivate(createContext(null, ['learner']))).toThrow(
      UnauthorizedException,
    );
  });

  it('allows a learner to reach a learner route', () => {
    expect(guard.canActivate(createContext({ role: 'learner' }, ['learner']))).toBe(true);
  });

  it('allows an author to reach a learner route', () => {
    expect(guard.canActivate(createContext({ role: 'author' }, ['learner', 'author']))).toBe(
      true,
    );
  });

  it('forbids a learner from reaching an author only route', () => {
    expect(() => guard.canActivate(createContext({ role: 'learner' }, ['author']))).toThrow(
      ForbiddenException,
    );
  });

  it('forbids a request whose role is missing', () => {
    expect(() => guard.canActivate(createContext({ id: '1' }, ['learner']))).toThrow(
      ForbiddenException,
    );
  });

  it('forbids a request whose role is unknown', () => {
    expect(() => guard.canActivate(createContext({ role: 'admin' }, ['admin' as never]))).toThrow(
      ForbiddenException,
    );
  });
});

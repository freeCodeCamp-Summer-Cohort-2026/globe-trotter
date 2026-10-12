// Mock the ESM-only package so Jest can load the controller in CJS mode.
// reflect-metadata must be loaded here (inside the hoisted mock factory) so that
// Reflect.defineMetadata is available before @nestjs/common decorators execute.
jest.mock('@thallesp/nestjs-better-auth', () => {
  require('reflect-metadata');
  const { SetMetadata } = require('@nestjs/common');
  return {
    Roles: (roles: string[]) => SetMetadata('ROLES', roles),
    Session: () => (_target: unknown, _key: string, descriptor: PropertyDescriptor) => descriptor,
    UserSession: class {},
    AllowAnonymous: () => SetMetadata('PUBLIC', true),
  };
});


import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('role metadata', () => {
    it('marks the learner dashboard for learners and authors', () => {
      const roles = Reflect.getMetadata(
        'ROLES',
        AppController.prototype.getStudentDashboardData,
      );
      expect(roles).toEqual(['learner', 'author']);
    });

    it('marks the author dashboard for authors only', () => {
      const roles = Reflect.getMetadata('ROLES', AppController.prototype.getAuthorDashboardData);
      expect(roles).toEqual(['author']);
    });
  });

  describe('getProfile', () => {
    it('returns only the userId, email and role', () => {
      const profile = appController.getProfile({
        session: { id: 's1', userId: 'u1', token: 'super-secret-token' },
        user: { id: 'u1', email: 'learner@example.com', role: 'learner', name: 'Learner' },
      } as never);

      expect(profile).toEqual({
        userId: 'u1',
        email: 'learner@example.com',
        role: 'learner',
      });
    });

    it('throws when the role is missing from the session', () => {
      expect(() =>
        appController.getProfile({
          session: { id: 's1', userId: 'u1' },
          user: { id: 'u1', email: 'learner@example.com' },
        } as never),
      ).toThrow(ForbiddenException);
    });

    it('throws when the role is not a known role', () => {
      expect(() =>
        appController.getProfile({
          session: { id: 's1', userId: 'u1' },
          user: { id: 'u1', email: 'ghost@example.com', role: 'admin' },
        } as never),
      ).toThrow(ForbiddenException);
    });
  });
});

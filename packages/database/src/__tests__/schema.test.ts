import {
  user,
  modules,
  tutorials,
  labs,
  userProgress,
} from '../schema';

describe('Database schemas', () => {
  it('should export all expected schemas', () => {
    expect(user).toBeDefined();
    expect(modules).toBeDefined();
    expect(tutorials).toBeDefined();
    expect(labs).toBeDefined();
    expect(userProgress).toBeDefined();
  });

  it('users should have expected fields', () => {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('emailVerified');
    expect(user).toHaveProperty('image');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('updatedAt');
  });

  it('modules should have expected fields', () => {
    expect(modules).toHaveProperty('id');
    expect(modules).toHaveProperty('authorId');
    expect(modules).toHaveProperty('title');
    expect(modules).toHaveProperty('description');
    expect(modules).toHaveProperty('orderIndex');
    expect(modules).toHaveProperty('thumbnailUrl');
    expect(modules).toHaveProperty('isPublished');
    expect(modules).toHaveProperty('createdAt');
    expect(modules).toHaveProperty('updatedAt');
  });

  it('tutorials should have expected fields', () => {
    expect(tutorials).toHaveProperty('id');
    expect(tutorials).toHaveProperty('moduleId');
    expect(tutorials).toHaveProperty('title');
    expect(tutorials).toHaveProperty('description');
    expect(tutorials).toHaveProperty('content');
    expect(tutorials).toHaveProperty('orderIndex');
    expect(tutorials).toHaveProperty('createdAt');
    expect(tutorials).toHaveProperty('updatedAt');
  });

  it('labs should have expected fields', () => {
    expect(labs).toHaveProperty('id');
    expect(labs).toHaveProperty('moduleId');
    expect(labs).toHaveProperty('title');
    expect(labs).toHaveProperty('description');
    expect(labs).toHaveProperty('content');
    expect(labs).toHaveProperty('orderIndex');
    expect(labs).toHaveProperty('createdAt');
    expect(labs).toHaveProperty('updatedAt');
  });

  it('userProgress should have expected fields', () => {
    expect(userProgress).toHaveProperty('id');
    expect(userProgress).toHaveProperty('userId');
    expect(userProgress).toHaveProperty('moduleId');
    expect(userProgress).toHaveProperty('tutorialId');
    expect(userProgress).toHaveProperty('labId');
    expect(userProgress).toHaveProperty('status');
    expect(userProgress).toHaveProperty('createdAt');
    expect(userProgress).toHaveProperty('updatedAt');
  });
});
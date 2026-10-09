import { ForbiddenException } from '@nestjs/common';
import { UserRole, isUserRole } from '../auth/user-role';

export interface SessionDto {
  userId: string;
  email: string;
  role: UserRole;
}

interface SessionLike {
  session: { userId: string };
  user: { email: string; role?: unknown };
}

export function toSessionDto(session: SessionLike): SessionDto {
  const { session: sessionRecord, user } = session;

  if (!isUserRole(user?.role)) {
    throw new ForbiddenException('User role is missing or invalid');
  }

  return {
    userId: sessionRecord.userId,
    email: user.email,
    role: user.role,
  };
}

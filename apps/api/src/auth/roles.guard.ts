import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole, isUserRole } from './user-role';

// @AllowAnonymous() decorator writes metadata with this key
export const IS_PUBLIC_KEY = 'PUBLIC';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: unknown;
}

interface RequestWithUser {
  user?: AuthenticatedUser | null;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1) If @AllowAnonymous() skip all controls
    const isAnonymous = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isAnonymous) {
      return true;
    }

    // 2) Auth is required in default
    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user) {
      throw new UnauthorizedException('User is not authorized');
    }

    // 3) If there is no @Roles -> any authenticated user is suffecient
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 4) Role Control
    if (!isUserRole(user.role)) {
      throw new ForbiddenException('User role is missing or invalid');
    }

    // Insufficient role
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserPayload } from '@features/auth/strategies/jwt.strategy';

/**
 * Roles Guard
 * Checks if user has required roles to access a route
 * Use with @Roles() decorator
 *
 * NOTE: Para usar roles, você precisa:
 * 1. Adicionar campo 'role' ao User model no Prisma
 * 2. Incluir role no JWT payload
 * 3. Usar @Roles('admin') nos endpoints
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user: UserPayload = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // TODO: Implementar verificação de roles
    // Será necessário adicionar role ao User model e incluir no JWT
    throw new ForbiddenException('Roles ainda não implementadas - TODO');
  }
}

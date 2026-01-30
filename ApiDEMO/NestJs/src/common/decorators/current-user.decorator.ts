import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to get the current authenticated user from request
 * Usage: @CurrentUser() user: KeycloakUser
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

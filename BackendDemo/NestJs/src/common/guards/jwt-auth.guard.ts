import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Valida tokens JWT usando Passport
 *
 * Como funciona:
 * 1. Extrai o token JWT do header Authorization (Bearer token)
 * 2. Valida a assinatura usando JWT_SECRET do .env
 * 3. Verifica se o token não expirou
 * 4. Anexa os dados do usuário ao request.user
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido ou expirado');
    }
    return user;
  }
}

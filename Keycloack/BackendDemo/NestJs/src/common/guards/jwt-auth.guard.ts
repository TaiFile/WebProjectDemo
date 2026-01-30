import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeycloakService } from '@infrastructure/keycloak';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

/**
 * JWT Authentication Guard
 * Valida tokens JWT emitidos pelo Keycloak
 *
 * Como funciona:
 * 1. Extrai o token JWT do header Authorization
 * 2. Busca a chave pública do Keycloak (JWKS)
 * 3. Valida a assinatura do token usando a chave pública
 * 4. Verifica se o token não expirou
 * 5. Extrai e anexa os dados do usuário ao request
 *
 * Usa validação criptográfica real com as chaves públicas do Keycloak
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private jwksClientInstance: jwksClient.JwksClient;

  constructor(
    private keycloakService: KeycloakService,
    private configService: ConfigService,
  ) {
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
    const realm = this.configService.get<string>('KEYCLOAK_REALM');

    if (keycloakUrl && realm) {
      this.jwksClientInstance = jwksClient({
        jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
        cache: true,
        cacheMaxAge: 3600000, // 1 hora
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      // Validar o token JWT
      const decoded = await this.validateToken(token);

      // Extrair informações do usuário
      const keycloakUser = this.keycloakService.extractUserFromToken(decoded);

      // Anexar usuário ao request
      request.user = keycloakUser;

      return true;
    } catch (error) {
      this.logger.error('Falha na validação do token', error.message);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async validateToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Decodificar o header do token para pegar o kid (key ID)
      const decoded = jwt.decode(token, { complete: true });

      if (!decoded || !decoded.header || !decoded.header.kid) {
        return reject(new Error('Token inválido - sem kid no header'));
      }

      // Buscar a chave pública correspondente
      this.jwksClientInstance.getSigningKey(decoded.header.kid, (err, key) => {
        if (err) {
          return reject(new Error('Falha ao buscar chave pública do Keycloak'));
        }

        const signingKey = key.getPublicKey();

        // Validar o token com a chave pública
        jwt.verify(
          token,
          signingKey,
          {
            algorithms: ['RS256'],
            issuer: `${this.configService.get('KEYCLOAK_URL')}/realms/${this.configService.get('KEYCLOAK_REALM')}`,
          },
          (verifyErr, decodedToken) => {
            if (verifyErr) {
              return reject(verifyErr);
            }
            resolve(decodedToken);
          },
        );
      });
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface KeycloakUser {
  sub: string; // Keycloak ID
  email: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  roles?: string[];
}

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Extract user information from Keycloak token payload
   */
  extractUserFromToken(payload: any): KeycloakUser {
    return {
      sub: payload.sub,
      email: payload.email || payload.preferred_username,
      name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
      preferred_username: payload.preferred_username,
      given_name: payload.given_name,
      family_name: payload.family_name,
      email_verified: payload.email_verified,
      roles: this.extractRoles(payload),
    };
  }

  /**
   * Extract roles from token (both realm and client roles)
   */
  private extractRoles(payload: any): string[] {
    const roles: string[] = [];

    // Realm roles
    if (payload.realm_access?.roles) {
      roles.push(...payload.realm_access.roles);
    }

    // Client roles
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
    if (clientId && payload.resource_access?.[clientId]?.roles) {
      roles.push(...payload.resource_access[clientId].roles);
    }

    return roles;
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: KeycloakUser, role: string): boolean {
    return user.roles?.includes(role) ?? false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(user: KeycloakUser, roles: string[]): boolean {
    return roles.some((role) => this.hasRole(user, role));
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(user: KeycloakUser, roles: string[]): boolean {
    return roles.every((role) => this.hasRole(user, role));
  }
}

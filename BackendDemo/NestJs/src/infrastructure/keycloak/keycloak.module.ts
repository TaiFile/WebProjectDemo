import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeycloakConnectModule, PolicyEnforcementMode } from 'nest-keycloak-connect';
import { KeycloakService } from './keycloak.service';

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        authServerUrl: configService.get<string>('KEYCLOAK_URL'),
        realm: configService.get<string>('KEYCLOAK_REALM'),
        clientId: configService.get<string>('KEYCLOAK_CLIENT_ID'),
        secret: configService.get<string>('KEYCLOAK_CLIENT_SECRET', ''),
        // Configurações para desenvolvimento
        realmPublicKey: '', // Será buscado automaticamente
        policyEnforcement: PolicyEnforcementMode.PERMISSIVE, // Usar enum correto
        bearerOnly: true, // API apenas recebe tokens, não redireciona
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    KeycloakService,
    // Exportar guards para uso global se necessário
  ],
  exports: [KeycloakService, KeycloakConnectModule],
})
export class KeycloakModule {}

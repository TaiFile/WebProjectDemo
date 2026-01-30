import { Controller, Get, Patch, Body, UseGuards, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserSchema } from './dtos';
import { CurrentUser } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { KeycloakUser } from '@infrastructure/keycloak';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Controller: Apenas recebe, valida e delega
   *
   * Responsabilidades:
   * - Extrair usuário do token
   * - Chamar service
   * - Retornar resposta HTTP
   */
  @Get('me')
  @HttpCode(200)
  async getProfile(@CurrentUser() keycloakUser: KeycloakUser) {
    const { user } = await this.usersService.getProfile(keycloakUser.sub);
    return user;
  }

  /**
   * Controller: Apenas recebe, valida e delega
   *
   * Validação:
   * - Pipe Zod valida o corpo da requisição
   *
   * Responsabilidades:
   * - Extrair usuário do token
   * - Validar dados de entrada
   * - Chamar service
   * - Retornar resposta HTTP
   */
  @Patch('me')
  @HttpCode(200)
  async updateProfile(
    @CurrentUser() keycloakUser: KeycloakUser,
    @Body(new ZodValidationPipe(UpdateUserSchema))
    updateUserDto: any,
  ) {
    const { user } = await this.usersService.updateProfile(keycloakUser.sub, updateUserDto);
    return user;
  }
}

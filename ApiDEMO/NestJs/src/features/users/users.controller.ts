import { Controller, Get, Patch, Body, UseGuards, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserSchema } from './dtos/update-user.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { UserPayload } from '@features/auth/strategies/jwt.strategy';
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
  async getProfile(@CurrentUser() user: UserPayload) {
    const { user: userResponse } = await this.usersService.getProfile(user.sub);
    return userResponse;
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
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(UpdateUserSchema))
    updateUserDto: any,
  ) {
    const { user: userResponse } = await this.usersService.updateProfile(user.sub, updateUserDto);
    return userResponse;
  }
}

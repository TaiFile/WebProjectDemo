import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserSchema, LoginSchema, ConfirmEmailSchema } from './dtos/auth.dtos';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(
    @Body(new ZodValidationPipe(CreateUserSchema))
    createUserDto: any,
  ) {
    return this.authService.register(createUserDto);
  }

  @Post('confirm-email')
  @HttpCode(200)
  async confirmEmail(
    @Body(new ZodValidationPipe(ConfirmEmailSchema))
    confirmEmailDto: any,
  ) {
    return this.authService.confirmEmail(confirmEmailDto.token);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(LoginSchema))
    loginDto: any,
  ) {
    return this.authService.login(loginDto);
  }
}

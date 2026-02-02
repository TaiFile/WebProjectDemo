import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '@features/users/repositories/users.repository';
import { MailService } from '@infrastructure/mail/mail.service';
import { CreateUserDto, LoginDto } from './dtos/auth.dtos';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;
    const userExists = await this.usersRepository.emailExists(email);

    if (userExists) {
      throw new BadRequestException('Email já cadastrado');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailConfirmationToken = uuidv4();
    const emailConfirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    const user = await this.usersRepository.transaction(async (tx) => {
      const newUser = await this.usersRepository.createWithTransaction(tx, {
        email,
        name,
        password: hashedPassword,
        emailConfirmationToken,
        emailConfirmationExpires,
        emailConfirmed: false,
      });
      await this.mailService.sendConfirmationEmail(email, emailConfirmationToken);

      return newUser;
    });

    return {
      message: 'Usuário criado com sucesso. Verifique seu email para confirmar a conta.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async confirmEmail(token: string) {
    const user = await this.usersRepository.findByEmailConfirmationToken(token);

    if (!user) {
      throw new BadRequestException('Token de confirmação inválido ou expirado');
    }

    await this.usersRepository.confirmEmail(user.id);

    return {
      message: 'Email confirmado com sucesso!',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }
    if (!user.emailConfirmed) {
      throw new BadRequestException('Por favor, confirme seu email para fazer login');
    }
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}

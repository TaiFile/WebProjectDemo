import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { MailService } from '@infrastructure/mail/mail.service';
import { CreateUserDto, LoginDto } from './dtos/auth.dtos';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    // Verificar se usuário já existe
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new BadRequestException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gerar token de confirmação de email
    const emailConfirmationToken = uuidv4();
    const emailConfirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Usar transação: só cria usuário se o email for enviado com sucesso
    const user = await this.prisma.$transaction(async (tx) => {
      // Criar usuário dentro da transação
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          emailConfirmationToken,
          emailConfirmationExpires,
          emailConfirmed: false,
        },
      });

      // Enviar email - se falhar, a transação faz rollback
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
    const user = await this.prisma.user.findFirst({
      where: {
        emailConfirmationToken: token,
        emailConfirmationExpires: {
          gt: new Date(), // Token não expirou
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Token de confirmação inválido ou expirado');
    }

    // Marcar email como confirmado
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmed: true,
        emailConfirmationToken: null,
        emailConfirmationExpires: null,
      },
    });

    return {
      message: 'Email confirmado com sucesso!',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    // Verificar email confirmado
    if (!user.emailConfirmed) {
      throw new BadRequestException('Por favor, confirme seu email para fazer login');
    }

    // Comparar senha
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    // Gerar token JWT
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}

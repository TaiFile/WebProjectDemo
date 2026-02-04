import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { User } from '@prisma/client';

export interface UpdateUserData {
  name?: string;
  avatarUrl?: string | null;
}

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  emailConfirmationToken?: string;
  emailConfirmationExpires?: Date;
  emailConfirmed?: boolean;
}

export interface ConfirmEmailData {
  emailConfirmed: boolean;
  emailConfirmationToken: null;
  emailConfirmationExpires: null;
}

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar novo usuário
   */
  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  /**
   * Criar usuário dentro de uma transação
   */
  async createWithTransaction(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    data: CreateUserData,
  ): Promise<User> {
    return tx.user.create({
      data,
    });
  }

  /**
   * Buscar usuário por ID da aplicação
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar usuário por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Buscar usuário por token de confirmação de email (válido)
   */
  async findByEmailConfirmationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        emailConfirmationToken: token,
        emailConfirmationExpires: {
          gt: new Date(),
        },
      },
    });
  }

  /**
   * Listar todos os usuários
   */
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Atualizar usuário
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Confirmar email do usuário
   */
  async confirmEmail(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        emailConfirmed: true,
        emailConfirmationToken: null,
        emailConfirmationExpires: null,
      },
    });
  }

  /**
   * Deletar usuário
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Verificar se usuário existe
   */
  async exists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return !!user;
  }

  /**
   * Verificar se email já está cadastrado
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return !!user;
  }

  /**
   * Executar operação em transação
   */
  async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}

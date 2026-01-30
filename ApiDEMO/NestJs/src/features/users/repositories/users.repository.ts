import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { User } from '@prisma/client';

export interface UpdateUserData {
  name?: string;
  avatarUrl?: string | null;
}

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

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
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { User } from '@prisma/client';

export interface CreateUserData {
  keycloakId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateUserData {
  name?: string;
  avatarUrl?: string | null;
}

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Buscar usuário por ID único do Keycloak
   */
  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { keycloakId },
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
   * Listar todos os usuários
   */
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Criar novo usuário
   */
  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        keycloakId: data.keycloakId,
        email: data.email,
        name: data.name ?? null,
        avatarUrl: data.avatarUrl ?? null,
      },
    });
  }

  /**
   * Atualizar usuário
   */
  async update(keycloakId: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { keycloakId },
      data,
    });
  }

  /**
   * Deletar usuário
   */
  async delete(keycloakId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { keycloakId },
    });
  }

  /**
   * Verificar se usuário existe
   */
  async exists(keycloakId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
    });
    return !!user;
  }
}

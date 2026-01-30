import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository, UpdateUserData } from './repositories/users.repository';
import { UserResponseDto } from './dtos/user-response.dto';

interface UpdateUserRequest {
  name?: string;
  avatarUrl?: string;
}

interface UpdateUserResponse {
  user: UserResponseDto;
}

interface GetProfileResponse {
  user: UserResponseDto;
}

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  /**
   * Obtém o perfil do usuário autenticado
   *
   * Lógica:
   * - Busca usuário pelo ID usando repository
   * - Se não encontrar → erro
   * - Retorna dados do usuário
   */
  async getProfile(userId: string): Promise<GetProfileResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      user: this.mapToUserResponse(user),
    };
  }

  /**
   * Atualiza o perfil do usuário autenticado
   *
   * Lógica de negócio:
   * - Valida que usuário existe
   * - Atualiza apenas campos permitidos
   * - Retorna dados atualizados
   */
  async updateProfile(
    userId: string,
    updateUserRequest: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    // Validar que o usuário existe antes de atualizar
    const userExists = await this.usersRepository.findById(userId);

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Preparar dados para atualização (apenas campos permitidos)
    const updateData: UpdateUserData = {};
    if (updateUserRequest.name) updateData.name = updateUserRequest.name;
    if (updateUserRequest.avatarUrl !== undefined)
      updateData.avatarUrl = updateUserRequest.avatarUrl;

    // Atualizar via repository
    const updatedUser = await this.usersRepository.update(userId, updateData);

    return {
      user: this.mapToUserResponse(updatedUser),
    };
  }

  /**
   * Mapeia entidade do banco para DTO de resposta
   */
  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

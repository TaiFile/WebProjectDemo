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
  async getProfile(userId: string): Promise<GetProfileResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return {
      user: this.mapToUserResponse(user),
    };
  }

  async updateProfile(
    userId: string,
    updateUserRequest: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    const userExists = await this.usersRepository.findById(userId);

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    const updateData: UpdateUserData = {};
    if (updateUserRequest.name) updateData.name = updateUserRequest.name;
    if (updateUserRequest.avatarUrl !== undefined)
      updateData.avatarUrl = updateUserRequest.avatarUrl;
    const updatedUser = await this.usersRepository.update(userId, updateData);

    return {
      user: this.mapToUserResponse(updatedUser),
    };
  }

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

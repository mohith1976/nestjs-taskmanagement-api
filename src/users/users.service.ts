import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(email: string, name?: string): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    return this.usersRepository.create(email, name);
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async deleteUser(id: string): Promise<User> {
    return this.usersRepository.delete(id);
  }
}

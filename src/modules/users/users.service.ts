import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAlreadyExistsException, UserNotFoundException } from './exceptions/users.exceptions';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email }
    });
    
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    return await this.prismaService.user.create({
      data: {
        last_name: createUserDto.last_name,
        first_name: createUserDto.first_name,
        email: createUserDto.email,
        password: createUserDto.password,
        role: Role.MEMBER,
      },
    });
  }

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  async getProfile(id: string) {
    const user = await this.findOne(id);
    const { password, ...result } = user;
    return result;
  }

  async getUserByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UserNotFoundException(email);
    }
    return user;
  }

  async updateProfile(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    return await this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prismaService.user.delete({
      where: { id },
    });
  }

  async createAdmin(createUserDto: CreateUserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email }
    });
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }
    return await this.prismaService.user.create({
      data: {
        ...createUserDto,
        role: Role.ADMIN,
      },
    });
  }

  async suspend(id: string) {
    await this.findOne(id);
    return await this.prismaService.user.update({
      where: { id },
      data: { isSuspend: true },
    });
  }

  async activate(id: string) {
    await this.findOne(id);
    return await this.prismaService.user.update({
      where: { id },
      data: { isSuspend: false },
    });
  }
}

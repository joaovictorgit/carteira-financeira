import { compare, hash } from "bcrypt";
import { Injectable } from '@nestjs/common';

import { Result } from '@/common/error/result';
import { CreateUserResource, UpdateUserPasswordResource, UpdateUserResource } from '@/core/resources/userResources';
import { PrismaService } from '@/database/prisma.service';
import { User } from '@/utils/types/user';

@Injectable()
export class UserService {
  constructor (
    private prisma: PrismaService,
  ) {}

  async createUser(user: CreateUserResource): Promise<Result<User, Error>> {
    const currentUser: User | null = await this.prisma.user.findUnique({
      where: { email: user.email }
    });

    if (currentUser) {
      return new Result(null as any, new Error('Usuário já existe na base de dados!'));
    }

    const hashPassword = await this.hashPassword(user.password);

    const newUser = await this.prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashPassword,
      }
    });

    return new Result(newUser, null as any);
  }

  async findUsers(id: string): Promise<Result<Array<{id: string, name: string}>, Error>> {
    if (!id?.trim()) {
      return new Result(null as any, new Error('Parâmetro id é obrigatório!'));
    }

    const users: {
      id: string,
      name: string,
    }[] = await this.prisma.user.findMany({
      where: {
        NOT: { id }
      },
      select: {
        id: true,
        name: true,
      }
    });

    return new Result(users, null as any);
  }

  async findById(id: string): Promise<Result<User, Error>> {
    if (!id?.trim()) {
      return new Result(null as any, new Error('Parâmetro id é obrigatório!'));
    }

    const user: User | null = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        createdAt: true,
      }
    });

    if (!user) {
      return new Result(null as any, new Error('Usuário não encontrado!'));
    }

    return new Result(user, null as any);
  }

  async findByEmail(email: string): Promise<Result<User, Error>> {
    if (!email?.trim()) {
      return new Result(null as any, new Error('E-mail é obrigatório!'));
    }

    const user: User | null = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        createdAt: true,
      }
    });

    if (!user) {
      return new Result(null as any, new Error('Usuário não encontrado!'));
    }

    return new Result(user, null as any);
  }

  async updateUser(id: string, user: UpdateUserResource): Promise<Result<User, Error>> {
    if (!id?.trim()) {
      return new Result(null as any, new Error('Parâmetro id é obrigatório!'));
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!currentUser) {
      return new Result(null as any, new Error('Usuário não encontrado!'));
    }

    const updateInfoUser = await this.prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: user.name,
        email: user.email,
        updatedAt: new Date(),
      }
    });

    return new Result(updateInfoUser, null as any);
  }

  async updatePassword(id: string, passwordResource: UpdateUserPasswordResource): Promise<Result<Boolean, Error>> {
    if (!id?.trim()) {
      return new Result(null as any, new Error('Parâmetro id é obrigatório obrigatório!'));
    }

    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return new Result(null as any, new Error('Usuário não encontrado!'));
    }

    const isCurrentPassword = await compare(
      passwordResource.currentPassword,
      user.password
    );

    if (!isCurrentPassword) {
      return new Result(null as any, new Error('Senha incorreta!'));
    }

    const hashNewPassword = await this.hashPassword(passwordResource.newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashNewPassword,
        updatedAt: new Date(),
      }
    });

    return new Result(true, null as any);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return hash(password, saltRounds);
  }
}

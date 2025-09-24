import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/database/prisma.service';
import { User } from '@/utils/types/user';
import { Result } from '@/common/error/result';

@Injectable()
export class AuthService {
  constructor (
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async onSignIn(email: string, password: string): Promise<Result<{access_token: string } , Error>> {
    const user: User | null = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return new Result(null as any, new Error('Usuário não encontrado!'));
    }

    if (!user.password?.trim()) {
      return new Result(null as any, new Error('Senha está vazia!'));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return new Result(null as any, new Error('Senha incorreta!'));
    }

    const payload = {
      user_id: user.id,
      user: user,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return new Result({ access_token }, null as any);
  }
}

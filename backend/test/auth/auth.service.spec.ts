import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from 'bcrypt';

import { PrismaService } from "@/database/prisma.service";
import { AuthService } from "@/modules/auth/auth.service";

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn(), }
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn()
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return the access token when authentication is successful', async () => {
    const mockUser = {
      user_id: '123',
      email: 'test@example.com',
      password: await bcrypt.hash('123456', 10),
    };

    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (jwtService.signAsync as jest.Mock).mockResolvedValue('token');

    const result = await authService.onSignIn('test@example.com', '123456');
    
    expect(result.isError()).toBe(false);
    expect(result.value).toEqual({ access_token: 'token' });
  });

  it('should return error if user does not exist', async () => {
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await authService.onSignIn('wrong@example.com', '123456');

    expect(result.isError()).toBe(true);
    expect(result.error.message).toEqual('Usuário não encontrado!');
  });

  it('should return error if password is incorrect', async () => {
    const mockUser = {
      user_id: '123',
      email: 'test@example.com',
      password: await bcrypt.hash('123456', 10),
    };

    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await authService.onSignIn('test@example.com', 'wrongpass');

    expect(result.isError()).toBe(true);
    expect(result.error.message).toEqual('Senha incorreta!');
  });
});
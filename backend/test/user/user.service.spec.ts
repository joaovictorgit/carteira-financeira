import { Test, TestingModule } from "@nestjs/testing";
import { hash, compare } from 'bcrypt';

import { PrismaService } from "@/database/prisma.service";
import { UserService } from "@/modules/user/user.service";
import { CreateUserResource, UpdateUserPasswordResource, UpdateUserResource } from "@/core/resources/userResources";
import { User } from "@/utils/types/user";

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const MOCK_USER_ID = 'uuid-123';
const MOCK_USER_RESOURCE: CreateUserResource = {
  name: 'John Doe',
  email: 'john.doe@test.com',
  password: 'password123',
};
const MOCK_UPDATE_RESOURCE: UpdateUserResource = {
  name: 'Johnathan Doe',
  email: 'johnathan.doe@test.com',
};
const MOCK_PASSWORD_RESOURCE: UpdateUserPasswordResource = {
  currentPassword: 'password123',
  newPassword: 'new-password-321',
};
const MOCK_HASHED_PASSWORD = 'hashed-password-123';
const MOCK_NEW_HASHED_PASSWORD = 'new-hashed-password-321';

const MOCK_NEW_USER: User = {
  id: MOCK_USER_ID,
  name: MOCK_USER_RESOURCE.name,
  email: MOCK_USER_RESOURCE.email,
  password: MOCK_HASHED_PASSWORD,
  balance: 0 as any,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_FIND_USER_RESPONSE: Omit<User, 'password'> = {
  id: MOCK_USER_ID,
  name: MOCK_USER_RESOURCE.name,
  email: MOCK_USER_RESOURCE.email,
  balance: 0 as any,
  createdAt: MOCK_NEW_USER.createdAt,
  updatedAt: MOCK_NEW_USER.updatedAt,
};

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            }
          },
        },
      ],
    }).compile();
  
    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create and return a new user with the hashed password', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue(MOCK_HASHED_PASSWORD);

      (prismaService.user.create as jest.Mock).mockResolvedValue(MOCK_NEW_USER);

      const result = await userService.createUser(MOCK_USER_RESOURCE);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: MOCK_USER_RESOURCE.email },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: MOCK_USER_RESOURCE.email,
          name: MOCK_USER_RESOURCE.name,
          password: MOCK_HASHED_PASSWORD,
        },
      });
      expect(result.value).toEqual(MOCK_NEW_USER);
    });

    it('should return an error if a user with the email already exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(MOCK_NEW_USER);

      const result = await userService.createUser(MOCK_USER_RESOURCE);

      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.user.create).not.toHaveBeenCalled();
      expect(result.error.message).toBe('Usuário já existe na base de dados!');
    });
  });

  describe('findById', () => {
    it('should return the user with correct data when found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(MOCK_FIND_USER_RESPONSE);

      const result = await userService.findById(MOCK_USER_ID);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: MOCK_USER_ID },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
          createdAt: true,
        },
      });
      expect(result.value).toEqual(MOCK_FIND_USER_RESPONSE);
    });

    it('should return an error if the user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.findById(MOCK_USER_ID);

      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(result.error.message).toBe('Usuário não encontrado!');
    });

    it('should return an error if the id parameter is null or empty', async () => {
      const result = await userService.findById(null as any);

      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
      expect(result.error.message).toBe('Parâmetro id é obrigatório!');
    });
  });

  describe('updateUser', () => {
    it('should successfully update the name and email of an existing user', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(MOCK_NEW_USER);
      
      const MOCK_UPDATED_USER = { ...MOCK_NEW_USER, ...MOCK_UPDATE_RESOURCE };
      (prismaService.user.update as jest.Mock).mockResolvedValue(MOCK_UPDATED_USER);

      const result = await userService.updateUser(MOCK_USER_ID, MOCK_UPDATE_RESOURCE);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: MOCK_USER_ID },
      });
      
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: MOCK_USER_ID },
          data: expect.objectContaining({
            name: MOCK_UPDATE_RESOURCE.name,
            email: MOCK_UPDATE_RESOURCE.email,
          }),
        }),
      );
      expect(result.value.name).toBe(MOCK_UPDATE_RESOURCE.name);
    });

    it('should return an error if the user to be updated is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.updateUser(MOCK_USER_ID, MOCK_UPDATE_RESOURCE);

      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(result.error.message).toBe('Usuário não encontrado!');
    });

    it('should return an error if the id parameter is null or empty', async () => {
      const result = await userService.updateUser(null as any, MOCK_UPDATE_RESOURCE);

      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
      expect(result.error.message).toBe('Parâmetro id é obrigatório!');
    });
  });

  describe('updatePassword', () => {
    it('should successfully update the password when the current password is correct', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(MOCK_NEW_USER);
      (compare as jest.Mock).mockResolvedValue(true);
      (hash as jest.Mock).mockResolvedValue(MOCK_NEW_HASHED_PASSWORD);

      const result = await userService.updatePassword(MOCK_USER_ID, MOCK_PASSWORD_RESOURCE);

      expect(compare).toHaveBeenCalledWith(MOCK_PASSWORD_RESOURCE.currentPassword, MOCK_HASHED_PASSWORD);
      
      expect(hash).toHaveBeenCalledWith(MOCK_PASSWORD_RESOURCE.newPassword, 10);
      
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: MOCK_NEW_HASHED_PASSWORD }),
        }),
      );
    });

    it('should return an error if the provided current password is incorrect', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(MOCK_NEW_USER);
      (compare as jest.Mock).mockResolvedValue(false);

      const result = await userService.updatePassword(MOCK_USER_ID, MOCK_PASSWORD_RESOURCE);

      expect(compare).toHaveBeenCalled();
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(result.error.message).toBe('Senha incorreta!');
    });

    it('should return an error if the user to be updated is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.updatePassword(MOCK_USER_ID, MOCK_PASSWORD_RESOURCE);

      expect(compare).not.toHaveBeenCalled();
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(result.error.message).toBe('Usuário não encontrado!');
    });

    it('should return an error if the id parameter is null or empty', async () => {
      const result = await userService.updatePassword(null as any, MOCK_PASSWORD_RESOURCE);

      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
      expect(result.error.message).toBe('Parâmetro id é obrigatório obrigatório!');
    });
  });
});
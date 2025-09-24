import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from 'supertest';
import * as bcrypt from 'bcrypt';

import { PrismaService } from "@/database/prisma.service";
import { AuthModule } from "@/modules/auth/auth.module";

describe('AuthController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule]
    }).compile();

    app = module.createNestApplication();
    await app.init();
    prismaService = module.get<PrismaService>(PrismaService);

    await prismaService.user.deleteMany({});
    await prismaService.user.create({
      data: {
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User'
      },
    });
  });

  it('should return an access token for a valid user', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });

  it('should return an error for invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrong-password' })
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
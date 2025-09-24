import type { Response } from 'express';
import { Body, Controller, HttpStatus, Logger, Post, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthResources } from '@/core/resources/authResources';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ description: 'Autenticação' })
  async signIn(@Body() data: AuthResources, @Res() res: Response) {
    this.logger.log('Autenticando usuário!');

    const result = await this.authService.onSignIn(data.email, data.password);

    if (result.isError()) {
      this.logger.error(result.error.message);

      return res.status(HttpStatus.NOT_FOUND).json(result.error.message);
    }

    this.logger.log('Usuário autenticado!');

    return res.status(HttpStatus.CREATED).json(result.value);
  }
}

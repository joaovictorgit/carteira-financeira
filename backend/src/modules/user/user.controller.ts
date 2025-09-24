import { Body, Controller, Get, HttpStatus, Logger, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';

import { UserService } from './user.service';
import { CreateUserResource, UpdateUserPasswordResource, UpdateUserResource } from '@/core/resources/userResources';
import { AuthGuard } from '@/core/guards/auth.guard';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor (private userService: UserService) {}

  @Post()
  @ApiOperation({ description: 'Criando novo usuário' })
  async onCreateUser(@Body() data: CreateUserResource, @Res() res: Response) {
    this.logger.log(`Criando novo usuário ${data}`);

    const result = await this.userService.createUser(data);

    if (result.isError()) {
      this.logger.error(result.error.message);

      return res.status(HttpStatus.BAD_REQUEST).json(result.error.message);
    }

    this.logger.log('Usuário criado com sucesso!');

    return res.status(HttpStatus.CREATED).json(result.value);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ description: 'Buscar usuário pelo id' })
  async findUserById(@Param() params: { id: string }, @Res() res: Response) {
    this.logger.log(`Busca de usuário pelo ID - ${params.id}`);

    const result = await this.userService.findById(params.id);

    if (result.isError()) {
      this.logger.error(result.error.message);

      return res.status(HttpStatus.BAD_REQUEST).json(result.error.message);
    }

    this.logger.log('Usuário encontrado!');

    return res.status(HttpStatus.OK).json(result.value);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiOperation({ description: 'Atualizar usuário pelo id' })
  async updateUser(
    @Param() params: { id: string },
    @Body() data: UpdateUserResource,
    @Res() res: Response,
  ) {
    this.logger.log(`Atualizar usuário pelo ID - ${params.id}`);

    const result = await this.userService.updateUser(
      params.id,
      data,
    );

    if (result.isError()) {
      this.logger.error(result.error.message);

      return res.status(HttpStatus.BAD_REQUEST).json(result.error.message);
    }

    this.logger.log('Usuário atualizado!');

    return res.status(HttpStatus.OK).json(result.value);
  }

  @UseGuards(AuthGuard)
  @Put(':id/password')
  @ApiOperation({ description: 'Atualizar password do usuário' })
  async updatePassword(
    @Param() params: { id: string },
    @Body() data: UpdateUserPasswordResource,
    @Res() res: Response,
  ) {
    this.logger.log(`Atualizar senha do usuário - ${params.id}`);

    const result = await this.userService.updatePassword(
      params.id,
      data,
    );

    if (result.isError()) {
      this.logger.error(result.error.message);

      return res.status(HttpStatus.BAD_REQUEST).json(result.error.message);
    }

    this.logger.log('Senha atualizada!');

    return res.status(HttpStatus.OK).json(result.value);
  }
}

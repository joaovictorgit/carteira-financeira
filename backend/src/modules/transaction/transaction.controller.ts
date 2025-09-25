import type { Response } from 'express';
import { Body, Controller, Get, HttpStatus, Logger, Param, Post, Put, Request, Res, UseGuards } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { UserController } from '../user/user.controller';
import { TransactionService } from './transaction.service';
import { CreateTransactionResource } from '@/core/resources/transactionResources';
import { AuthGuard } from '@/core/guards/auth.guard';
import { Decimal } from '@prisma/client/runtime/library';

@Controller('transaction')
export class TransactionController {
  private readonly logger = new Logger(UserController.name);

  constructor(private transactionService: TransactionService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiProperty({ description: 'Criando transação!' })
  async onCreateTransaction(
    @Body() data: CreateTransactionResource,
    @Request() req,
    @Res() res: Response
  ) {
    const userId = req['user'].user_id;

    this.logger.log(`Iniciando transação do usuário: ${userId}`);

    const decimalAmount = new Decimal(data.amount);
    
    const result = await this.transactionService.createTransaction(data, userId);

    if (result.error) {
       this.logger.error(result.error.message);
       const status = result.error.message.includes('insuficiente') || result.error.message.includes('própria conta')
       ? HttpStatus.CONFLICT
       : HttpStatus.INTERNAL_SERVER_ERROR;
                
      return res.status(status).json(result.error.message);
    }

    return res.status(HttpStatus.CREATED).json(result.value);
  }

  @UseGuards(AuthGuard)
  @Put(':transactionId')
  @ApiProperty({ description: 'Reverter transação' })
  async onReverteTransaction(
    @Param() params: { transactionId },
    @Res() res: Response,
  ) {
    this.logger.log(`Reverter a transação ${params.transactionId}`);

    const result = await this.transactionService.revertTransaction(params.transactionId);

    if (result.isError()) {
      this.logger.error(result.error.message);

      return res.status(HttpStatus.BAD_REQUEST).json(result.error.message);
    }

    this.logger.log('Transação revertida');

    return res.status(HttpStatus.OK).json('ok');
  }

  @UseGuards(AuthGuard)
  @Get('user')
  @ApiProperty({ description: 'Retornar todas as transações do usuário' })
  async getAllTransactionsByUser(
    @Request() req,
    @Res() res: Response,
  ) {
    const userId = req['user'].user_id;

    this.logger.log(`Todas as transações do usuário: ${userId}`);

    const result = await this.transactionService.getTransactionsByUser(userId);

    if (result.isError()) {
      this.logger.error(result.error.message);

      return res.status(HttpStatus.BAD_REQUEST).json(result.error.message);
    }

    this.logger.log('Transações encontradas!');

    return res.status(HttpStatus.OK).json(result.value);
  }
}

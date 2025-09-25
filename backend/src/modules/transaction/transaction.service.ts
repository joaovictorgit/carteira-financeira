import { $Enums, Prisma, Transaction } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { Result } from '@/common/error/result';
import { CreateTransactionResource } from '@/core/resources/transactionResources';
import { PrismaService } from '@/database/prisma.service';

export interface PrismaTransactionClient {
  user: {
    findUnique: (args: any) => Promise<{ id: string; balance: number } | null>;
    update: (args: any) => any;
  };
  transaction: {
    findUnique: (args: any) => Promise<Transaction | null>;
    update: (args: any) => Promise<Transaction>;
    create: (args: any) => Promise<Transaction>;
    findMany: (args: any) => Promise<Transaction[]>;
  };
}

@Injectable()
export class TransactionService {
  constructor (private prisma: PrismaService) {}

  async createTransaction(
    transaction: CreateTransactionResource,
    userId: string
  ): Promise<Result<Transaction, Error>> {
    const { receiverId, amount, type } = transaction;

    const senderId = type === $Enums.TypeTransaction.TRANSFER ? userId : null;

    if (amount <= 0) {
      return new Result(
        null as any,
        new Error('O valor da transação deve ser positivo!')
      );
    }
    
    if (
      type === $Enums.TypeTransaction.TRANSFER &&
      senderId === receiverId
    ) {
      return new Result(
        null as any,
        new Error('Não é possível transferir para a própria conta!')
      );
    }

    if (
      type === $Enums.TypeTransaction.TRANSFER &&
      !senderId?.trim()
    ) {
      return new Result(
        null as any,
        new Error('Remetente é obrigatório para transferências!')
      );
    }

    try {
      const newTransaction = await this.prisma.$transaction(
        async (tx) => {
          const prismaTx = tx as PrismaTransactionClient;

          if (type === $Enums.TypeTransaction.TRANSFER) {
            const sender = await prismaTx.user.findUnique({
              where: { id: senderId! },
              select: { id: true, balance: true }
            });

            if (!sender) {
              throw new Error('Usuário remetente não encontrado!');
            }

            if (sender.balance < amount) {
              throw new Error('Saldo insuficiente para realizar a transação.');
            }

            await prismaTx.user.update({
              where: { id: senderId! },
              data: {
                balance: { decrement: amount },
                updatedAt: new Date(),
              }
            });
          }

          await prismaTx.user.update({
            where: { id: receiverId },
            data: { 
              balance: { increment: amount },
              updatedAt: new Date(),
            }
          });

          return await prismaTx.transaction.create({
            data: {
              senderId,
              receiverId,
              amount,
              type,
              status: $Enums.TransactionStatus.COMPLETED,
            },
          });
        }
      );

      return new Result(newTransaction, null as any);
    } catch (error) {
      return new Result(null as any, error);
    }
  }

  async revertTransaction(transactionId: string): Promise<Result<boolean, Error>> {
    if (!transactionId?.trim()) {
      return new Result(null as any, new Error('ID da transação é obrigatório para reversão!'));
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return new Result(null as any, new Error('Transação não encontrada.'));
    }

    if (transaction.status === $Enums.TransactionStatus.REVERTED) {
      return new Result(null as any, new Error('Transação já foi revertida.'));
    }

    if (transaction.status !== $Enums.TransactionStatus.COMPLETED) {
      return new Result(null as any, new Error('A transação deve estar COMPLETED para ser revertida.'));
    }

    const originalSenderId = transaction.senderId; 
    const originalReceiverId = transaction.receiverId; 
    const amount = transaction.amount;
    const isTransfer = transaction.type === $Enums.TypeTransaction.TRANSFER;
    const isDeposit = transaction.type === $Enums.TypeTransaction.DEPOSIT;

    try {
      await this.prisma.$transaction(
        async (tx) => {
          const prismaTx = tx as PrismaTransactionClient;

          if (isTransfer) {
            await prismaTx.user.update({
              where: { id: originalSenderId! },
              data: {
                balance: { increment: amount },
                updatedAt: new Date(),
              },
            });

            await prismaTx.user.update({
              where: { id: originalReceiverId },
              data: {
                balance: { decrement: amount },
                updatedAt: new Date(),
              },
            });
          } else if (isDeposit) {
            await prismaTx.user.update({
              where: { id: originalReceiverId },
              data: {
                balance: { decrement: amount },
              }
            });
          }

          await prismaTx.transaction.update({
            where: { id: transactionId },
            data: {
              status: $Enums.TransactionStatus.REVERTED,
              type: $Enums.TypeTransaction.REVERSAL,
            },
          });

        }
      );
      
      return new Result(true, null as any);
    } catch (error) {
      return new Result(null as any, error);
    }
  }

  async getTransactionsByUser(userId: string): Promise<Result<Transaction[], Error>> {
    if (!userId?.trim()) {
      return new Result(null as any, new Error('ID do usuário é obrigatório!'));
    }

    try {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      });

      return new Result(transactions, null as any);
    } catch (error: any) {
      return new Result(null as any, new Error('Erro ao buscar transações.'));
    }
  }
}

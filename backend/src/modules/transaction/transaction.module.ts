import { PrismaService } from '@/database/prisma.service';
import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';

@Module({
  controllers: [TransactionController],
  providers: [PrismaService, TransactionService],
  exports: [TransactionService]
})
export class TransactionModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { $Enums, Prisma, Transaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { mockDeep } from 'jest-mock-extended';

import { PrismaService } from '@/database/prisma.service';
import { PrismaTransactionClient, TransactionService } from '@/modules/transaction/transaction.service';
import { CreateTransactionResource } from '@/core/resources/transactionResources';

const MOCK_SENDER_ID = 'sender-user-id';
const MOCK_RECEIVER_ID = 'receiver-user-id';
const MOCK_TRANSACTION_ID = 'transaction-id-123';
const MOCK_AMOUNT_DECIMAL = 100;
const MOCK_AMOUNT_INSUFFICIENT = 1000;

const MOCK_TRANSFER_RESOURCE: CreateTransactionResource = {
  amount: 100,
  receiverId: MOCK_RECEIVER_ID,
  type: $Enums.TypeTransaction.TRANSFER,
};

const MOCK_DEPOSIT_RESOURCE: CreateTransactionResource = {
  amount: 100,
  receiverId: MOCK_RECEIVER_ID,
  type: $Enums.TypeTransaction.DEPOSIT,
};

const MOCK_COMPLETED_TRANSACTION: Transaction = {
  id: MOCK_TRANSACTION_ID,
  amount: 100,
  type: $Enums.TypeTransaction.TRANSFER,
  status: $Enums.TransactionStatus.COMPLETED,
  createdAt: new Date(),
  senderId: MOCK_SENDER_ID,
  receiverId: MOCK_RECEIVER_ID,
};

const MOCK_SENDER_WITH_BALANCE = {
  id: MOCK_SENDER_ID,
  balance: 500,
};

const MOCK_SENDER_WITH_INSUFFICIENT_BALANCE = {
  id: MOCK_SENDER_ID,
  balance: 50,
};

describe('TransactionService', () => {
  let transactionService: TransactionService;
  type MockPrismaService = ReturnType<typeof mockDeep<PrismaService>>; 
  let prismaService: MockPrismaService; 
  type MockPrismaTransactionClient = ReturnType<typeof mockDeep<PrismaTransactionClient>>;
  let mockPrismaTx: MockPrismaTransactionClient; 
  let spyOnTransaction: jest.SpyInstance;

  beforeAll(() => {
    mockPrismaTx = mockDeep<PrismaTransactionClient>();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    prismaService = module.get(PrismaService);

    spyOnTransaction = jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (callback) => {
        return callback(mockPrismaTx as any);
      });

    jest.clearAllMocks();

    mockPrismaTx.user.findUnique.mockClear();
    mockPrismaTx.user.update.mockClear();
    mockPrismaTx.transaction.create.mockClear();
    mockPrismaTx.transaction.update.mockClear();
  });

  it('should be defined', () => {
    expect(transactionService).toBeDefined();
  });

  describe('createTransaction (TRANSFER)', () => {
    it('should successfully create a TRANSFER transaction', async () => {
      mockPrismaTx.user.findUnique.mockResolvedValue(MOCK_SENDER_WITH_BALANCE as any);
      mockPrismaTx.transaction.create.mockResolvedValue(MOCK_COMPLETED_TRANSACTION);

      const result = await transactionService.createTransaction(
        MOCK_TRANSFER_RESOURCE,
        MOCK_SENDER_ID,
      );

      expect(result.value).toEqual(MOCK_COMPLETED_TRANSACTION);
      expect(result.error).toBe(null);

      expect(mockPrismaTx.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaTx.user.update).toHaveBeenCalledTimes(2);
      expect(mockPrismaTx.transaction.create).toHaveBeenCalledTimes(1);

      expect(mockPrismaTx.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: MOCK_SENDER_ID },
          data: { balance: { decrement: MOCK_AMOUNT_DECIMAL }, updatedAt: expect.any(Date) },
        }),
      );

      expect(mockPrismaTx.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: MOCK_RECEIVER_ID },
          data: { balance: { increment: MOCK_AMOUNT_DECIMAL }, updatedAt: expect.any(Date) },
        }),
      );
    });

    it('should return an error for insufficient balance and rollback', async () => {
      mockPrismaTx.user.findUnique.mockResolvedValue(MOCK_SENDER_WITH_INSUFFICIENT_BALANCE as any);

      const result = await transactionService.createTransaction(
        MOCK_TRANSFER_RESOURCE,
        MOCK_SENDER_ID,
      );

      expect(result.error.message).toBe('Saldo insuficiente para realizar a transação.');
      expect(result.value).toBe(null);

      expect(mockPrismaTx.user.update).not.toHaveBeenCalled();
      expect(mockPrismaTx.transaction.create).not.toHaveBeenCalled();
    });

    it('should return an error if sender attempts to transfer to self', async () => {
      const resource: CreateTransactionResource = {
        ...MOCK_TRANSFER_RESOURCE,
        receiverId: MOCK_SENDER_ID,
      };

      const result = await transactionService.createTransaction(resource, MOCK_SENDER_ID);

      expect(result.error.message).toBe('Não é possível transferir para a própria conta!');
      expect(spyOnTransaction).not.toHaveBeenCalled();
    });

    it('should return an error if amount is zero or negative', async () => {
      const resource: CreateTransactionResource = {
        ...MOCK_TRANSFER_RESOURCE,
        amount: 0,
      };

      const result = await transactionService.createTransaction(resource, MOCK_SENDER_ID);

      expect(result.error.message).toBe('O valor da transação deve ser positivo!');
      expect(spyOnTransaction).not.toHaveBeenCalled();
    });
  });

  describe('createTransaction (DEPOSIT)', () => {
    it('should successfully create a DEPOSIT transaction (only credit)', async () => {
      mockPrismaTx.transaction.create.mockResolvedValue(MOCK_COMPLETED_TRANSACTION);

      const result = await transactionService.createTransaction(
        MOCK_DEPOSIT_RESOURCE,
        MOCK_SENDER_ID,
      );

      expect(result.error).toBe(null);
      expect(mockPrismaTx.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaTx.user.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaTx.transaction.create).toHaveBeenCalledTimes(1);

      expect(mockPrismaTx.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: MOCK_RECEIVER_ID },
          data: { balance: { increment: MOCK_AMOUNT_DECIMAL }, updatedAt: expect.any(Date) },
        }),
      );

      expect(mockPrismaTx.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            senderId: null,
            type: $Enums.TypeTransaction.DEPOSIT,
          }),
        }),
      );
    });
  });

  describe('revertTransaction', () => {
    it('should successfully revert a TRANSFER transaction and update balances', async () => {
      prismaService.transaction.findUnique.mockResolvedValue(MOCK_COMPLETED_TRANSACTION);
      mockPrismaTx.transaction.update.mockResolvedValue({
        ...MOCK_COMPLETED_TRANSACTION,
        status: $Enums.TransactionStatus.REVERTED,
        type: $Enums.TypeTransaction.REVERSAL,
      });

      const result = await transactionService.revertTransaction(MOCK_TRANSACTION_ID);

      expect(result.value).toBe(true);
      expect(result.error).toBe(null);

      expect(mockPrismaTx.user.update).toHaveBeenCalledTimes(2);
      expect(mockPrismaTx.transaction.update).toHaveBeenCalledTimes(1);

      expect(mockPrismaTx.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: MOCK_SENDER_ID },
          data: { balance: { increment: MOCK_AMOUNT_DECIMAL }, updatedAt: expect.any(Date) },
        }),
      );

      expect(mockPrismaTx.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: MOCK_RECEIVER_ID },
          data: { balance: { decrement: MOCK_AMOUNT_DECIMAL }, updatedAt: expect.any(Date) },
        }),
      );
    });

    it('should successfully revert a DEPOSIT transaction and update balances', async () => {
        const depositTransaction: Transaction = {
            ...MOCK_COMPLETED_TRANSACTION,
            type: $Enums.TypeTransaction.DEPOSIT,
            senderId: null,
        };
        
        prismaService.transaction.findUnique.mockResolvedValue(depositTransaction);

        const result = await transactionService.revertTransaction(MOCK_TRANSACTION_ID);

        expect(result.value).toBe(true);
        expect(result.error).toBe(null);
        expect(mockPrismaTx.user.update).toHaveBeenCalledTimes(1);
        expect(mockPrismaTx.transaction.update).toHaveBeenCalledTimes(1);
        expect(mockPrismaTx.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: MOCK_RECEIVER_ID },
                data: { balance: { decrement: MOCK_AMOUNT_DECIMAL } }
            }),
        );
    });

    it('should return an error if the transaction is already REVERTED', async () => {
      prismaService.transaction.findUnique.mockResolvedValue({
        ...MOCK_COMPLETED_TRANSACTION,
        status: $Enums.TransactionStatus.REVERTED,
      });

      const result = await transactionService.revertTransaction(MOCK_TRANSACTION_ID);

      expect(result.error.message).toBe('Transação já foi revertida.');
      expect(mockPrismaTx.user.update).not.toHaveBeenCalled();
    });

    it('should return an error if the transaction is not found', async () => {
      prismaService.transaction.findUnique.mockResolvedValue(null);

      const result = await transactionService.revertTransaction(MOCK_TRANSACTION_ID);

      expect(result.error.message).toBe('Transação não encontrada.');
      expect(mockPrismaTx.user.update).not.toHaveBeenCalled();
    });
  });

  describe('getTransactionsByUser', () => {
    it('should successfully return transactions for a given user', async () => {
      prismaService.transaction.findMany.mockResolvedValue([MOCK_COMPLETED_TRANSACTION] as any);

      const result = await transactionService.getTransactionsByUser(MOCK_SENDER_ID);

      expect(result.value).toEqual([MOCK_COMPLETED_TRANSACTION]);
      expect(result.error).toBe(null);
      expect(prismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ senderId: MOCK_SENDER_ID }, { receiverId: MOCK_SENDER_ID }],
          },
        }),
      );
    });

    it('should return an error if user ID is missing', async () => {
      const result = await transactionService.getTransactionsByUser('');

      expect(result.error.message).toBe('ID do usuário é obrigatório!');
      expect(prismaService.transaction.findMany).not.toHaveBeenCalled();
    });
  });
});
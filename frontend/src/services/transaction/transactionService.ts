import { api } from "../api";

export enum TypeTransaction {
  deposit = 'DEPOSIT',
  transfer = 'TRANSFER',
  reversal = 'REVERSAL'
}

export enum TransactionStatus {
  pending = 'PENDING',
  completed = 'COMPLETED',
  reverted = 'REVERTED',
  failed = 'FAILED',
}

export type Transaction = {
  receiverId: string;
  amount: number;
  type: TypeTransaction;
  id: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
  senderId: string | null;
  sender?: { id: string, name: string, email: string }
  receiver?: { id: string, name: string, email: string }
}

export type CreateTransactionResource = {
  amount: number;
  receiverId: string;
  type?: TypeTransaction
}

export type PaginationResult<T> = {
  items: T[],
  first: number,
  last: number,
  total: number,
}

export type PaginationParams = {
  page?: number;
  limit?: number;
}

export const TransactionService = {
  onGetTransactionsByUser: async (params: PaginationParams = {}): Promise<PaginationResult<Transaction>> => {
    const query = new URLSearchParams(params as Record<string, any>).toString();

    const response = await api.get(`/transaction/user?${query}`);

    return response.data;
  },

  onSaveTransaction: async (payload: CreateTransactionResource): Promise<Transaction> => {
    const response = await api.post('/transaction', payload);

    return response.data;
  },

  onRevertTransaction: async (transactionId: string): Promise<boolean> => {
    const response = await api.put<boolean>(`/transaction/${transactionId}`);

    return response.data;
  },
};
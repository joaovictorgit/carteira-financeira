export type Transaction = {
  id: string;
  amount: number;
  type: TypeTransaction;
  status: TransactionStatus;
  createdAt: Date;
  senderId?: string;
  receiverId: string;
}

export type PaginationResult<T> = {
  items: T[],
  first: number,
  last: number,
  total: number,
  page: number,
}

export type PaginationParams = {
  page?: number;
  limit?: number;
}
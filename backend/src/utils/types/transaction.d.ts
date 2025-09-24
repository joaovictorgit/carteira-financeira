export type Transaction = {
  id: string;
  amount: number;
  type: TypeTransaction;
  status: TransactionStatus;
  createdAt: Date;
  senderId?: string;
  receiverId: string;
}
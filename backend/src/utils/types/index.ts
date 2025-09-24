export enum TypeTransaction {
  deposit = 'DEPOSIT',
  transfer = 'TRANSFER',
  reversal = 'REVERSAL',
}

export enum TransactionStatus {
  pending = 'PENDING',
  completed = 'COMPLETED',
  reverted = 'REVERTED',
  failed = 'FAILED',
}
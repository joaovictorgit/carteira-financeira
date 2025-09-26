import { ArrowUpRight, ArrowDownLeft, Plus, RotateCcw, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/util';
import { Transaction, TransactionStatus, TypeTransaction } from '@/services/transaction/transactionService';
import { useState } from 'react';
import { Button } from '../form/button';

interface TransactionItemProps {
  transaction: Transaction;
  userId: string;
  onRevert: (transactionId: string) => Promise<void>;
  onClick?: () => void;
}

export function TransactionItem({ transaction, userId, onClick, onRevert }: TransactionItemProps) {
  const [isReverting, setIsReverting] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTransactionIcon = () => {
    if (transaction.status === TransactionStatus.reverted) return RotateCcw;
    if (transaction.type === TypeTransaction.deposit) return Plus;
    if (transaction.senderId === userId) return ArrowUpRight;
    return ArrowDownLeft;
  };

  const getTransactionText = () => {
    if (transaction.status === TransactionStatus.reverted) return 'Transação revertida';
    if (transaction.type === TypeTransaction.deposit) return 'Depósito';
    if (transaction.senderId === userId) {
      return `Transferência para ${transaction.receiver?.name || 'Usuário'}`;
    }
    return `Recebido de ${transaction.sender?.name || 'Usuário'}`;
  };

  const getAmountColor = () => {
    if (transaction.status === TransactionStatus.reverted) return 'text-[#737b8c]';
    if (transaction.type === TypeTransaction.deposit || transaction.receiverId === userId) {
      return 'text-[#1fad4e]';
    }
    return 'text-[#e23636]';
  };

  const getAmountPrefix = () => {
    if (transaction.status === TransactionStatus.reverted) return '';
    if (transaction.type === TypeTransaction.deposit || transaction.receiverId === userId) {
      return '+';
    }
    return '-';
  };

  const getStatusBadge = () => {
    const statusConfig = {
      [TransactionStatus.completed]: { label: 'Concluída', variant: 'default' as const },
      [TransactionStatus.pending]: { label: 'Pendente', variant: 'secondary' as const },
      [TransactionStatus.failed]: { label: 'Falhou', variant: 'destructive' as const },
      [TransactionStatus.reverted]: { label: 'Revertida', variant: 'outline' as const }
    };

    const config = statusConfig[transaction.status] || statusConfig[TransactionStatus.pending];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const Icon = getTransactionIcon();
  const isPositive = transaction.type === TypeTransaction.deposit || transaction.receiverId === userId;
  const isReversed = transaction.status === TransactionStatus.reverted; 

  const canBeReverted = 
    transaction.type === TypeTransaction.transfer ||
    transaction.status === TransactionStatus.completed

  const handleRevertClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReverting || !onRevert) return;

    setIsReverting(true);
    try {
      onRevert(transaction.id);
    } catch (error) {
        console.error("Erro ao tentar reverter a transação:", error);
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 rounded-lg",
        onClick && "cursor-pointer hover:shadow-md",
        isReverting && "opacity-75"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0",
          isPositive && !isReversed && "bg-[#1fad4e1a] text-[#1fad4e]",
          !isPositive && !isReversed && "bg-[#e236361a] text-[#e23636]",
          isReversed && "bg-[#f3f4f6] text-[#737b8c]"
        )}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {getTransactionText()}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-[#737b8c] flex-shrink-0">
              {formatDate(transaction.createdAt)}
            </p>
            {getStatusBadge()}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col-reverse items-center gap-3 flex-shrink-0 ml-4">
        <div className="text-right">
          <p className={cn("text-sm font-semibold", getAmountColor())}>
            {getAmountPrefix()}{formatCurrency(transaction.amount)}
          </p>
          {transaction.updatedAt && transaction.status === TransactionStatus.reverted && (
            <p className="text-xs text-[#737b8c]">
              Revertida em {formatDate(transaction.updatedAt)}
            </p>
          )}
        </div>

        {canBeReverted && (
          <Button
            variant="ghost" 
            size="icon" 
            onClick={handleRevertClick} 
            disabled={isReverting}
            className="!bg-transparent !border-none !shadow-none text-red-500 hover:text-red-700 h-8 w-8 transition-colors flex-shrink-0"
          >
            {isReverting ? (
              <RotateCcw color="gray" className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle color="gray" className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
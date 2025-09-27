'use client'

import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast'; 

import { UserService, UserResponse } from '@/services/user/userService';
import { PaginationResult, Transaction, TransactionService } from '@/services/transaction/transactionService';
import { BalanceCard } from '@/components/wallet/balance-card';
import { Card } from '@/components/form/card/card';
import { CardContent } from '@/components/form/card/card-content';
import { History, Plus, ArrowUpRight } from 'lucide-react';
import { DepositDialog } from '@/components/dialogs/deposit-dialog';
import { TransferDialog } from '@/components/dialogs/transfer-dialog';
import { TransactionItem } from '@/components/wallet/transaction-item';
import { Button } from '@/components/form/button';
import { useAuthUser } from '@/hooks/useAuthUser';

export default function DashboardPage() {
  const { user, fetchUser } = useAuthUser();
  const [transactions, setTransactions] = useState<PaginationResult<Transaction>>();
  const [isLoading, setIsLoading] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const quickActions = [
    {
      title: 'Fazer Depósito',
      description: 'Adicionar saldo à carteira',
      icon: Plus,
      onClick: () => setDepositDialogOpen(true),
      variant: 'success' as const
    },
    {
      title: 'Transferir',
      description: 'Enviar dinheiro para outro usuário',
      icon: ArrowUpRight,
      onClick: () => setTransferDialogOpen(true),
      variant: 'primary' as const
    },
  ];

  const fetchTransactions = useCallback(async (page: number) => {
    try {
      const response = await TransactionService.onGetTransactionsByUser({ page, limit: 10 });
      setTransactions(response);
    } catch (error) {
      let errorMessage = 'Falha ao carregar transações. Tente novamente.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || 'Erro de conexão.';
      }
          
      toast.error(errorMessage, { position: 'top-right' });
    }
  }, []);

  
  const handleRevertTransaction = useCallback(async (transactionId: string) => {
    try {
      await TransactionService.onRevertTransaction(transactionId);

      toast.success('Transação revertida!', { position: 'top-right' });
      reloadData(page);
    } catch (error) {
      let errorMessage = 'Falha ao reverter a transação. Tente novamente.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || 'Erro desconhecido.';
      }
          
      toast.error(errorMessage, { position: 'top-right' });
      throw error;
    }
  }, []);

  const reloadData = useCallback(async (page: number) => {
    setIsLoading(true);
    await Promise.all([
      fetchUser(),
      fetchTransactions(page)
    ]);
    setIsLoading(false);
  }, [fetchUser, fetchTransactions]);

  useEffect(() => {
    reloadData(page);
  }, [reloadData, page]);

  const handleNextPage = () => {
    if (transactions && page < transactions.last) {
      setPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  if (isLoading || !user) {
    return (
      <div className='flex items-center justify-center h-[50vh]'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-700">Carregando dados da página...</p>
        </div>
      </div>
    );
  }
 
  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <BalanceCard
            balance={user.balance}
          />
        </div>
      </div>

      <div className='mt-10'>
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className="wallet-card hover:shadow-glow transition-all cursor-pointer h-full"
              onClick={action.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`
                    flex h-12 w-12 items-center justify-center rounded-lg
                    ${action.variant === 'success' ? 'bg-[#1fad4e1a] text-[#1fad4e]' : ''}
                    ${action.variant === 'primary' ? 'bg-[#0476ae1a] text-[#0476ae]' : ''}
                  `}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 mt-10">
          <h2 className="text-lg font-semibold">Transações Recentes</h2>
        </div>
      </div>

      <Card className="wallet-card">
        <CardContent className="p-0">
          {transactions && transactions?.items.length > 0 ? (
            <div className="divide-y divide-[#dcdfe4]">
              {transactions?.items.map((transaction) => (
                <div key={transaction.id} className="p-4">
                  <TransactionItem
                    transaction={transaction} 
                    userId={user.id}
                    onRevert={handleRevertTransaction}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma transação encontrada
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Suas transações aparecerão aqui
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {transactions && transactions.total > 0 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={handlePreviousPage}
            disabled={page === 1 || isLoading}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {transactions.last}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={page === transactions.last || isLoading}
            variant="outline"
          >
            Próximo
          </Button>
        </div>
      )}

      <DepositDialog
        open={depositDialogOpen} 
        onOpenChange={setDepositDialogOpen}
        userId={user.id}
        onDepositSuccess={() => reloadData(page)}
      />

      <TransferDialog
        balance={user.balance}
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onTranferSuccess={() => reloadData(page)}
      />
    </>
  );
}

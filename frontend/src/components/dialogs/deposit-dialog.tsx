import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/form/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/form/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { Input } from '@/components/form/input';
import { Textarea } from '@/components/form/textarea';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { Select, SelectContent, SelectTrigger, SelectValue } from '../form/select';
import { UserService } from '@/services/user/userService';
import { SelectItem } from '../form/select-item';
import { TransactionService, TypeTransaction } from '@/services/transaction/transactionService';

const depositSchema = z.object({
  amount: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => {
      const num = parseFloat(val.replace(',', '.'));
      return !isNaN(num) && num > 0;
    }, 'Valor deve ser maior que zero')
    .refine((val) => {
      const num = parseFloat(val.replace(',', '.'));
      return num <= 50000;
    }, 'Valor máximo é R$ 50.000,00'),
});

type DepositFormData = z.infer<typeof depositSchema>;

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onDepositSuccess: () => void; 
}

export function DepositDialog({ open, onOpenChange, userId, onDepositSuccess }: DepositDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNames, setIsLoadingNames] = useState(false);
  const [names, setNames] = useState<{id: string; name: string;}[]>([]);

  useEffect(() => {
    const getNames = async () => {
      setIsLoadingNames(true);

      try {
        const response = await UserService.getUserNames();
        setNames(response);
      } catch (error) {
        let errorMessage = 'Falha ao conectar. Tente novamente.';
        if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data.message || 'Credenciais inválidas.';
        }
          
        toast.error(errorMessage, { position: 'top-right' });
      } finally {
        setIsLoadingNames(false);
      }
    };

    getNames();
  }, []);

  const form = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: '',
    }
  });

  const onSubmit = async (data: DepositFormData) => {
    setIsLoading(true);
    
    try {
      await TransactionService.onSaveTransaction({
        amount: parseInt(data.amount),
        receiverId: userId,
        type: TypeTransaction.deposit,
      });
      
      toast.success('Depósito criado com sucesso!');
      onDepositSuccess();

      form.reset();
      onOpenChange(false);
    } catch (error) {
      let errorMessage = 'Falha ao conectar. Tente novamente.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || 'Credenciais inválidas.';
      }
         
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    const formattedValue = (Number(numValue) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formattedValue;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <DollarSign className="h-6 w-6 text-success" />
          </div>
          <DialogTitle>Realizar Depósito</DialogTitle>
          <DialogDescription>
            Adicione saldo à sua carteira digital de forma segura
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Depósito</FormLabel>
                  <FormControl>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input
                        {...field}
                        placeholder="0,00"
                        className="pl-10"
                        onChange={(e: any) => {
                          const formatted = formatCurrency(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/*<FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nome do usuário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {names.map((data) => (
                        <SelectItem isLoading={isLoadingNames} key={data.id} value={data.id}>
                          {data.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />*/}

            <Button 
              type="submit" 
              className="w-full btn-success"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Processando...' : 'Confirmar Depósito'}
            </Button>
          </form>
        </Form>
      </DialogContent>

      <Toaster />
    </Dialog>
  );
}
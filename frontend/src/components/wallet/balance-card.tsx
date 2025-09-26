import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/form/button';
import { Card } from '../form/card/card';
import { CardHeader } from '../form/card/card-header';
import { CardTitle } from '../form/card/card-title';
import { CardContent } from '../form/card/card-content';


interface BalanceCardProps {
  balance: number;
  className?: string;
}

export function BalanceCard({ balance, className }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className={`wallet-card ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo Disponível
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="!bg-white !border-none !shadow-none focus:!border-none h-8 w-8 p-0 mr-4"
          >
            {showBalance ? (
              <EyeOff color='gray' className="h-4 w-4" />
            ) : (
              <Eye color='gray' className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="balance-display text-xl">
            {showBalance ? formatCurrency(balance) : '••••••'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
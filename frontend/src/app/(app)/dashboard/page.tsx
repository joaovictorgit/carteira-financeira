import React from 'react';

// This is a simple mock of the Shadcn/ui Card component.
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-xl shadow-md p-6 bg-white border border-gray-200 ${className}`}>
    {children}
  </div>
);

// This is a simple mock of the Shadcn/ui CardHeader component.
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-0 space-y-1 ${className}`}>
    {children}
  </div>
);

// This is a simple mock of the Shadcn/ui CardTitle component.
const CardTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h2 className={`text-2xl font-bold text-foreground ${className}`}>
    {children}
  </h2>
);

// This is a simple mock of the Shadcn/ui CardDescription component.
const CardDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <p className={`text-sm text-gray-500 ${className}`}>
    {children}
  </p>
);

// This is a simple mock of the Shadcn/ui CardContent component.
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-0 pt-6 ${className}`}>
    {children}
  </div>
);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-card flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-card-border shadow-wallet">
          <CardHeader>
            <CardTitle>Painel do Usuário</CardTitle>
            <CardDescription>Bem-vindo à sua carteira digital.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Você está logado e acessou uma página protegida.
                </p>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                (Em uma aplicação real, aqui estariam suas transações e saldo.)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

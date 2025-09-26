'use client'

import { useRouter } from 'next/navigation';

const Button = ({ children, className, ...props }: any) => (
  <button className={`bg-primary text-white font-semibold py-2 px-4 rounded-md shadow transition-all ${className}`} {...props}>
    {children}
  </button>
);

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-card flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
          Bem-vindo ao WalletApp
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Sua solução completa para gerenciar finanças pessoais de forma simples e intuitiva.
        </p>
      </div>
      
      <div className="mt-8">
        <Button 
          onClick={() => router.push('/signin')}
          className="text-lg px-8 py-3 cursor-pointer hover:scale-[1.02]"
        >
          Começar
        </Button>
      </div>
    </div>
  );
}

'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Button = ({ children, className, ...props }: any) => (
  <button className={`bg-primary text-white font-semibold py-2 px-4 rounded-md shadow transition-all ${className}`} {...props}>
    {children}
  </button>
);

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkAuth = () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('auth_expires_at');
    
    if (!token || !expiresAt) {
      setIsAuthenticated(false);
      return;
    }

    const expirationTime = parseInt(expiresAt, 10);
    const currentTime = new Date().getTime();

    if (currentTime > expirationTime) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_expires_at');
      setIsAuthenticated(false);
      console.log('Token de autenticação expirado e removido.');
    } else {
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    checkAuth();
    setIsCheckingAuth(false);

    const interval = setInterval(() => {
      checkAuth();
    }, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const targetRoute = isAuthenticated ? '/dashboard' : '/signin';

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
          onClick={() => router.push(targetRoute)}
          className="text-lg px-8 py-3 cursor-pointer hover:scale-[1.02]"
        >
          Começar
        </Button>
      </div>
    </div>
  );
}

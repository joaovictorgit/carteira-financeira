'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { Card } from '@/components/form/card/card';
import { CardHeader } from '@/components/form/card/card-header';
import { CardTitle } from '@/components/form/card/card-title';
import { CardDescription } from '@/components/form/card/card-description';
import { CardContent } from '@/components/form/card/card-content';
import { Label } from '@/components/form/label';
import { Input } from '@/components/form/input';
import { Button } from '@/components/form/button';
import axios from 'axios';
import { UserService } from '@/services/user/userService';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!(name && email && password)) { 
      toast('Por favor, preencha todos os campos.', { position: 'top-right' });
      return;
    }

    try {
      await UserService.onSignUp({ name, email, password });

      toast.success('Usuário criado com sucesso!', { position: 'top-right' });

      setTimeout(() => {
        router.push('/signin');
      }, 1000);
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

  return (
    <div className="min-h-screen bg-gradient-card flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">WalletApp</h1>
          <p className="text-muted-foreground">Acesse sua carteira digital</p>
        </div>

        <Card className="border-card-border shadow-wallet">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados para criar sua nova conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>


            <div className="mt-6 text-center mb-6">
              <p className="text-sm text-muted-foreground">
                <button className="cursor-pointer" onClick={() => router.push('/signin')}>
                  Retornar para o login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      <Toaster />
    </div>
  );
}

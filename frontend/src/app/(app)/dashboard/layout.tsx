'use client'

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { UserResponse, UserService } from '@/services/user/userService';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentPath = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserResponse | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const response = await UserService.getUserInfo();
      setUser(response);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        router.push('/signin');
      }
      
      toast.error('Falha ao carregar usuário.', { position: 'top-right' });
      setUser(null);
    }
  }, [router]);
  
  useEffect(() => {
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (authToken) {
      setIsAuthenticated(true);
      fetchUser();
    } else {
      setIsAuthenticated(false);
      router.push('/signin');
    }
    setLoading(false);
  }, [router, fetchUser]);

  if (loading || !isAuthenticated || (!user && isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="bg-card border-r border-card-border">
            <Sidebar currentPath={currentPath}/>
          </div>
        </div>
        
        <div className="flex-1 md:pl-64">
          <Header
            title='Carteira Digital' 
            subtitle='Gerencie seu saldo e transações'
            user={user!}
          />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

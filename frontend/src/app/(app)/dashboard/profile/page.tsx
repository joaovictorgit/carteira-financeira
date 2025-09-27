'use client'
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/form/button';
import { Label } from '@/components/form/label';
import { Input } from '@/components/form/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, Edit, Shield, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Card } from '@/components/form/card/card';
import { CardHeader } from '@/components/form/card/card-header';
import { CardTitle } from '@/components/form/card/card-title';
import { CardDescription } from '@/components/form/card/card-description';
import { CardContent } from '@/components/form/card/card-content';
import axios from 'axios';
import { UserService } from '@/services/user/userService';

export default function Profile() {
  const { user, fetchUser } = useAuthUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '' });

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const reloadData = useCallback(async () => {
    setIsLoading(true);
    await fetchUser();
    setIsLoading(false);
  }, [fetchUser]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

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

  const accountStats = {
    totalTransactions: user.balance,
    accountCreatedAt: new Date(user.createdAt ?? new Date()).toLocaleDateString('pt-BR'),
  };

  const handleSave = async () => {
    try {
      await UserService.onUpdateUser({name: editData.name, email: editData.email});

      toast.success('Perfil atualizado', { position: 'top-right' });
      setIsEditing(false);
      reloadData();
    } catch (error) {
      let errorMessage = 'Falha ao reverter a transação. Tente novamente.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || 'Erro desconhecido.';
      }
          
      toast.error(errorMessage, { position: 'top-right' });
      throw error;
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{user?.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  {user?.email}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="!flex !flex-row !justify-center !items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informações da Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Nome Completo</Label>
              {isEditing ? (
                <Input
                  value={editData.name}
                  onChange={(e: any) => setEditData({ ...editData, name: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{user?.name}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              {isEditing ? (
                <Input
                  value={editData.email}
                  onChange={(e: any) => setEditData({ ...editData, email: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="!flex !flex-row !justify-center !items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Saldo Atual</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {user?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium">Data de Criação</p>
                <p className="text-2xl font-bold text-warning">
                  {accountStats.accountCreatedAt}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
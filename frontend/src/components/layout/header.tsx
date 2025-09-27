import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/form/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/menu/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserResponse } from '@/services/user/userService';
import { AuthService } from '@/services/auth/authService';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: UserResponse;
  title: string;
  subtitle?: string;
}

export function Header({ user, title, subtitle }: HeaderProps) {
  const router = useRouter();
  const userInitials = user.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    AuthService.onLogout();
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-card-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full flex items-center justify-center">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <button className='flex items-center cursor-pointer' onClick={() => router.push('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button className='flex items-center' onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
'use client'; 

import { 
  Home, 
  User, 
  History,
  CreditCard,
} from 'lucide-react';

// Mock do Link do Next.js
// Em um ambiente Next.js real, isso seria substituído por: import Link from 'next/link';
const Link = ({ href, children, ...props }: any) => {
  return <a href={href} {...props}>{children}</a>;
};

// Mock da função cn
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

interface SidebarProps {
  className?: string;
  // Recebe o caminho atual do componente pai (DashboardLayout)
  currentPath: string; 
}

export function Sidebar({ className, currentPath }: SidebarProps) {
  // Usa a prop 'currentPath' que é atualizada pelo usePathname no layout
  const pathname = currentPath; 
  
  // Simplificado para itens de navegação de usuário padrão, 
  // removendo a necessidade de isAdmin e do mockData.
  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard', 
      icon: Home
    },
    {
      title: 'Perfil',
      href: '/dashboard/profile',
      icon: User
    }
  ];

  return (
    <div className={cn("pb-12 w-64")}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-6 px-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Wallet
            </h2>
            <p className="text-sm text-muted-foreground">
              Carteira Digital
            </p>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
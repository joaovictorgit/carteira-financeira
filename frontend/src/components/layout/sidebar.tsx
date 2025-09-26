'use client'; 

import { 
  Home, 
  User, 
  CreditCard,
} from 'lucide-react';

const Link = ({ href, children, ...props }: any) => {
  return <a href={href} {...props}>{children}</a>;
};

const usePathname = () => {
  if (typeof window === 'undefined') {
    return '/'; 
  }
  return window.location.pathname;
};

const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export function Sidebar() {
  const pathname = usePathname();
  
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
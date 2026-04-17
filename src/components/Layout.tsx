import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Truck, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  Wrench,
  Sun,
  Moon,
  User,
  Package
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function Layout() {
  const { profile, user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      // Hard refresh as fallback
      window.location.href = '/login';
    }
  };

  const managerNavItems = [
    {
      label: 'Dashboard',
      path: '/manager',
      icon: LayoutDashboard,
    },
    {
      label: 'Fleet List',
      path: '/fleet',
      icon: Truck,
    },
    {
      label: 'Job Cards',
      path: '/jobs',
      icon: ClipboardList,
    },
    {
      label: 'Catalogue',
      path: '/catalogue',
      icon: Package,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: BarChart3,
    },
    {
      label: 'Alerts',
      path: '/alerts',
      icon: Bell,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  const mechanicNavItems = [
    {
      label: 'Job Center',
      path: '/mechanic',
      icon: LayoutDashboard,
    },
    {
      label: 'Active Jobs',
      path: '/jobs',
      icon: ClipboardList,
    },
    {
      label: 'Parts List',
      path: '/catalogue',
      icon: Package,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  const navItems = profile?.role === 'mechanic' ? mechanicNavItems : managerNavItems;

  return (
    <div className="flex h-screen bg-background transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-border flex flex-col z-20 shadow-smooth">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl shadow-premium">
            <Wrench className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase italic">FleetDesk</h1>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-premium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform duration-500 group-hover:scale-125", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                <span className={cn("font-semibold text-sm tracking-wide", isActive ? "text-primary-foreground" : "text-muted-foreground")}>{item.label}</span>
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border space-y-4">
          <Button 
            variant="ghost" 
            size="lg"
            className="w-full justify-start text-muted-foreground hover:bg-secondary rounded-2xl h-12"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
            <span className="font-semibold text-sm">Appearance</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              buttonVariants({ variant: "ghost" }),
              "w-full justify-start px-2 h-16 hover:bg-secondary rounded-2xl border-none cursor-pointer outline-none transition-all flex items-center gap-4"
            )}>
              <div className="flex items-center gap-4 w-full px-2 text-left">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 shadow-inner">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
                    {profile?.role || 'Admin'}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200 dark:border-slate-800">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-600" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-slate-800/[0.05] pointer-events-none" />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

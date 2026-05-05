import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, BookOpen, Calendar, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Pandits', icon: UserCheck, path: '/admin/pandits' },
  { label: 'Puja Types', icon: BookOpen, path: '/admin/pujas' },
  { label: 'Bookings', icon: Calendar, path: '/admin/bookings' },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🙏</span>
            <span className="font-display text-lg font-bold text-foreground">NanaConnect</span>
          </Link>
          <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full mt-2 inline-flex items-center gap-1">
            <Shield className="h-3 w-3" /> Admin
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'
              }`}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-sm">👑</div>
            <div>
              <p className="text-sm font-medium text-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🙏</span>
            <span className="font-display font-bold text-foreground">NanaConnect</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-auto">{children}</div>
        <nav className="md:hidden flex border-t border-border bg-card">
          {navItems.slice(0, 4).map(item => (
            <Link key={item.path} to={item.path}
              className={`flex-1 flex flex-col items-center py-3 text-xs ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'}`}>
              <item.icon className="h-5 w-5 mb-1" />{item.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default AdminLayout;

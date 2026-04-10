import { Shield, LayoutDashboard, AlertTriangle, Mail, GraduationCap, LogOut, ChevronRight, Gauge, Star, Trophy, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: User;
  onLogout: () => void;
}

const Sidebar = ({ activeView, setActiveView, currentUser, onLogout }: SidebarProps) => {
  return (
    <div className="w-64 bg-sidebar h-screen flex flex-col fixed left-0 top-0 border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-sidebar-foreground">SEAST</h1>
            <p className="text-xs text-muted-foreground font-mono">Security Sim Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {currentUser.role === 'admin' ? (
          <>
            <div className="text-xs uppercase text-muted-foreground font-semibold mb-3 mt-2 px-4 tracking-wider">
              Admin Controls
            </div>
            <NavItem
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
              active={activeView === 'dashboard'}
              onClick={() => setActiveView('dashboard')}
            />
            <NavItem
              icon={<Gauge className="w-5 h-5" />}
              label="Risk Engine"
              active={activeView === 'risk-engine'}
              onClick={() => setActiveView('risk-engine')}
            />
            <NavItem
              icon={<Star className="w-5 h-5" />}
              label="Gamification"
              active={activeView === 'admin-gamification'}
              onClick={() => setActiveView('admin-gamification')}
            />
            <NavItem
              icon={<AlertTriangle className="w-5 h-5" />}
              label="Launch Attack"
              active={activeView === 'create-campaign'}
              onClick={() => setActiveView('create-campaign')}
              variant="danger"
            />
          </>
        ) : (
          <>
            <div className="text-xs uppercase text-muted-foreground font-semibold mb-3 mt-2 px-4 tracking-wider">
              Employee Zone
            </div>
            <NavItem
              icon={<Mail className="w-5 h-5" />}
              label="Work Email"
              active={activeView === 'inbox'}
              onClick={() => setActiveView('inbox')}
            />
            <NavItem
              icon={<GraduationCap className="w-5 h-5" />}
              label="Training Modules"
              active={activeView === 'training'}
              onClick={() => setActiveView('training')}
            />
            <NavItem
              icon={<Gauge className="w-5 h-5" />}
              label="My Risk Score"
              active={activeView === 'risk-score'}
              onClick={() => setActiveView('risk-score')}
            />
            <NavItem
              icon={<Star className="w-5 h-5" />}
              label="My Rewards"
              active={activeView === 'gamification'}
              onClick={() => setActiveView('gamification')}
            />
            <NavItem
              icon={<Trophy className="w-5 h-5" />}
              label="Leaderboard"
              active={activeView === 'leaderboard'}
              onClick={() => setActiveView('leaderboard')}
            />
          </>
        )}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50 mb-3">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
              currentUser.role === 'admin' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
            )}
          >
            {currentUser.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const NavItem = ({ icon, label, active, onClick, variant = 'default' }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      'nav-item w-full',
      active && 'active',
      variant === 'danger' && active && 'bg-destructive/20 text-destructive'
    )}
  >
    {icon}
    <span className="font-medium flex-1 text-left">{label}</span>
    {active && <ChevronRight className="w-4 h-4" />}
  </button>
);

export default Sidebar;

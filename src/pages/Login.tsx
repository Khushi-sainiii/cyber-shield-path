import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoginProps {
  onLogin: (user: { name: string; email: string; role: 'admin' | 'employee' }) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Mock authentication
    await new Promise((r) => setTimeout(r, 800));

    if (email === 'admin@seast.com' && password === 'admin123') {
      onLogin({ name: 'Admin', email: 'admin@seast.com', role: 'admin' });
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Try admin@seast.com / admin123');
    }
    setIsLoading(false);
  };

  const handleUserLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Mock authentication
    await new Promise((r) => setTimeout(r, 800));

    if (email && password) {
      const name = email.split('@')[0];
      onLogin({ name, email, role: 'employee' });
      navigate('/dashboard');
    } else {
      setError('Please enter valid credentials');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="login-card w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center cyber-glow">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-foreground">SEAST</h1>
            <p className="text-xs text-muted-foreground font-mono">Security Awareness Training</p>
          </div>
        </div>

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger value="user" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-4 h-4 mr-2" />
              Employee
            </TabsTrigger>
            <TabsTrigger value="admin" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="mt-6">
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">Work Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="user-email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    className="pl-10 input-cyber"
                    defaultValue="jatin@company.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="user-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 input-cyber"
                    defaultValue="password"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In as Employee'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="admin" className="mt-6">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    placeholder="admin@seast.com"
                    className="pl-10 input-cyber"
                    defaultValue="admin@seast.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 input-cyber"
                    defaultValue="admin123"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Sign In as Admin'}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Demo: admin@seast.com / admin123
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;

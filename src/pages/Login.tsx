import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertTriangle, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email'));
    const password = String(fd.get('password'));
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    toast.success('Signed in');
    navigate('/dashboard');
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email'));
    const password = String(fd.get('password'));
    const display_name = String(fd.get('name') || email.split('@')[0]);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name },
      },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    toast.success('Account created — check your email to confirm', { duration: 6000 });
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError('');
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (result.error) {
      setError(result.error.message ?? 'Google sign-in failed');
      setBusy(false);
      return;
    }
    if (!result.redirected) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="login-card w-full max-w-md relative z-10 animate-slide-up">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center cyber-glow">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-foreground">SEAST</h1>
            <p className="text-xs text-muted-foreground font-mono">Security Awareness Training</p>
          </div>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6 space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="signin-email" name="email" type="email" required className="pl-10 input-cyber" placeholder="you@company.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="signin-password" name="password" type="password" required className="pl-10 input-cyber" placeholder="••••••••" />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-6 space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Display name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="signup-name" name="name" type="text" required className="pl-10 input-cyber" placeholder="Jane Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Work email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="signup-email" name="email" type="email" required className="pl-10 input-cyber" placeholder="you@company.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="signup-password" name="password" type="password" required minLength={8} className="pl-10 input-cyber" placeholder="At least 8 characters" />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? 'Creating…' : 'Create account'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You'll receive a confirmation email before you can sign in.
              </p>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          Continue with Google
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-6">
          <Link to="/" className="hover:text-foreground">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

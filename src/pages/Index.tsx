import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Users, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center cyber-glow">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-wider text-foreground">SEAST</span>
          </div>
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            className="gap-2 border-primary/30 hover:bg-primary/10"
          >
            <Lock className="w-4 h-4" />
            Sign In
          </Button>
        </header>

        {/* Hero */}
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Security Awareness Training Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Test Your Team's
              <span className="block text-primary">Cyber Defense</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              SEAST (Simulated Attack Security Training) helps organizations identify vulnerabilities through
              realistic phishing simulations and comprehensive security training modules.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-lg px-8"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 border-border hover:bg-secondary"
              >
                <BookOpen className="w-5 h-5" />
                View Training Modules
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <FeatureCard
                icon={<AlertTriangle className="w-6 h-6 text-destructive" />}
                title="Simulated Attacks"
                description="Launch realistic phishing, baiting, smishing, and spear phishing campaigns to test employee awareness."
              />
              <FeatureCard
                icon={<BookOpen className="w-6 h-6 text-primary" />}
                title="Interactive Training"
                description="Comprehensive modules covering social engineering tactics with real-world examples and quizzes."
              />
              <FeatureCard
                icon={<Users className="w-6 h-6 text-accent" />}
                title="Live Monitoring"
                description="Track campaign performance in real-time with vulnerability scores and click-through rates."
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm border-t border-border">
          <p>SEAST - Security Awareness Training Platform</p>
          <p className="mt-1">For educational and authorized testing purposes only.</p>
        </footer>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="cyber-card hover:border-primary/30 transition-colors">
    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">{icon}</div>
    <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default Index;

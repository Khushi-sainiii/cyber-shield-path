import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldX, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompromisedScreenProps {
  message: string;
  onGoToTraining: () => void;
}

const CompromisedScreen = ({ message, onGoToTraining }: CompromisedScreenProps) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 compromised-overlay flex flex-col items-center justify-center p-8 z-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-6xl opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            ⚠️
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Icon */}
        <div className="mb-6 inline-flex">
          <div className="w-24 h-24 rounded-full bg-destructive-foreground/10 flex items-center justify-center danger-glow animate-pulse">
            <ShieldX className="w-12 h-12 text-destructive-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-destructive-foreground mb-4 tracking-wider">
          COMPROMISED!
        </h1>

        {/* Warning icon row */}
        <div className="flex justify-center gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <AlertTriangle
              key={i}
              className="w-6 h-6 text-destructive-foreground/80 animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        {/* Message */}
        <div className="bg-destructive-foreground/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-destructive-foreground/20">
          <p className="text-xl text-destructive-foreground font-medium mb-2">{message}</p>
          <p className="text-destructive-foreground/80">
            In a real attack, your credentials would now be in the hands of cybercriminals. 
            They could access your accounts, steal data, or launch further attacks.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button
            onClick={onGoToTraining}
            size="lg"
            className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90 gap-2 text-lg px-8"
          >
            <BookOpen className="w-5 h-5" />
            Start Security Training
            <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-destructive-foreground/60 text-sm">
            {countdown > 0 ? (
              <>Auto-redirecting to training in {countdown}s...</>
            ) : (
              <>Ready to learn how to stay safe</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompromisedScreen;

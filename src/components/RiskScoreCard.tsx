import { useState, useEffect } from 'react';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { api, MOCK_DB } from '@/lib/mockData';

const RiskScoreCard = () => {
  const [score, setScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);

  useEffect(() => {
    const calcScore = () => {
      // Calculate from mock data: opened=+5, clicked=+20, compromised(credentials)=+40
      let total = 0;
      MOCK_DB.emails.forEach((email) => {
        if (email.status === 'sent') total += 5; // opened
        if (email.status === 'clicked') total += 20;
        if (email.status === 'compromised') total += 40;
      });
      total = Math.min(100, Math.max(0, total));
      setPreviousScore(score);
      setScore(total);
    };
    calcScore();
    const interval = setInterval(calcScore, 2000);
    return () => clearInterval(interval);
  }, []);

  const getRiskLevel = (s: number) => {
    if (s <= 30) return { label: 'Low Risk', color: 'text-accent', bg: 'bg-accent/20', border: 'border-accent/30' };
    if (s <= 70) return { label: 'Medium Risk', color: 'text-warning', bg: 'bg-warning/20', border: 'border-warning/30' };
    return { label: 'High Risk', color: 'text-destructive', bg: 'bg-destructive/20', border: 'border-destructive/30' };
  };

  const risk = getRiskLevel(score);
  const trend = score > previousScore ? 'up' : score < previousScore ? 'down' : 'neutral';

  return (
    <div className={`cyber-card ${risk.border} border`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${risk.bg}`}>
            <Shield className={`w-6 h-6 ${risk.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Your Risk Score</h3>
            <p className="text-sm text-muted-foreground">Based on simulation performance</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className={`text-3xl font-bold ${risk.color}`}>{score}</span>
            <span className="text-lg text-muted-foreground">/100</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${risk.color}`}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {risk.label}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Risk Level</span>
          <span>{score}%</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              score <= 30 ? 'bg-accent' : score <= 70 ? 'bg-warning' : 'bg-destructive'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Low (0-30)</span>
          <span>Medium (31-70)</span>
          <span>High (71-100)</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <ScoreBreakdown label="Email Opened" points="+5" icon="📧" />
        <ScoreBreakdown label="Link Clicked" points="+20" icon="🔗" />
        <ScoreBreakdown label="Credentials" points="+40" icon="🔑" />
      </div>
    </div>
  );
};

const ScoreBreakdown = ({ label, points, icon }: { label: string; points: string; icon: string }) => (
  <div className="bg-secondary/30 rounded-lg p-3 text-center">
    <span className="text-lg">{icon}</span>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
    <p className="text-sm font-bold text-foreground">{points}</p>
  </div>
);

export default RiskScoreCard;

import { useEffect, useState } from 'react';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const RiskScoreCard = () => {
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('low');

  const fetchScore = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('risk_scores')
      .select('score, risk_level')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setPreviousScore((p) => (p !== data.score ? score : p));
      setScore(data.score);
      setLevel(data.risk_level as 'low' | 'medium' | 'high');
    }
  };

  useEffect(() => {
    fetchScore();
    if (!user) return;
    const channel = supabase
      .channel('risk_scores_self')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'risk_scores', filter: `user_id=eq.${user.id}` }, () => fetchScore())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const palette = {
    low: { color: 'text-accent', bg: 'bg-accent/20', border: 'border-accent/30', bar: 'bg-accent', label: 'Low Risk' },
    medium: { color: 'text-warning', bg: 'bg-warning/20', border: 'border-warning/30', bar: 'bg-warning', label: 'Medium Risk' },
    high: { color: 'text-destructive', bg: 'bg-destructive/20', border: 'border-destructive/30', bar: 'bg-destructive', label: 'High Risk' },
  }[level];

  const trend = score > previousScore ? 'up' : score < previousScore ? 'down' : 'neutral';

  return (
    <div className={`cyber-card ${palette.border} border`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${palette.bg}`}>
            <Shield className={`w-6 h-6 ${palette.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Your Risk Score</h3>
            <p className="text-sm text-muted-foreground">Based on simulation performance</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className={`text-3xl font-bold ${palette.color}`}>{score}</span>
            <span className="text-lg text-muted-foreground">/100</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${palette.color}`}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {palette.label}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Risk Level</span>
          <span>{score}%</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div className={`h-full rounded-full transition-all duration-1000 ${palette.bar}`} style={{ width: `${score}%` }} />
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

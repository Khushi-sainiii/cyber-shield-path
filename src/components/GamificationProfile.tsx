import { useEffect, useState } from 'react';
import { Star, Award, TrendingUp, Zap, Shield, BookOpen, Target, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BadgeRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_threshold: number;
}

interface PointEntry {
  action_type: string;
  description: string | null;
  points: number;
  created_at: string;
}

const POINT_RULES = [
  { action: 'Report phishing email', points: '+20', icon: <Shield className="w-4 h-4" />, color: 'text-accent' },
  { action: 'Ignore suspicious email', points: '+10', icon: <Target className="w-4 h-4" />, color: 'text-accent' },
  { action: 'Complete training module', points: '+15', icon: <BookOpen className="w-4 h-4" />, color: 'text-accent' },
  { action: 'Pass quiz (>80%)', points: '+25', icon: <Star className="w-4 h-4" />, color: 'text-accent' },
  { action: 'Click phishing link', points: '-10', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-destructive' },
  { action: 'Enter credentials', points: '-20', icon: <Zap className="w-4 h-4" />, color: 'text-destructive' },
];

const GamificationProfile = () => {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState<PointEntry[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeRow[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [rank, setRank] = useState<number | null>(null);

  const load = async () => {
    if (!user) return;
    const [pointsRes, historyRes, badgesRes, earnedRes, leaderRes] = await Promise.all([
      supabase.from('user_points').select('total_points').eq('user_id', user.id).maybeSingle(),
      supabase.from('point_history').select('action_type, description, points, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('badges').select('*'),
      supabase.from('user_badges').select('badge_id').eq('user_id', user.id),
      supabase.from('user_points').select('user_id, total_points').order('total_points', { ascending: false }),
    ]);
    setTotalPoints(pointsRes.data?.total_points ?? 0);
    setHistory(historyRes.data ?? []);
    setAllBadges((badgesRes.data ?? []) as BadgeRow[]);
    setEarnedBadgeIds(new Set((earnedRes.data ?? []).map((b) => b.badge_id)));
    const idx = (leaderRes.data ?? []).findIndex((u) => u.user_id === user.id);
    setRank(idx >= 0 ? idx + 1 : null);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel('points_self')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_points', filter: `user_id=eq.${user.id}` }, () => load())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'point_history', filter: `user_id=eq.${user.id}` }, (payload) => {
        const p = payload.new as PointEntry;
        if (p.points > 0) {
          toast.success(`+${p.points} points`, { description: p.description ?? p.action_type });
        }
        load();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_badges', filter: `user_id=eq.${user.id}` }, () => {
        toast.success('🎉 You earned a new badge!');
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const earnedBadges = allBadges.filter((b) => earnedBadgeIds.has(b.id));
  const inProgressBadges = allBadges.filter((b) => !earnedBadgeIds.has(b.id));

  // Compute progress for in-progress badges from point_history
  const progressFor = (badge: BadgeRow): number => {
    if (badge.criteria_type === 'reports') {
      return history.filter((h) => h.action_type === 'reported_phishing').length;
    }
    if (badge.criteria_type === 'training_completed') {
      return history.filter((h) => h.action_type === 'training_completed').length;
    }
    if (badge.criteria_type === 'low_risk_days') {
      return Math.min(badge.criteria_threshold, 0);
    }
    return 0;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Star className="w-6 h-6 text-warning" />
          Gamification Profile
        </h2>
        <p className="text-muted-foreground mt-1">Track your points, badges, and security awareness journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Points</p>
              <div className="flex items-baseline gap-1 mt-2">
                <h3 className="text-4xl font-bold text-warning">{totalPoints}</h3>
                <span className="text-lg text-muted-foreground">pts</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-warning/10">
              <Star className="w-7 h-7 text-warning" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Badges Earned</p>
              <div className="flex items-baseline gap-1 mt-2">
                <h3 className="text-4xl font-bold text-primary">{earnedBadges.length}</h3>
                <span className="text-lg text-muted-foreground">/ {allBadges.length}</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-primary/10">
              <Award className="w-7 h-7 text-primary" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Leaderboard Rank</p>
              <div className="flex items-baseline gap-1 mt-2">
                <h3 className="text-4xl font-bold text-accent">{rank ? `#${rank}` : '—'}</h3>
              </div>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-accent/10">
              <TrendingUp className="w-7 h-7 text-accent" />
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-warning" />
          Earned Badges
        </h3>
        {earnedBadges.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No badges earned yet. Keep up the good work!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-4 p-4 rounded-xl bg-warning/5 border border-warning/20">
                <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center text-3xl flex-shrink-0">
                  {badge.icon}
                </div>
                <div>
                  <p className="font-bold text-foreground">{badge.name}</p>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                  <p className="text-xs text-warning mt-1">✓ Earned</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Badge Progress
        </h3>
        {inProgressBadges.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">All badges earned. Amazing!</p>
        ) : (
          <div className="space-y-4">
            {inProgressBadges.map((badge) => {
              const progress = progressFor(badge);
              const pct = Math.min(100, Math.round((progress / badge.criteria_threshold) * 100));
              return (
                <div key={badge.id} className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0 opacity-60">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-foreground">{badge.name}</p>
                        <span className="text-sm text-muted-foreground">{progress}/{badge.criteria_threshold}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          How to Earn Points
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {POINT_RULES.map((rule) => (
            <div key={rule.action} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
              <div className={`${rule.color}`}>{rule.icon}</div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{rule.action}</p>
              </div>
              <span className={`font-bold text-sm ${rule.color}`}>{rule.points}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
          📊 Recent Point Activity
        </h3>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-6 text-sm">No activity yet — start by reporting a phishing email or completing a training module.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${entry.points > 0 ? 'text-accent' : 'text-destructive'}`}>
                    {entry.points > 0 ? '+' : ''}{entry.points}
                  </span>
                  <span className="text-sm text-foreground">{entry.description ?? entry.action_type}</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamificationProfile;

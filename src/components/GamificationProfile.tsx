import { useState, useEffect } from 'react';
import { Star, Award, TrendingUp, Zap, Shield, BookOpen, Target, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Mock gamification data for demo
const MOCK_POINTS = {
  total: 145,
  history: [
    { action: 'Reported phishing email', points: 20, date: '2026-04-09' },
    { action: 'Completed training: Phishing', points: 15, date: '2026-04-08' },
    { action: 'Passed quiz with 90%', points: 25, date: '2026-04-08' },
    { action: 'Ignored suspicious email', points: 10, date: '2026-04-07' },
    { action: 'Reported phishing email', points: 20, date: '2026-04-06' },
    { action: 'Completed training: Smishing', points: 15, date: '2026-04-05' },
    { action: 'Clicked phishing link', points: -10, date: '2026-04-04' },
    { action: 'Reported phishing email', points: 20, date: '2026-04-03' },
    { action: 'Completed training: Baiting', points: 15, date: '2026-04-02' },
    { action: 'Ignored suspicious email', points: 10, date: '2026-04-01' },
    { action: 'Entered credentials', points: -20, date: '2026-03-30' },
    { action: 'Reported phishing email', points: 20, date: '2026-03-28' },
    { action: 'Passed quiz with 85%', points: 25, date: '2026-03-27' },
  ],
};

const ALL_BADGES = [
  { id: '1', name: 'Phishing Defender', description: 'Report 5 phishing emails', icon: '🛡️', criteria: 'reports', threshold: 5, progress: 4, earned: false },
  { id: '2', name: 'Security Champion', description: 'Maintain Low Risk for 7 days', icon: '🏆', criteria: 'low_risk_days', threshold: 7, progress: 7, earned: true },
  { id: '3', name: 'Quick Learner', description: 'Complete 3 training modules', icon: '📚', criteria: 'training_completed', threshold: 3, progress: 3, earned: true },
  { id: '4', name: 'Zero Trust Hero', description: 'No clicks on phishing links in a campaign', icon: '🦸', criteria: 'zero_clicks', threshold: 1, progress: 0, earned: false },
];

const POINT_RULES = [
  { action: 'Report phishing email', points: '+20', icon: <Shield className="w-4 h-4" />, color: 'text-accent' },
  { action: 'Ignore suspicious email', points: '+10', icon: <Target className="w-4 h-4" />, color: 'text-accent' },
  { action: 'Complete training module', points: '+15', icon: <BookOpen className="w-4 h-4" />, color: 'text-accent' },
  { action: 'Pass quiz (>80%)', points: '+25', icon: <Star className="w-4 h-4" />, color: 'text-accent' },
  { action: 'Click phishing link', points: '-10', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-destructive' },
  { action: 'Enter credentials', points: '-20', icon: <Zap className="w-4 h-4" />, color: 'text-destructive' },
];

const GamificationProfile = () => {
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);

  useEffect(() => {
    // Simulate badge earned notification
    const timer = setTimeout(() => {
      toast.success("🎉 You earned 'Security Champion' badge!", {
        description: 'Maintained Low Risk for 7 consecutive days',
        duration: 5000,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const earnedBadges = ALL_BADGES.filter((b) => b.earned);
  const inProgressBadges = ALL_BADGES.filter((b) => !b.earned);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Star className="w-6 h-6 text-warning" />
          Gamification Profile
        </h2>
        <p className="text-muted-foreground mt-1">Track your points, badges, and security awareness journey</p>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card col-span-1">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Points</p>
              <div className="flex items-baseline gap-1 mt-2">
                <h3 className="text-4xl font-bold text-warning">{MOCK_POINTS.total}</h3>
                <span className="text-lg text-muted-foreground">pts</span>
              </div>
              <p className="text-xs text-accent mt-1">↑ +35 this week</p>
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
                <span className="text-lg text-muted-foreground">/ {ALL_BADGES.length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{inProgressBadges.length} in progress</p>
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
                <h3 className="text-4xl font-bold text-accent">#3</h3>
              </div>
              <p className="text-xs text-accent mt-1">↑ 2 positions this week</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-accent/10">
              <TrendingUp className="w-7 h-7 text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Earned Badges */}
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

      {/* Badge Progress */}
      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Badge Progress
        </h3>
        <div className="space-y-4">
          {inProgressBadges.map((badge) => {
            const pct = Math.min(100, Math.round((badge.progress / badge.threshold) * 100));
            return (
              <div key={badge.id} className="p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0 opacity-60">
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium text-foreground">{badge.name}</p>
                      <span className="text-sm text-muted-foreground">{badge.progress}/{badge.threshold}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points Rules */}
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

      {/* Recent Activity */}
      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
          📊 Recent Point Activity
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {MOCK_POINTS.history.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${entry.points > 0 ? 'text-accent' : 'text-destructive'}`}>
                  {entry.points > 0 ? '+' : ''}{entry.points}
                </span>
                <span className="text-sm text-foreground">{entry.action}</span>
              </div>
              <span className="text-xs text-muted-foreground">{entry.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamificationProfile;

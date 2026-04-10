import { Star, Award, Users, TrendingUp, Activity } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

const engagementTrend = [
  { week: 'W1', activeUsers: 12, badgesEarned: 3, avgPoints: 45 },
  { week: 'W2', activeUsers: 18, badgesEarned: 7, avgPoints: 68 },
  { week: 'W3', activeUsers: 25, badgesEarned: 12, avgPoints: 85 },
  { week: 'W4', activeUsers: 30, badgesEarned: 18, avgPoints: 102 },
  { week: 'W5', activeUsers: 35, badgesEarned: 25, avgPoints: 120 },
  { week: 'W6', activeUsers: 42, badgesEarned: 32, avgPoints: 135 },
];

const badgeDistribution = [
  { name: 'Phishing Defender', count: 12, color: 'hsl(var(--primary))' },
  { name: 'Security Champion', count: 8, color: 'hsl(var(--warning))' },
  { name: 'Quick Learner', count: 15, color: 'hsl(var(--accent))' },
  { name: 'Zero Trust Hero', count: 5, color: 'hsl(var(--destructive))' },
];

const pointActions = [
  { action: 'Phishing Reports', count: 89, points: 1780 },
  { action: 'Training Completed', count: 45, points: 675 },
  { action: 'Quizzes Passed', count: 32, points: 800 },
  { action: 'Emails Ignored', count: 67, points: 670 },
  { action: 'Links Clicked', count: 23, points: -230 },
  { action: 'Credentials Entered', count: 8, points: -160 },
];

const AdminGamification = () => {
  const totalPoints = pointActions.reduce((sum, a) => sum + Math.abs(a.points), 0);
  const totalBadges = badgeDistribution.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Star className="w-6 h-6 text-warning" />
          Gamification Summary
        </h2>
        <p className="text-muted-foreground mt-1">Organization-wide engagement and gamification metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Active Users" value={42} suffix="/ 50" icon={<Users className="w-5 h-5" />} color="primary" />
        <SummaryCard title="Total Badges Earned" value={totalBadges} icon={<Award className="w-5 h-5" />} color="warning" />
        <SummaryCard title="Avg Points/User" value={135} icon={<Star className="w-5 h-5" />} color="accent" />
        <SummaryCard title="Engagement Rate" value="84" suffix="%" icon={<TrendingUp className="w-5 h-5" />} color="primary" />
      </div>

      {/* Engagement Alert */}
      <div className="cyber-card bg-accent/5 border border-accent/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="font-medium text-accent">Engagement Growing</p>
          <p className="text-sm text-muted-foreground">Active user count increased by 20% this week. Gamification is driving participation!</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Growth */}
        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">User Engagement Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={engagementTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
              <Area type="monotone" dataKey="activeUsers" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Active Users" />
              <Area type="monotone" dataKey="badgesEarned" stroke="hsl(var(--warning))" fill="hsl(var(--warning) / 0.1)" name="Badges Earned" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Badge Distribution */}
        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Badge Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={badgeDistribution} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="count" label={({ name, value }) => `${name}: ${value}`}>
                {badgeDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {badgeDistribution.map((b) => (
              <div key={b.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                <span className="text-muted-foreground">{b.name} ({b.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Point Actions Breakdown */}
      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground">Points Breakdown by Action</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={pointActions} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <YAxis type="category" dataKey="action" width={130} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
            <Bar dataKey="count" name="Occurrences" radius={[0, 4, 4, 0]}>
              {pointActions.map((entry, idx) => (
                <Cell key={idx} fill={entry.points >= 0 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers */}
      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
          🏅 Top Performers This Month
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { rank: 1, name: 'Sneha Verma', dept: 'Marketing', points: 285, badges: 4, icon: '🥇' },
            { rank: 2, name: 'Neha Singh', dept: 'IT', points: 220, badges: 3, icon: '🥈' },
            { rank: 3, name: 'Jatin Sharma', dept: 'Finance', points: 145, badges: 2, icon: '🥉' },
          ].map((user) => (
            <div key={user.rank} className="p-4 rounded-xl bg-secondary/20 border border-border text-center">
              <span className="text-3xl">{user.icon}</span>
              <p className="font-bold text-foreground mt-2">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.dept}</p>
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="text-warning font-bold">{user.points} pts</span>
                <span className="text-primary text-sm flex items-center gap-1"><Award className="w-3 h-3" />{user.badges}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, suffix, icon, color }: {
  title: string; value: number | string; suffix?: string; icon: React.ReactNode;
  color: 'primary' | 'warning' | 'accent';
}) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    warning: 'text-warning bg-warning/10',
    accent: 'text-accent bg-accent/10',
  };
  return (
    <div className="stat-card">
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default AdminGamification;

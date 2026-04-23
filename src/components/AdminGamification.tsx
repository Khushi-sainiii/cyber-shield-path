import { useEffect, useState } from 'react';
import { Star, Award, Users, TrendingUp, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface BadgeBucket {
  name: string;
  count: number;
  color: string;
}

interface ActionBucket {
  action: string;
  count: number;
  points: number;
}

const BADGE_COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

const ACTION_LABEL: Record<string, string> = {
  reported_phishing: 'Phishing Reports',
  training_completed: 'Training Completed',
  quiz_passed: 'Quizzes Passed',
  ignored_email: 'Emails Ignored',
  phishing_clicked: 'Links Clicked',
  credentials_entered: 'Credentials Entered',
};

const AdminGamification = () => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [avgPoints, setAvgPoints] = useState(0);
  const [badgeBuckets, setBadgeBuckets] = useState<BadgeBucket[]>([]);
  const [actionBuckets, setActionBuckets] = useState<ActionBucket[]>([]);
  const [topPerformers, setTopPerformers] = useState<Array<{ name: string; dept: string; points: number; badges: number }>>([]);

  const load = async () => {
    const [{ data: points }, { data: badges }, { data: history }, { data: profs }, { data: depts }] = await Promise.all([
      supabase.from('user_points').select('user_id, total_points'),
      supabase.from('badges').select('id, name'),
      supabase.from('point_history').select('user_id, action_type, points'),
      supabase.from('profiles').select('user_id, display_name, email, department_id'),
      supabase.from('departments').select('id, name'),
    ]);

    const { data: userBadges } = await supabase.from('user_badges').select('user_id, badge_id');

    setTotalUsers((profs ?? []).length);
    setActiveUsers((points ?? []).filter((p) => p.total_points > 0).length);
    setAvgPoints(points && points.length > 0 ? Math.round(points.reduce((s, p) => s + p.total_points, 0) / points.length) : 0);

    // Badge buckets
    const badgeCount = new Map<string, number>();
    (userBadges ?? []).forEach((ub) => badgeCount.set(ub.badge_id, (badgeCount.get(ub.badge_id) ?? 0) + 1));
    setBadgeBuckets(
      (badges ?? []).map((b, i) => ({
        name: b.name,
        count: badgeCount.get(b.id) ?? 0,
        color: BADGE_COLORS[i % BADGE_COLORS.length],
      }))
    );

    // Action buckets
    const actionMap = new Map<string, { count: number; points: number }>();
    (history ?? []).forEach((h) => {
      const v = actionMap.get(h.action_type) ?? { count: 0, points: 0 };
      v.count += 1;
      v.points += h.points;
      actionMap.set(h.action_type, v);
    });
    setActionBuckets(
      Array.from(actionMap.entries())
        .map(([k, v]) => ({ action: ACTION_LABEL[k] ?? k, count: v.count, points: v.points }))
        .sort((a, b) => b.count - a.count)
    );

    // Top performers
    const profById = new Map((profs ?? []).map((p) => [p.user_id, p]));
    const deptById = new Map((depts ?? []).map((d) => [d.id, d.name]));
    const top = (points ?? [])
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, 3)
      .map((p) => {
        const prof = profById.get(p.user_id);
        return {
          name: prof?.display_name ?? prof?.email?.split('@')[0] ?? 'Unknown',
          dept: prof?.department_id ? (deptById.get(prof.department_id) ?? '—') : '—',
          points: p.total_points,
          badges: badgeCount.get(p.user_id) ?? 0,
        };
      });
    setTopPerformers(top);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('admin_gam')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_points' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_badges' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'point_history' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalBadges = badgeBuckets.reduce((s, b) => s + b.count, 0);
  const engagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Star className="w-6 h-6 text-warning" />
          Gamification Summary
        </h2>
        <p className="text-muted-foreground mt-1">Live organization-wide engagement metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Active Users" value={activeUsers} suffix={`/ ${totalUsers}`} icon={<Users className="w-5 h-5" />} color="primary" />
        <SummaryCard title="Total Badges Earned" value={totalBadges} icon={<Award className="w-5 h-5" />} color="warning" />
        <SummaryCard title="Avg Points/User" value={avgPoints} icon={<Star className="w-5 h-5" />} color="accent" />
        <SummaryCard title="Engagement Rate" value={engagementRate} suffix="%" icon={<TrendingUp className="w-5 h-5" />} color="primary" />
      </div>

      <div className="cyber-card bg-accent/5 border border-accent/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="font-medium text-accent">Live Metrics</p>
          <p className="text-sm text-muted-foreground">Updates in real time as users earn points and badges.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Badge Distribution</h3>
          {totalBadges === 0 ? (
            <p className="text-muted-foreground text-center py-12 text-sm">No badges earned yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={badgeBuckets.filter((b) => b.count > 0)} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="count" label={({ name, value }) => `${name}: ${value}`}>
                  {badgeBuckets.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Points Breakdown by Action</h3>
          {actionBuckets.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 text-sm">No activity yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={actionBuckets} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis type="category" dataKey="action" width={130} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="count" name="Occurrences" radius={[0, 4, 4, 0]}>
                  {actionBuckets.map((entry, idx) => (
                    <Cell key={idx} fill={entry.points >= 0 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">🏅 Top Performers</h3>
        {topPerformers.length === 0 ? (
          <p className="text-muted-foreground text-center py-6 text-sm">No participants yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topPerformers.map((u, idx) => (
              <div key={`${u.name}-${idx}`} className="p-4 rounded-xl bg-secondary/20 border border-border text-center">
                <span className="text-3xl">{['🥇', '🥈', '🥉'][idx]}</span>
                <p className="font-bold text-foreground mt-2">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.dept}</p>
                <div className="mt-2 flex items-center justify-center gap-3">
                  <span className="text-warning font-bold">{u.points} pts</span>
                  <span className="text-primary text-sm flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {u.badges}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, suffix, icon, color }: { title: string; value: number | string; suffix?: string; icon: React.ReactNode; color: 'primary' | 'warning' | 'accent' }) => {
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

import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface UserRiskRow {
  user_id: string;
  name: string;
  email: string;
  department: string;
  score: number;
  level: 'low' | 'medium' | 'high';
}

const COLORS = {
  low: 'hsl(var(--accent))',
  medium: 'hsl(var(--warning))',
  high: 'hsl(var(--destructive))',
};

const AdminRiskDashboard = () => {
  const [users, setUsers] = useState<UserRiskRow[]>([]);

  const load = async () => {
    const [{ data: scores }, { data: profs }, { data: depts }] = await Promise.all([
      supabase.from('risk_scores').select('user_id, score, risk_level'),
      supabase.from('profiles').select('user_id, display_name, email, department_id'),
      supabase.from('departments').select('id, name'),
    ]);
    const profById = new Map((profs ?? []).map((p) => [p.user_id, p]));
    const deptById = new Map((depts ?? []).map((d) => [d.id, d.name]));
    const built: UserRiskRow[] = (scores ?? []).map((s) => {
      const p = profById.get(s.user_id);
      return {
        user_id: s.user_id,
        name: p?.display_name ?? p?.email?.split('@')[0] ?? 'Unknown',
        email: p?.email ?? '',
        department: p?.department_id ? (deptById.get(p.department_id) ?? '—') : '—',
        score: s.score,
        level: s.risk_level as 'low' | 'medium' | 'high',
      };
    });
    setUsers(built);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('admin_risk')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'risk_scores' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const distribution = [
    { name: 'Low Risk', value: users.filter((u) => u.level === 'low').length, color: COLORS.low },
    { name: 'Medium Risk', value: users.filter((u) => u.level === 'medium').length, color: COLORS.medium },
    { name: 'High Risk', value: users.filter((u) => u.level === 'high').length, color: COLORS.high },
  ];

  const avgScore = users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.score, 0) / users.length) : 0;
  const highRiskUsers = users.filter((u) => u.level === 'high').sort((a, b) => b.score - a.score);

  const departmentRisk = Object.entries(
    users.reduce((acc, u) => {
      if (u.department === '—') return acc;
      if (!acc[u.department]) acc[u.department] = { total: 0, count: 0 };
      acc[u.department].total += u.score;
      acc[u.department].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([dept, data]) => ({ department: dept, avgScore: Math.round(data.total / data.count) }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Risk Scoring Engine
        </h2>
        <p className="text-muted-foreground mt-1">Live organization-wide risk analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Avg Risk Score" value={avgScore} suffix="/100" icon={<Shield className="w-5 h-5" />} color="primary" />
        <SummaryCard title="High Risk Users" value={highRiskUsers.length} icon={<AlertTriangle className="w-5 h-5" />} color="destructive" />
        <SummaryCard title="Tracked Users" value={users.length} icon={<Users className="w-5 h-5" />} color="accent" />
        <SummaryCard title="Departments" value={departmentRisk.length} icon={<TrendingUp className="w-5 h-5" />} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Risk Distribution</h3>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 text-sm">No risk data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={distribution} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {distribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Risk by Department</h3>
          {departmentRisk.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 text-sm">No department data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentRisk}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="department" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="avgScore" name="Avg Risk Score" radius={[4, 4, 0, 0]}>
                  {departmentRisk.map((entry, idx) => (
                    <Cell key={idx} fill={entry.avgScore <= 30 ? COLORS.low : entry.avgScore <= 70 ? COLORS.medium : COLORS.high} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          High Risk Users
        </h3>
        {highRiskUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No high-risk users detected 🎉</p>
        ) : (
          <UserTable users={highRiskUsers} />
        )}
      </div>

      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground">All Users Risk Summary</h3>
        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-4 text-sm">No users have triggered risk events yet.</p>
        ) : (
          <UserTable users={[...users].sort((a, b) => b.score - a.score)} />
        )}
      </div>
    </div>
  );
};

const UserTable = ({ users }: { users: UserRiskRow[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left text-xs text-muted-foreground uppercase py-3 px-4">User</th>
          <th className="text-left text-xs text-muted-foreground uppercase py-3 px-4">Department</th>
          <th className="text-left text-xs text-muted-foreground uppercase py-3 px-4">Score</th>
          <th className="text-left text-xs text-muted-foreground uppercase py-3 px-4">Level</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => {
          const levelStyle = u.level === 'high' ? 'bg-destructive/20 text-destructive' : u.level === 'medium' ? 'bg-warning/20 text-warning' : 'bg-accent/20 text-accent';
          const barColor = u.level === 'high' ? 'bg-destructive' : u.level === 'medium' ? 'bg-warning' : 'bg-accent';
          return (
            <tr key={u.user_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
              <td className="py-3 px-4">
                <p className="font-medium text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </td>
              <td className="py-3 px-4 text-muted-foreground">{u.department}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${u.score}%` }} />
                  </div>
                  <span className="text-sm font-bold text-foreground">{u.score}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${levelStyle}`}>{u.level} Risk</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const SummaryCard = ({ title, value, suffix, icon, color }: { title: string; value: number | string; suffix?: string; icon: React.ReactNode; color: 'primary' | 'destructive' | 'accent' | 'warning' }) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    destructive: 'text-destructive bg-destructive/10',
    accent: 'text-accent bg-accent/10',
    warning: 'text-warning bg-warning/10',
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

export default AdminRiskDashboard;

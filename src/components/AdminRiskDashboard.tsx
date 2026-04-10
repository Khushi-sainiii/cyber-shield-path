import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

// Mock risk data for demo
const generateMockUsers = () => [
  { name: 'Jatin Sharma', email: 'jatin@company.com', score: 85, level: 'high' as const, department: 'Finance' },
  { name: 'Priya Patel', email: 'priya@company.com', score: 62, level: 'medium' as const, department: 'HR' },
  { name: 'Rahul Gupta', email: 'rahul@company.com', score: 45, level: 'medium' as const, department: 'IT' },
  { name: 'Sneha Verma', email: 'sneha@company.com', score: 28, level: 'low' as const, department: 'Marketing' },
  { name: 'Amit Kumar', email: 'amit@company.com', score: 73, level: 'high' as const, department: 'Finance' },
  { name: 'Neha Singh', email: 'neha@company.com', score: 15, level: 'low' as const, department: 'IT' },
  { name: 'Vikram Rao', email: 'vikram@company.com', score: 55, level: 'medium' as const, department: 'Sales' },
  { name: 'Ananya Das', email: 'ananya@company.com', score: 90, level: 'high' as const, department: 'Finance' },
];

const trendData = [
  { date: 'Week 1', avgScore: 35, highRisk: 1 },
  { date: 'Week 2', avgScore: 42, highRisk: 2 },
  { date: 'Week 3', avgScore: 55, highRisk: 3 },
  { date: 'Week 4', avgScore: 48, highRisk: 2 },
  { date: 'Week 5', avgScore: 52, highRisk: 3 },
  { date: 'Week 6', avgScore: 45, highRisk: 2 },
];

const COLORS = {
  low: 'hsl(var(--accent))',
  medium: 'hsl(var(--warning))',
  high: 'hsl(var(--destructive))',
};

const AdminRiskDashboard = () => {
  const [users] = useState(generateMockUsers());

  const distribution = [
    { name: 'Low Risk', value: users.filter((u) => u.level === 'low').length, color: COLORS.low },
    { name: 'Medium Risk', value: users.filter((u) => u.level === 'medium').length, color: COLORS.medium },
    { name: 'High Risk', value: users.filter((u) => u.level === 'high').length, color: COLORS.high },
  ];

  const avgScore = Math.round(users.reduce((sum, u) => sum + u.score, 0) / users.length);
  const highRiskUsers = users.filter((u) => u.level === 'high').sort((a, b) => b.score - a.score);

  const departmentRisk = Object.entries(
    users.reduce((acc, u) => {
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
        <p className="text-muted-foreground mt-1">Organization-wide risk analysis and user vulnerability metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Avg Risk Score" value={avgScore} suffix="/100" icon={<Shield className="w-5 h-5" />} color="primary" />
        <SummaryCard title="High Risk Users" value={highRiskUsers.length} icon={<AlertTriangle className="w-5 h-5" />} color="destructive" />
        <SummaryCard title="Total Users" value={users.length} icon={<Users className="w-5 h-5" />} color="accent" />
        <SummaryCard
          title="Risk Trend"
          value={trendData[trendData.length - 1].avgScore > trendData[trendData.length - 2].avgScore ? '↑' : '↓'}
          suffix="trending"
          icon={<TrendingUp className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie */}
        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Risk Distribution</h3>
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
          <div className="flex justify-center gap-6 mt-2">
            {distribution.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Trend Over Time */}
        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Risk Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
              <Area type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Avg Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Risk Bar Chart */}
      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground">Risk by Department</h3>
        <ResponsiveContainer width="100%" height={200}>
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
      </div>

      {/* High Risk Users Table */}
      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          High Risk Users
        </h3>
        {highRiskUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No high-risk users detected 🎉</p>
        ) : (
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
                {highRiskUsers.map((user) => (
                  <tr key={user.email} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{user.department}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-destructive rounded-full" style={{ width: `${user.score}%` }} />
                        </div>
                        <span className="text-sm font-bold text-destructive">{user.score}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                        High Risk
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Users Table */}
      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 text-foreground">All Users Risk Summary</h3>
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
              {users.sort((a, b) => b.score - a.score).map((user) => {
                const levelStyle = user.level === 'high'
                  ? 'bg-destructive/20 text-destructive'
                  : user.level === 'medium'
                  ? 'bg-warning/20 text-warning'
                  : 'bg-accent/20 text-accent';
                const barColor = user.level === 'high' ? 'bg-destructive' : user.level === 'medium' ? 'bg-warning' : 'bg-accent';
                return (
                  <tr key={user.email} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{user.department}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${user.score}%` }} />
                        </div>
                        <span className="text-sm font-bold text-foreground">{user.score}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${levelStyle}`}>
                        {user.level} Risk
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, suffix, icon, color }: {
  title: string; value: number | string; suffix?: string; icon: React.ReactNode;
  color: 'primary' | 'destructive' | 'accent' | 'warning';
}) => {
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

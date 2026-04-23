import { useEffect, useState } from 'react';
import { Shield, Mail, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalSent: 0, totalClicked: 0, totalCompromised: 0, vulnerabilityScore: 100 });

  const load = async () => {
    const [{ count: campaignCount }, { data: results }] = await Promise.all([
      supabase.from('campaigns').select('id', { count: 'exact', head: true }),
      supabase.from('campaign_results').select('link_clicked, credentials_submitted'),
    ]);

    const totalSent = campaignCount ?? 0;
    const totalClicked = (results ?? []).filter((r) => r.link_clicked).length;
    const totalCompromised = (results ?? []).filter((r) => r.credentials_submitted).length;
    const total = (results ?? []).length;
    const safeRate = total === 0 ? 100 : Math.max(0, 100 - Math.round(((totalClicked + totalCompromised * 2) / Math.max(1, total * 3)) * 100));

    setStats({ totalSent, totalClicked, totalCompromised, vulnerabilityScore: safeRate });
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_results' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clickRate = stats.totalSent > 0 ? ((stats.totalClicked / stats.totalSent) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Live Attack Monitor</h2>
        <p className="text-muted-foreground mt-1">Real-time security awareness metrics</p>
      </div>

      <div className="cyber-card bg-warning/10 border-warning/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-warning" />
        </div>
        <div>
          <p className="font-medium text-warning">Live Mode</p>
          <p className="text-sm text-muted-foreground">All metrics update in real time from authenticated user activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Security Score" value={stats.vulnerabilityScore} suffix="%" icon={<Shield className="w-6 h-6" />} trend={stats.vulnerabilityScore < 80 ? 'down' : 'up'} color="primary" />
        <StatCard title="Campaigns Launched" value={stats.totalSent} icon={<Mail className="w-6 h-6" />} color="accent" />
        <StatCard title="Users Compromised" value={stats.totalCompromised} icon={<AlertTriangle className="w-6 h-6" />} color="destructive" />
        <StatCard title="Click Rate" value={clickRate} suffix="%" icon={<TrendingDown className="w-6 h-6" />} color="warning" />
      </div>

      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          How to Test the Simulation
        </h3>
        <ol className="space-y-3">
          {[
            'Sign up two accounts: one stays "employee", promote the other to admin.',
            'As admin, go to "Launch Attack" and create a phishing campaign.',
            'Sign in as the employee and open "Work Email" — click a suspicious email.',
            'Enter credentials on the fake login to be marked compromised.',
            'Check the Risk Engine and Gamification dashboards to see live metrics update.',
          ].map((step, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">{idx + 1}</span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, suffix, icon, trend, color }: { title: string; value: number | string; suffix?: string; icon: React.ReactNode; trend?: 'up' | 'down'; color: 'primary' | 'accent' | 'destructive' | 'warning' }) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    accent: 'text-accent bg-accent/10',
    destructive: 'text-destructive bg-destructive/10',
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
          {trend && <div className={`text-xs mt-2 ${trend === 'down' ? 'text-destructive' : 'text-accent'}`}>{trend === 'down' ? '↓ Needs attention' : '↑ Good standing'}</div>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { Shield, Mail, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { api, Stats } from '@/lib/mockData';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ total_sent: 0, total_clicked: 0, vulnerability_score: 100 });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get(`${API_URL}/stats`);
      if ('total_sent' in res.data) {
        setStats(res.data as Stats);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const clickRate = stats.total_sent > 0 ? ((stats.total_clicked / stats.total_sent) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Live Attack Monitor</h2>
        <p className="text-muted-foreground mt-1">Real-time security awareness metrics</p>
      </div>

      {/* Alert Banner */}
      <div className="cyber-card bg-warning/10 border-warning/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-warning" />
        </div>
        <div>
          <p className="font-medium text-warning">Demo Mode Active</p>
          <p className="text-sm text-muted-foreground">Using in-browser simulation. No actual emails are sent.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Security Score"
          value={stats.vulnerability_score}
          suffix="%"
          icon={<Shield className="w-6 h-6" />}
          trend={stats.vulnerability_score < 80 ? 'down' : 'up'}
          color="primary"
        />
        <StatCard
          title="Simulations Sent"
          value={stats.total_sent}
          icon={<Mail className="w-6 h-6" />}
          color="accent"
        />
        <StatCard
          title="Users Compromised"
          value={stats.total_clicked}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="destructive"
        />
        <StatCard
          title="Click Rate"
          value={clickRate}
          suffix="%"
          icon={<TrendingDown className="w-6 h-6" />}
          color="warning"
        />
      </div>

      {/* Instructions */}
      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          How to Test the Simulation
        </h3>
        <ol className="space-y-3">
          {[
            'Go to "Launch Attack" and create a phishing campaign.',
            'Sign out and log in as an Employee (e.g., jatin@company.com).',
            'Go to "Work Email" and click on a suspicious email.',
            'Click the link and enter fake credentials to see the attack tracked.',
            'After being "compromised", you\'ll be redirected to Training Modules.',
          ].map((step, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  color: 'primary' | 'accent' | 'destructive' | 'warning';
}

const StatCard = ({ title, value, suffix, icon, trend, color }: StatCardProps) => {
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
          {trend && (
            <div className={`text-xs mt-2 ${trend === 'down' ? 'text-destructive' : 'text-accent'}`}>
              {trend === 'down' ? '↓ Needs attention' : '↑ Good standing'}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default Dashboard;

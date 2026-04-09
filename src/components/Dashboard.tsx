import { useState, useEffect } from 'react';
import { Shield, Mail, AlertTriangle, TrendingDown, Activity, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CampaignStats {
  total_campaigns: number;
  active_campaigns: number;
  total_results: number;
  compromised_count: number;
}

interface CampaignRow {
  id: string;
  name: string;
  campaign_type: string;
  status: string;
  created_at: string;
  departments?: { name: string } | null;
}

const Dashboard = () => {
  const [stats, setStats] = useState<CampaignStats>({ total_campaigns: 0, active_campaigns: 0, total_results: 0, compromised_count: 0 });
  const [recentCampaigns, setRecentCampaigns] = useState<CampaignRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [campaignsRes, resultsRes, recentRes] = await Promise.all([
        supabase.from('campaigns').select('id, status'),
        supabase.from('campaign_results').select('id, credentials_submitted'),
        supabase.from('campaigns').select('id, name, campaign_type, status, created_at, departments(name)').order('created_at', { ascending: false }).limit(5),
      ]);

      const campaigns = campaignsRes.data || [];
      const results = resultsRes.data || [];

      setStats({
        total_campaigns: campaigns.length,
        active_campaigns: campaigns.filter(c => c.status === 'active').length,
        total_results: results.length,
        compromised_count: results.filter(r => r.credentials_submitted).length,
      });

      if (recentRes.data) {
        setRecentCampaigns(recentRes.data as CampaignRow[]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const clickRate = stats.total_results > 0 ? ((stats.compromised_count / stats.total_results) * 100).toFixed(1) : '0';
  const securityScore = stats.total_results > 0 ? Math.max(0, 100 - Math.round((stats.compromised_count / stats.total_results) * 100)) : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Live Attack Monitor</h2>
        <p className="text-muted-foreground mt-1">Real-time security awareness metrics</p>
      </div>

      <div className="cyber-card bg-primary/5 border-primary/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-primary">Connected to Cloud</p>
          <p className="text-sm text-muted-foreground">Real-time data from Lovable Cloud database.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Security Score" value={securityScore} suffix="%" icon={<Shield className="w-6 h-6" />} trend={securityScore < 80 ? 'down' : 'up'} color="primary" />
        <StatCard title="Total Campaigns" value={stats.total_campaigns} icon={<Mail className="w-6 h-6" />} color="accent" />
        <StatCard title="Users Compromised" value={stats.compromised_count} icon={<AlertTriangle className="w-6 h-6" />} color="destructive" />
        <StatCard title="Compromise Rate" value={clickRate} suffix="%" icon={<TrendingDown className="w-6 h-6" />} color="warning" />
      </div>

      {/* Recent Campaigns */}
      <div className="cyber-card">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Recent Campaigns
        </h3>
        {recentCampaigns.length === 0 ? (
          <p className="text-muted-foreground text-sm">No campaigns yet. Launch your first simulation!</p>
        ) : (
          <div className="space-y-3">
            {recentCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                <div>
                  <p className="font-medium text-foreground">{campaign.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary capitalize">
                      {campaign.campaign_type.replace('_', ' ')}
                    </span>
                    {campaign.departments && (
                      <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent">
                        {(campaign.departments as { name: string }).name}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-medium capitalize ${
                  campaign.status === 'active' ? 'bg-accent/20 text-accent' :
                  campaign.status === 'completed' ? 'bg-muted text-muted-foreground' :
                  'bg-warning/20 text-warning'
                }`}>
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        )}
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

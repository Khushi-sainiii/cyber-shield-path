import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderRow {
  user_id: string;
  name: string;
  email: string;
  department: string;
  points: number;
  badges: number;
  isCurrentUser: boolean;
}

interface DeptRow {
  department: string;
  avgPoints: number;
  totalBadges: number;
  userCount: number;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-warning" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-primary" />;
  return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'global' | 'department'>('global');
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [deptRows, setDeptRows] = useState<DeptRow[]>([]);

  const load = async () => {
    const { data: points } = await supabase
      .from('user_points')
      .select('user_id, total_points')
      .order('total_points', { ascending: false })
      .limit(50);

    const userIds = (points ?? []).map((p) => p.user_id);
    if (userIds.length === 0) {
      setRows([]);
      setDeptRows([]);
      return;
    }

    const [{ data: profs }, { data: badges }, { data: depts }] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name, email, department_id').in('user_id', userIds),
      supabase.from('user_badges').select('user_id').in('user_id', userIds),
      supabase.from('departments').select('id, name'),
    ]);

    const profById = new Map((profs ?? []).map((p) => [p.user_id, p]));
    const deptById = new Map((depts ?? []).map((d) => [d.id, d.name]));
    const badgeCount = new Map<string, number>();
    (badges ?? []).forEach((b) => badgeCount.set(b.user_id, (badgeCount.get(b.user_id) ?? 0) + 1));

    const built: LeaderRow[] = (points ?? []).map((p) => {
      const prof = profById.get(p.user_id);
      return {
        user_id: p.user_id,
        name: prof?.display_name ?? prof?.email?.split('@')[0] ?? 'Unknown',
        email: prof?.email ?? '',
        department: prof?.department_id ? (deptById.get(prof.department_id) ?? '—') : '—',
        points: p.total_points,
        badges: badgeCount.get(p.user_id) ?? 0,
        isCurrentUser: p.user_id === user?.id,
      };
    });

    setRows(built.slice(0, 10));

    // Department aggregation
    const byDept = new Map<string, { total: number; badges: number; count: number }>();
    built.forEach((r) => {
      const d = r.department;
      if (!byDept.has(d)) byDept.set(d, { total: 0, badges: 0, count: 0 });
      const v = byDept.get(d)!;
      v.total += r.points;
      v.badges += r.badges;
      v.count += 1;
    });
    setDeptRows(
      Array.from(byDept.entries())
        .filter(([d]) => d !== '—')
        .map(([department, v]) => ({
          department,
          avgPoints: Math.round(v.total / v.count),
          totalBadges: v.badges,
          userCount: v.count,
        }))
        .sort((a, b) => b.avgPoints - a.avgPoints)
    );
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_points' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_badges' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const top3 = [rows[1], rows[0], rows[2]].filter(Boolean);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-6 h-6 text-warning" />
          Leaderboard
        </h2>
        <p className="text-muted-foreground mt-1">See how you rank against your peers in security awareness</p>
      </div>

      {top3.length === 3 && (
        <div className="grid grid-cols-3 gap-4">
          {top3.map((u, idx) => {
            const podiumOrder = [2, 1, 3];
            const rank = podiumOrder[idx];
            const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' } as const;
            const colors = {
              1: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30',
              2: 'from-gray-300/20 to-gray-400/5 border-gray-300/30',
              3: 'from-amber-600/20 to-amber-700/5 border-amber-600/30',
            } as const;
            return (
              <div key={u.user_id} className={cn('cyber-card flex flex-col items-center justify-end border bg-gradient-to-t', colors[rank as 1 | 2 | 3])}>
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2', u.isCurrentUser ? 'bg-primary text-primary-foreground ring-2 ring-primary' : 'bg-secondary text-foreground')}>
                  {u.name[0]?.toUpperCase()}
                </div>
                <p className="font-bold text-foreground text-sm text-center">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.department}</p>
                <div className="flex items-center gap-1 mt-2">
                  {getRankIcon(rank)}
                  <span className="text-lg font-bold text-warning">{u.points}</span>
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
                <div className={cn('w-full mt-3 rounded-b-lg bg-secondary/30', heights[rank as 1 | 2 | 3])} />
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('global')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === 'global' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground')}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Global Ranking
        </button>
        <button
          onClick={() => setActiveTab('department')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === 'department' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground')}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          By Department
        </button>
      </div>

      {activeTab === 'global' && (
        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Top 10 Security Champions</h3>
          {rows.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">No participants yet. Be the first to earn points!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted-foreground uppercase py-3 px-4">Rank</th>
                    <th className="text-left text-xs text-muted-foreground uppercase py-3 px-4">User</th>
                    <th className="text-left text-xs text-muted-foreground uppercase py-3 px-4">Department</th>
                    <th className="text-left text-xs text-muted-foreground uppercase py-3 px-4">Points</th>
                    <th className="text-left text-xs text-muted-foreground uppercase py-3 px-4">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u, idx) => (
                    <tr key={u.user_id} className={cn('border-b border-border/50 transition-colors', u.isCurrentUser ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-secondary/30')}>
                      <td className="py-3 px-4">{getRankIcon(idx + 1)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold', u.isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground')}>
                            {u.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {u.name} {u.isCurrentUser && <span className="text-xs text-primary ml-1">(You)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{u.department}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-warning">{u.points}</span>
                        <span className="text-xs text-muted-foreground ml-1">pts</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">{u.badges}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'department' && (
        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Department Rankings</h3>
          {deptRows.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">No department data yet.</p>
          ) : (
            <div className="space-y-3">
              {deptRows.map((dept, idx) => (
                <div key={dept.department} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/20 border border-border hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-2 w-8">{getRankIcon(idx + 1)}</div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{dept.department}</p>
                    <p className="text-xs text-muted-foreground">{dept.userCount} members</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-warning">
                      {dept.avgPoints} <span className="text-xs text-muted-foreground">avg pts</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{dept.totalBadges} badges earned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

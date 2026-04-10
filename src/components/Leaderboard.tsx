import { useState } from 'react';
import { Trophy, Medal, Award, Star, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Sneha Verma', email: 'sneha@company.com', department: 'Marketing', points: 285, badges: 4, isCurrentUser: false },
  { rank: 2, name: 'Neha Singh', email: 'neha@company.com', department: 'IT', points: 220, badges: 3, isCurrentUser: false },
  { rank: 3, name: 'Jatin Sharma', email: 'jatin@company.com', department: 'Finance', points: 145, badges: 2, isCurrentUser: true },
  { rank: 4, name: 'Rahul Gupta', email: 'rahul@company.com', department: 'IT', points: 130, badges: 2, isCurrentUser: false },
  { rank: 5, name: 'Priya Patel', email: 'priya@company.com', department: 'HR', points: 110, badges: 1, isCurrentUser: false },
  { rank: 6, name: 'Vikram Rao', email: 'vikram@company.com', department: 'Sales', points: 95, badges: 1, isCurrentUser: false },
  { rank: 7, name: 'Ananya Das', email: 'ananya@company.com', department: 'Finance', points: 80, badges: 1, isCurrentUser: false },
  { rank: 8, name: 'Amit Kumar', email: 'amit@company.com', department: 'Finance', points: 65, badges: 0, isCurrentUser: false },
  { rank: 9, name: 'Ravi Mehta', email: 'ravi@company.com', department: 'Sales', points: 50, badges: 0, isCurrentUser: false },
  { rank: 10, name: 'Kavya Nair', email: 'kavya@company.com', department: 'HR', points: 35, badges: 0, isCurrentUser: false },
];

const DEPT_LEADERBOARD = [
  { department: 'Marketing', avgPoints: 285, totalBadges: 4, userCount: 1 },
  { department: 'IT', avgPoints: 175, totalBadges: 5, userCount: 2 },
  { department: 'Finance', avgPoints: 97, totalBadges: 3, userCount: 3 },
  { department: 'HR', avgPoints: 73, totalBadges: 1, userCount: 2 },
  { department: 'Sales', avgPoints: 73, totalBadges: 1, userCount: 2 },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-warning" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-primary" />;
  return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
};

type TabType = 'global' | 'department';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('global');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-6 h-6 text-warning" />
          Leaderboard
        </h2>
        <p className="text-muted-foreground mt-1">See how you rank against your peers in security awareness</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4">
        {[MOCK_LEADERBOARD[1], MOCK_LEADERBOARD[0], MOCK_LEADERBOARD[2]].map((user, idx) => {
          const podiumOrder = [2, 1, 3];
          const rank = podiumOrder[idx];
          const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' };
          const colors = { 1: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30', 2: 'from-gray-300/20 to-gray-400/5 border-gray-300/30', 3: 'from-amber-600/20 to-amber-700/5 border-amber-600/30' };
          return (
            <div key={user.email} className={cn('cyber-card flex flex-col items-center justify-end border bg-gradient-to-t', colors[rank as 1 | 2 | 3])}>
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mb-2',
                user.isCurrentUser ? 'bg-primary text-primary-foreground ring-2 ring-primary' : 'bg-secondary text-foreground'
              )}>
                {user.name[0]}
              </div>
              <p className="font-bold text-foreground text-sm text-center">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.department}</p>
              <div className="flex items-center gap-1 mt-2">
                {getRankIcon(rank)}
                <span className="text-lg font-bold text-warning">{user.points}</span>
                <span className="text-xs text-muted-foreground">pts</span>
              </div>
              <div className={cn('w-full mt-3 rounded-b-lg bg-secondary/30', heights[rank as 1 | 2 | 3])} />
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('global')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'global' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Global Ranking
        </button>
        <button
          onClick={() => setActiveTab('department')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'department' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
          )}
        >
          <Building2 className="w-4 h-4 inline mr-2" />
          By Department
        </button>
      </div>

      {/* Global Leaderboard */}
      {activeTab === 'global' && (
        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Top 10 Security Champions</h3>
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
                {MOCK_LEADERBOARD.map((user) => (
                  <tr
                    key={user.email}
                    className={cn(
                      'border-b border-border/50 transition-colors',
                      user.isCurrentUser ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-secondary/30'
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(user.rank)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                          user.isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                        )}>
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.name} {user.isCurrentUser && <span className="text-xs text-primary ml-1">(You)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{user.department}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-warning">{user.points}</span>
                      <span className="text-xs text-muted-foreground ml-1">pts</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{user.badges}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department Leaderboard */}
      {activeTab === 'department' && (
        <div className="cyber-card">
          <h3 className="font-bold text-lg mb-4 text-foreground">Department Rankings</h3>
          <div className="space-y-3">
            {DEPT_LEADERBOARD.sort((a, b) => b.avgPoints - a.avgPoints).map((dept, idx) => (
              <div key={dept.department} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/20 border border-border hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-2 w-8">
                  {getRankIcon(idx + 1)}
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{dept.department}</p>
                  <p className="text-xs text-muted-foreground">{dept.userCount} members</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warning">{dept.avgPoints} <span className="text-xs text-muted-foreground">avg pts</span></p>
                  <p className="text-xs text-muted-foreground">{dept.totalBadges} badges earned</p>
                </div>
                <div className="w-24">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(dept.avgPoints / 300) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

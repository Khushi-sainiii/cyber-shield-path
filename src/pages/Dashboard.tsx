import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/Dashboard';
import CampaignLauncher from '@/components/CampaignLauncher';
import Inbox from '@/components/Inbox';
import SmsInbox, { SmsMessage } from '@/components/SmsInbox';
import TrainingModules from '@/components/TrainingModules';
import FakeLoginPage from '@/components/FakeLoginPage';
import CompromisedScreen from '@/components/CompromisedScreen';
import RiskScoreCard from '@/components/RiskScoreCard';
import AdminRiskDashboard from '@/components/AdminRiskDashboard';
import GamificationProfile from '@/components/GamificationProfile';
import Leaderboard from '@/components/Leaderboard';
import AdminGamification from '@/components/AdminGamification';
import { useAuth } from '@/hooks/useAuth';
import { userActions } from '@/lib/actions';
import { Email } from '@/lib/mockData';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, role, signOut, loading } = useAuth();

  const sessionUser = {
    name: profile?.display_name || user?.email?.split('@')[0] || 'User',
    email: profile?.email || user?.email || '',
    role: (role ?? 'employee') as 'admin' | 'employee',
  };

  const [activeView, setActiveView] = useState<string>(role === 'admin' ? 'dashboard' : 'inbox');
  const [simulationMode, setSimulationMode] = useState<'none' | 'login' | 'compromised'>('none');
  const [currentAttackToken, setCurrentAttackToken] = useState('');
  const [compromiseMessage, setCompromiseMessage] = useState('');
  const [highlightTrainingModule, setHighlightTrainingModule] = useState<string | undefined>();

  useEffect(() => {
    if (role) setActiveView(role === 'admin' ? 'dashboard' : 'inbox');
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading your workspace…</div>
      </div>
    );
  }

  const handleEmailClick = async (email: Email) => {
    await userActions.linkClicked();
    setCurrentAttackToken(email.id);
    const moduleMap: Record<Email['type'], string> = {
      phishing: 'phishing',
      baiting: 'baiting',
      smishing: 'smishing',
      'spear-phishing': 'spear-phishing',
    };
    setHighlightTrainingModule(moduleMap[email.type]);
    setSimulationMode('login');
  };

  const handleCompromised = async (message: string) => {
    await userActions.credentialsSubmitted();
    setCompromiseMessage(message);
    setSimulationMode('compromised');
  };

  const handleGoToTraining = () => {
    setSimulationMode('none');
    setActiveView('training');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (simulationMode === 'login') {
    return <FakeLoginPage token={currentAttackToken} onCompromised={handleCompromised} />;
  }

  if (simulationMode === 'compromised') {
    return <CompromisedScreen message={compromiseMessage} onGoToTraining={handleGoToTraining} />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activeView={activeView} setActiveView={setActiveView} currentUser={sessionUser} onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'create-campaign' && <CampaignLauncher />}
          {activeView === 'risk-engine' && <AdminRiskDashboard />}
          {activeView === 'inbox' && <Inbox currentUser={sessionUser} onEmailClick={handleEmailClick} />}
          {activeView === 'sms-inbox' && (
            <SmsInbox
              onMaliciousClick={(msg: SmsMessage) => {
                userActions.linkClicked();
                setCurrentAttackToken(msg.id);
                setHighlightTrainingModule('smishing');
                setSimulationMode('login');
              }}
            />
          )}
          {activeView === 'training' && <TrainingModules highlightModule={highlightTrainingModule} />}
          {activeView === 'risk-score' && <RiskScoreCard />}
          {activeView === 'gamification' && <GamificationProfile />}
          {activeView === 'leaderboard' && <Leaderboard />}
          {activeView === 'admin-gamification' && <AdminGamification />}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

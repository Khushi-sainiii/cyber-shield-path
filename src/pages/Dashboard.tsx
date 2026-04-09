import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/Dashboard';
import CampaignLauncher from '@/components/CampaignLauncher';
import Inbox from '@/components/Inbox';
import TrainingModules from '@/components/TrainingModules';
import FakeLoginPage from '@/components/FakeLoginPage';
import CompromisedScreen from '@/components/CompromisedScreen';
import { Email } from '@/lib/mockData';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(user?.role === 'admin' ? 'dashboard' : 'inbox');
  const [simulationMode, setSimulationMode] = useState<'none' | 'login' | 'compromised'>('none');
  const [currentAttackToken, setCurrentAttackToken] = useState('');
  const [compromiseMessage, setCompromiseMessage] = useState('');
  const [highlightTrainingModule, setHighlightTrainingModule] = useState<string | undefined>();

  if (!user) return null;

  const handleEmailClick = (email: Email) => {
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

  const handleCompromised = (message: string) => {
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
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'create-campaign' && <CampaignLauncher />}
          {activeView === 'inbox' && <Inbox currentUser={user} onEmailClick={handleEmailClick} />}
          {activeView === 'training' && <TrainingModules highlightModule={highlightTrainingModule} />}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

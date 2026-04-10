import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import DashboardView from '@/components/Dashboard';
import CampaignLauncher from '@/components/CampaignLauncher';
import Inbox from '@/components/Inbox';
import TrainingModules from '@/components/TrainingModules';
import FakeLoginPage from '@/components/FakeLoginPage';
import CompromisedScreen from '@/components/CompromisedScreen';
import { api, Email } from '@/lib/mockData';

const API_URL = 'http://localhost:5000/api';

interface User {
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(user.role === 'admin' ? 'dashboard' : 'inbox');
  const [simulationMode, setSimulationMode] = useState<'none' | 'login' | 'compromised'>('none');
  const [currentAttackToken, setCurrentAttackToken] = useState('');
  const [compromiseMessage, setCompromiseMessage] = useState('');
  const [highlightTrainingModule, setHighlightTrainingModule] = useState<string | undefined>();

  const handleEmailClick = async (email: Email) => {
    await api.post(`${API_URL}/track/click`, { token: email.id });
    setCurrentAttackToken(email.id);

    // Map email type to training module
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

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // Show fake login page
  if (simulationMode === 'login') {
    return <FakeLoginPage token={currentAttackToken} onCompromised={handleCompromised} />;
  }

  // Show compromised screen
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

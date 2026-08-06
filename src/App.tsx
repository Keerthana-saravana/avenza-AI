import React from 'react';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { LandingPage } from './views/LandingPage';
import { LoginPage } from './views/LoginPage';
import { OnboardingPage } from './views/OnboardingPage';
import { DashboardRoot } from './views/DashboardRoot';

const AppContent: React.FC = () => {
  const { currentView } = useBusiness();

  switch (currentView) {
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginPage />;
    case 'onboarding':
      return <OnboardingPage />;
    case 'dashboard':
      return <DashboardRoot />;
    default:
      return <LandingPage />;
  }
};

function App() {
  return (
    <BusinessProvider>
      <AppContent />
    </BusinessProvider>
  );
}

export default App;

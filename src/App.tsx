import React from 'react';
import { useGame } from './context/GameContext';
import { SelectionScreen } from './components/SelectionScreen';
import { HubScreen } from './components/HubScreen';

export const AppContent: React.FC = () => {
  const { isLoadingData, robotPrincipal } = useGame();

  if (isLoadingData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0D0D0D] text-amber-400">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent mb-4" />
        <span className="font-orbitron tracking-widest text-sm uppercase">
          CONECTANDO AL NÚCLEO...
        </span>
      </div>
    );
  }

  if (!robotPrincipal) {
    return <SelectionScreen />;
  }

  return <HubScreen />;
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { WorkshopPanel } from './WorkshopPanel';
import { ExplorationPanel } from './ExplorationPanel';
import { MarketPanel } from './MarketPanel';
import { SaveModal } from './SaveModal';
import { BattleScreen } from './BattleScreen';
import { WorldZone } from '../types/game';
import { Wrench, Compass, ShoppingCart, Settings, Volume2, VolumeX, Coins } from 'lucide-react';

export const HubScreen: React.FC = () => {
  const { creditos, isMuted, toggleMute } = useGame();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [activeBattleZone, setActiveBattleZone] = useState<WorldZone | null>(null);

  if (activeBattleZone) {
    return (
      <BattleScreen
        zona={activeBattleZone}
        onExit={() => setActiveBattleZone(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0D0D0D] select-none text-white overflow-hidden">
      {/* Top App Bar */}
      <header className="flex items-center justify-between border-b border-white/10 bg-[#1A1A1A] px-4 py-3 shrink-0">
        <h1 className="font-orbitron font-bold text-base md:text-xl text-amber-400 tracking-[0.15em]">
          SECTOR 7 - HUB
        </h1>

        <div className="flex items-center gap-3">
          {/* CHTR Balance */}
          <div className="flex items-center gap-1.5 rounded border border-emerald-400/40 bg-emerald-950/30 px-3 py-1 font-mono text-xs md:text-sm font-bold text-emerald-400">
            <Coins className="h-4 w-4" />
            <span>CHTR: {creditos}</span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className="rounded p-1.5 text-white/60 hover:text-white transition"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-red-400" />
            ) : (
              <Volume2 className="h-5 w-5 text-emerald-400" />
            )}
          </button>

          {/* Settings / Save data button */}
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="rounded p-1.5 text-white/60 hover:text-white transition"
            title="Datos de la partida"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Panels */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 0 && <WorkshopPanel />}
        {activeTab === 1 && <ExplorationPanel onSelectZone={(z) => setActiveBattleZone(z)} />}
        {activeTab === 2 && <MarketPanel />}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-around border-t border-white/10 bg-[#1A1A1A] py-2 shrink-0">
        <button
          onClick={() => setActiveTab(0)}
          className={`flex flex-col items-center gap-1 px-6 py-1 font-mono text-xs transition cursor-pointer ${
            activeTab === 0 ? 'text-amber-400 font-bold scale-105' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Wrench className="h-5 w-5" />
          <span>Taller</span>
        </button>

        <button
          onClick={() => setActiveTab(1)}
          className={`flex flex-col items-center gap-1 px-6 py-1 font-mono text-xs transition cursor-pointer ${
            activeTab === 1 ? 'text-amber-400 font-bold scale-105' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span>Explorar</span>
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`flex flex-col items-center gap-1 px-6 py-1 font-mono text-xs transition cursor-pointer ${
            activeTab === 2 ? 'text-amber-400 font-bold scale-105' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Mercado</span>
        </button>
      </nav>

      {/* Save Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </div>
  );
};

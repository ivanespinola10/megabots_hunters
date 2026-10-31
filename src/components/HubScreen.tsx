import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { WorkshopPanel } from './WorkshopPanel';
import { ExplorationPanel } from './ExplorationPanel';
import { MarketPanel } from './MarketPanel';
import { SaveModal } from './SaveModal';
import { BattleScreen } from './BattleScreen';
import { EliteLicenseModal } from './EliteLicenseModal';
import { PilotProfileModal } from './PilotProfileModal';
import { PWAInstallButton } from './PWAInstallButton';
import { WorldZone } from '../types/game';
import { Wrench, Compass, ShoppingCart, Settings, Volume2, VolumeX, Coins, Award, Gift, User } from 'lucide-react';

export const HubScreen: React.FC = () => {
  const { creditos, isMuted, toggleMute, licenciaElite, puedeReclamarDiaria, pilotoActual } = useGame();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isPilotModalOpen, setIsPilotModalOpen] = useState(false);
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
      <header className="flex items-center justify-between border-b border-white/10 bg-[#1A1A1A] px-3 md:px-4 py-2.5 shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="font-orbitron font-bold text-sm md:text-lg text-amber-400 tracking-[0.12em] whitespace-nowrap">
            SECTOR 7
          </h1>
          {licenciaElite ? (
            <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
              <Award className="h-3 w-3" />
              <span>ÉLITE</span>
            </span>
          ) : (
            <button
              onClick={() => setIsLicenseModalOpen(true)}
              className="text-[10px] bg-white/10 text-white/70 hover:text-amber-300 border border-white/20 px-2 py-0.5 rounded font-mono transition cursor-pointer"
            >
              PASE ÉLITE
            </button>
          )}

          {/* Pilot Avatar Chip */}
          <button
            onClick={() => setIsPilotModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/40 pl-1 pr-2.5 py-0.5 text-xs font-mono text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/60 transition cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.2)]"
            title="Perfil de Piloto Ciberpunk"
          >
            <img
              src={pilotoActual.avatar}
              alt={pilotoActual.nombre}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover border border-cyan-400"
            />
            <span className="font-orbitron font-bold text-[10px] md:text-[11px] truncate max-w-[80px] md:max-w-[120px]">
              {pilotoActual.callsign}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* CHTR Balance */}
          <div className="flex items-center gap-1.5 rounded border border-emerald-400/40 bg-emerald-950/30 px-2.5 py-1 font-mono text-xs md:text-sm font-bold text-emerald-400">
            <Coins className="h-4 w-4" />
            <span>{creditos}</span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className="rounded p-1 text-white/60 hover:text-white transition cursor-pointer"
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-red-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            )}
          </button>

          {/* Settings / Save data button */}
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="rounded p-1 text-white/60 hover:text-white transition cursor-pointer"
            title="Datos de la partida"
          >
            <Settings className="h-4 w-4" />
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
          className={`flex flex-col items-center gap-1 px-4 py-1 font-mono text-xs transition cursor-pointer ${
            activeTab === 0 ? 'text-amber-400 font-bold scale-105' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Wrench className="h-4 w-4 md:h-5 md:w-5" />
          <span>Taller</span>
        </button>

        <button
          onClick={() => setActiveTab(1)}
          className={`relative flex flex-col items-center gap-1 px-4 py-1 font-mono text-xs transition cursor-pointer ${
            activeTab === 1 ? 'text-amber-400 font-bold scale-105' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Compass className="h-4 w-4 md:h-5 md:w-5" />
          <span>Explorar</span>
          {puedeReclamarDiaria && (
            <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`flex flex-col items-center gap-1 px-4 py-1 font-mono text-xs transition cursor-pointer ${
            activeTab === 2 ? 'text-amber-400 font-bold scale-105' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
          <span>Mercado</span>
        </button>
      </nav>

      {/* Save Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />

      {/* Elite License Modal */}
      <EliteLicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
      />

      {/* Pilot Profile Modal */}
      <PilotProfileModal
        isOpen={isPilotModalOpen}
        onClose={() => setIsPilotModalOpen(false)}
      />
    </div>
  );
};


import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { WorldZone } from '../types/game';
import { EliteLicenseModal } from './EliteLicenseModal';
import { Compass, Skull, ChevronRight, Lock, Gift, Flame, Trophy } from 'lucide-react';

interface ExplorationPanelProps {
  onSelectZone: (zone: WorldZone) => void;
}

export const ExplorationPanel: React.FC<ExplorationPanelProps> = ({ onSelectZone }) => {
  const {
    zonasDisponibles,
    curarRobotCompleto,
    licenciaElite,
    arenaRacha,
    puedeReclamarDiaria,
    reclamarRecompensaDiaria,
  } = useGame();

  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [lockedTargetZone, setLockedTargetZone] = useState<string | undefined>(undefined);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const handleStartIncursion = (zona: WorldZone) => {
    if (zona.requiereLicencia && !licenciaElite) {
      setLockedTargetZone(zona.nombreBioma);
      setLicenseModalOpen(true);
      return;
    }
    curarRobotCompleto();
    onSelectZone(zona);
  };

  const handleClaimDaily = () => {
    const success = reclamarRecompensaDiaria();
    if (success) {
      setDailyClaimed(true);
      setTimeout(() => setDailyClaimed(false), 3000);
    }
  };

  return (
    <div className="h-full p-4 md:p-6 overflow-y-auto space-y-4">
      {/* Daily Reward Banner */}
      <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-black/80 to-black/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/20 p-2.5 text-amber-400">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-bold text-sm text-amber-400">
                SUMINISTRO DIARIO DE PROTOCOLO
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                +75 CHTR
              </span>
            </div>
            <p className="text-xs text-white/60">
              Bonificación diaria de refacciones por inicio de sesión de Cazador.
            </p>
          </div>
        </div>

        <button
          onClick={handleClaimDaily}
          disabled={!puedeReclamarDiaria}
          className={`shrink-0 rounded-lg px-4 py-2 text-xs font-orbitron font-bold uppercase tracking-wider transition cursor-pointer ${
            puedeReclamarDiaria
              ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {dailyClaimed ? '¡RECLAMADO!' : puedeReclamarDiaria ? 'RECLAMAR HOY' : 'RECLAMADO HOY'}
        </button>
      </div>

      {/* Header and Arena Record */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-amber-400" />
          <h2 className="font-orbitron text-lg md:text-xl font-bold text-white tracking-wide">
            SELECCIONAR ZONA DE INCURSIÓN
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
          <Trophy className="h-4 w-4 text-cyan-400" />
          <span>RÉCORD ARENA: {arenaRacha} OLEADAS</span>
        </div>
      </div>

      {/* Zones list */}
      <div className="space-y-4 max-w-4xl">
        {zonasDisponibles.map((zona) => {
          const isBoss = zona.nombreBioma.includes('Jefe') || zona.nombreBioma.includes('JEFE');
          const isArena = !!zona.esArena;
          const isLocked = zona.requiereLicencia && !licenciaElite;

          return (
            <div
              key={zona.id}
              className={`rounded-xl border p-4 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isArena
                  ? 'border-cyan-500/60 bg-[#0d1e26] hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : isBoss
                  ? 'border-purple-500/60 bg-[#1f1124] hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : zona.requiereLicencia
                  ? 'border-white/15 bg-[#141414] hover:border-white/30'
                  : 'border-emerald-500/50 bg-[#161616] hover:border-emerald-400'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {isBoss && <Skull className="h-4 w-4 text-purple-400" />}
                  {isArena && <Flame className="h-4 w-4 text-cyan-400" />}
                  {isLocked && <Lock className="h-4 w-4 text-amber-400" />}

                  <h3
                    className={`font-orbitron text-base md:text-lg font-bold tracking-wide ${
                      isArena ? 'text-cyan-300' : isBoss ? 'text-purple-300' : isLocked ? 'text-white/80' : 'text-emerald-400'
                    }`}
                  >
                    {zona.nombreBioma}
                  </h3>

                  {!zona.requiereLicencia ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                      GRATUITO
                    </span>
                  ) : isLocked ? (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
                      LICENCIA ÉLITE
                    </span>
                  ) : (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono font-bold">
                      DESBLOQUEADO
                    </span>
                  )}
                </div>

                <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                  {zona.descripcion}
                </p>

                <div className="mt-2 text-[11px] font-mono text-white/40">
                  {isArena ? 'AMENAZAS DINÁMICAS POR OLEADA' : `AMENAZAS DETECTADAS: ${zona.enemigosIds.join(', ')}`}
                </div>
              </div>

              <button
                onClick={() => handleStartIncursion(zona)}
                className={`self-start md:self-center shrink-0 flex items-center gap-1 rounded-lg px-5 py-3 font-orbitron text-xs md:text-sm font-bold uppercase tracking-wider transition cursor-pointer ${
                  isLocked
                    ? 'bg-amber-500/80 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : isArena
                    ? 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : isBoss
                    ? 'bg-purple-500 text-black hover:bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>DESBLOQUEAR</span>
                  </>
                ) : (
                  <>
                    <span>INICIAR</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <EliteLicenseModal
        isOpen={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        targetZoneName={lockedTargetZone}
      />
    </div>
  );
};

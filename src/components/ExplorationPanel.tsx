import React from 'react';
import { useGame } from '../context/GameContext';
import { WorldZone } from '../types/game';
import { Compass, Skull, ChevronRight } from 'lucide-react';

interface ExplorationPanelProps {
  onSelectZone: (zone: WorldZone) => void;
}

export const ExplorationPanel: React.FC<ExplorationPanelProps> = ({ onSelectZone }) => {
  const { zonasDisponibles, curarRobotCompleto } = useGame();

  const handleStartIncursion = (zona: WorldZone) => {
    curarRobotCompleto();
    onSelectZone(zona);
  };

  return (
    <div className="h-full p-4 md:p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="h-5 w-5 text-amber-400" />
        <h2 className="font-orbitron text-lg md:text-xl font-bold text-white tracking-wide">
          SELECCIONAR ZONA DE INCURSIÓN
        </h2>
      </div>

      <div className="space-y-4 max-w-4xl">
        {zonasDisponibles.map((zona) => {
          const isBoss = zona.nombreBioma.includes('JEFE');

          return (
            <div
              key={zona.id}
              className={`rounded-xl border p-4 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isBoss
                  ? 'border-purple-500/60 bg-[#1f1124] hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'border-amber-500/50 bg-[#161616] hover:border-amber-400'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {isBoss && <Skull className="h-4 w-4 text-purple-400" />}
                  <h3
                    className={`font-orbitron text-base md:text-lg font-bold tracking-wide ${
                      isBoss ? 'text-purple-300' : 'text-amber-400'
                    }`}
                  >
                    {zona.nombreBioma}
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                  {zona.descripcion}
                </p>
                <div className="mt-2 text-[11px] font-mono text-white/40">
                  AMENAZAS DETECTADAS: {zona.enemigosIds.join(', ')}
                </div>
              </div>

              <button
                onClick={() => handleStartIncursion(zona)}
                className={`self-start md:self-center shrink-0 flex items-center gap-1 rounded-lg px-5 py-3 font-orbitron text-xs md:text-sm font-bold uppercase tracking-wider transition cursor-pointer ${
                  isBoss
                    ? 'bg-purple-500 text-black hover:bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                }`}
              >
                <span>INICIAR</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

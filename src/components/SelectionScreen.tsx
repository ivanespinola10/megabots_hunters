import React, { useState } from 'react';
import { STARTER_ROBOTS } from '../data/defaultData';
import { useGame } from '../context/GameContext';
import { getHpTotal, getAtaqueTotal, getVelocidadTotal } from '../types/game';
import { audioService } from '../services/audioService';
import { Shield, Zap, Crosshair } from 'lucide-react';

export const SelectionScreen: React.FC = () => {
  const { seleccionarChasisInicial } = useGame();
  const [selectedIndex, setSelectedIndex] = useState(1); // Default to Scout (center)

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
    audioService.playSfx('click');
  };

  const handleConfirm = () => {
    audioService.playSfx('equip');
    seleccionarChasisInicial(STARTER_ROBOTS[selectedIndex]);
  };

  const getDescription = (id: string) => {
    if (id.includes('striker')) return 'Alto riesgo, alta recompensa. Golpea primero, golpea duro.';
    if (id.includes('bulwark')) return 'Una fortaleza móvil. Resiste cualquier embate enemigo.';
    return 'Versátil y confiable. Perfecto para misiones de reconocimiento.';
  };

  const getIcon = (id: string) => {
    if (id.includes('striker')) return <Zap className="h-6 w-6 text-red-400" />;
    if (id.includes('bulwark')) return <Shield className="h-6 w-6 text-blue-400" />;
    return <Crosshair className="h-6 w-6 text-amber-400" />;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-between p-4 md:p-8 select-none">
      {/* Header */}
      <div className="text-center pt-4">
        <h1 className="font-orbitron text-2xl md:text-3xl font-extrabold text-amber-400 tracking-wider">
          INICIANDO SISTEMAS DE CAZA
        </h1>
        <p className="mt-2 text-sm md:text-base text-white/70">
          Selecciona tu Chasis de Despliegue
        </p>
      </div>

      {/* Frame cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        {STARTER_ROBOTS.map((robot, index) => {
          const isSelected = index === selectedIndex;
          const hp = getHpTotal(robot);
          const atk = getAtaqueTotal(robot);
          const vel = getVelocidadTotal(robot);

          return (
            <div
              key={robot.id}
              onClick={() => handleSelect(index)}
              className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between border-2 ${
                isSelected
                  ? 'border-amber-400 bg-[#1A1A1A] shadow-[0_0_25px_rgba(251,191,36,0.25)] scale-102'
                  : 'border-white/10 bg-[#141414] hover:border-white/30 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getIcon(robot.id)}
                    <span className="text-xs uppercase tracking-widest text-white/40">
                      CHASIS 0{index + 1}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold bg-amber-400 text-black px-2 py-0.5 rounded font-orbitron">
                      ACTIVO
                    </span>
                  )}
                </div>

                <h2
                  className={`font-orbitron text-xl font-bold uppercase tracking-wider ${
                    isSelected ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {robot.nombre}
                </h2>

                <div className="my-4 h-px bg-white/10" />

                <div className="text-xs text-cyan-400 tracking-wider uppercase mb-3">
                  ESTADÍSTICAS BASE
                </div>

                {/* Stat bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80">HP TOTAL</span>
                      <span className="font-bold text-emerald-400">{hp}</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(hp / 400) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80">ATAQUE</span>
                      <span className="font-bold text-red-400">{atk}</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${(atk / 50) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80">VELOCIDAD</span>
                      <span className="font-bold text-blue-400">{vel}</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(vel / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 text-center text-xs text-white/70 italic">
                "{getDescription(robot.id)}"
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation button */}
      <div className="w-full max-w-md pb-4">
        <button
          onClick={handleConfirm}
          className="w-full rounded-xl bg-amber-400 py-4 font-orbitron font-bold text-black uppercase tracking-wider text-base hover:bg-amber-300 active:scale-98 transition shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer"
        >
          CONFIRMAR SELECCIÓN
        </button>
      </div>
    </div>
  );
};

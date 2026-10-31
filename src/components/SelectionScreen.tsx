import React, { useState } from 'react';
import { STARTER_ROBOTS } from '../data/defaultData';
import { useGame } from '../context/GameContext';
import { getHpTotal, getAtaqueTotal, getVelocidadTotal } from '../types/game';
import { audioService } from '../services/audioService';
import { getRobotPortrait } from '../assets/gameAssets';
import { PilotProfileModal } from './PilotProfileModal';
import { Shield, Zap, Crosshair, UserCheck, Sparkles } from 'lucide-react';

export const SelectionScreen: React.FC = () => {
  const { seleccionarChasisInicial, pilotoActual, triggerHaptic } = useGame();
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [isPilotModalOpen, setIsPilotModalOpen] = useState(false);

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
    audioService.playSfx('click');
    triggerHaptic('light');
  };

  const handleConfirm = () => {
    audioService.playSfx('equip');
    triggerHaptic('success');
    seleccionarChasisInicial(STARTER_ROBOTS[selectedIndex]);
  };

  const getChassisMeta = (id: string) => {
    if (id.includes('striker')) {
      return {
        role: 'ASALTO // CUCHILLAS DE PLASMA',
        color: '#ef4444',
        borderSelected: 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.35)]',
        accentText: 'text-red-400',
        badgeBg: 'bg-red-500 text-black',
        desc: 'Alto riesgo, extrema potencia de fuego. Golpea primero con cuchillas energéticas dobles.',
      };
    }
    if (id.includes('bulwark')) {
      return {
        role: 'FORTALEZA // BARRERA RIOT',
        color: '#10b981',
        borderSelected: 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]',
        accentText: 'text-emerald-400',
        badgeBg: 'bg-emerald-400 text-black',
        desc: 'Una fortaleza acorazada de titanio. Escudo electromagnético y aguante brutal ante impactos.',
      };
    }
    return {
      role: 'RECON // VELOCIDAD TÁCTICA',
      color: '#f59e0b',
      borderSelected: 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)]',
      accentText: 'text-amber-400',
      badgeBg: 'bg-amber-400 text-black',
      desc: 'Versátil y de alta agilidad. Diseñado para reconocimiento de zonas hostiles y caza táctica.',
    };
  };

  const getIcon = (id: string) => {
    if (id.includes('striker')) return <Zap className="h-5 w-5 text-red-400" />;
    if (id.includes('bulwark')) return <Shield className="h-5 w-5 text-emerald-400" />;
    return <Crosshair className="h-5 w-5 text-amber-400" />;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-between p-4 md:p-8 select-none">
      {/* Header & Pilot Badge */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 pt-2 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-orbitron text-2xl md:text-3xl font-extrabold text-amber-400 tracking-wider">
            INICIANDO SISTEMAS DE CAZA
          </h1>
          <p className="mt-1 text-xs md:text-sm text-white/70">
            Configura tu enlace de piloto y selecciona tu Chasis de Despliegue Táctico
          </p>
        </div>

        {/* Cyberpunk Pilot Profile Card */}
        <div
          onClick={() => {
            audioService.playSfx('click');
            setIsPilotModalOpen(true);
          }}
          className="flex items-center gap-3 p-2 px-3 rounded-xl bg-[#141419] border border-cyan-500/40 hover:border-cyan-400 transition cursor-pointer group shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          title="Click para cambiar o personalizar piloto"
        >
          <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-cyan-400 shrink-0 bg-black">
            <img
              src={pilotoActual.avatar}
              alt={pilotoActual.nombre}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                PILOTO: {pilotoActual.callsign}
              </span>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-mono">
                EDITAR
              </span>
            </div>
            <div className="text-xs font-bold text-white truncate max-w-[140px]">
              {pilotoActual.nombre}
            </div>
            <div className="text-[10px] text-white/50 truncate max-w-[140px]">
              {pilotoActual.rango}
            </div>
          </div>
        </div>
      </div>

      {/* Frame cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
        {STARTER_ROBOTS.map((robot, index) => {
          const isSelected = index === selectedIndex;
          const hp = getHpTotal(robot);
          const atk = getAtaqueTotal(robot);
          const vel = getVelocidadTotal(robot);
          const portrait = getRobotPortrait(robot.id);
          const meta = getChassisMeta(robot.id);

          return (
            <div
              key={robot.id}
              onClick={() => handleSelect(index)}
              className={`cursor-pointer rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between border-2 overflow-hidden ${
                isSelected
                  ? `${meta.borderSelected} bg-[#18181C] scale-102`
                  : 'border-white/10 bg-[#121214] hover:border-white/30 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getIcon(robot.id)}
                    <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono">
                      CHASIS 0{index + 1}
                    </span>
                  </div>
                  {isSelected ? (
                    <span className={`text-[10px] font-bold ${meta.badgeBg} px-2 py-0.5 rounded font-orbitron`}>
                      SELECCIONADO
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-white/40">
                      DISPONIBLE
                    </span>
                  )}
                </div>

                {/* Robot Visual Portrait with Distinct Cyberpunk Artwork */}
                <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden border border-white/10 bg-black">
                  <img
                    src={portrait}
                    alt={robot.nombre}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isSelected ? 'scale-105' : 'scale-100 grayscale-30'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded backdrop-blur-xs border"
                      style={{
                        borderColor: meta.color,
                        color: meta.color,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                      }}
                    >
                      {meta.role}
                    </span>
                  </div>
                </div>

                <h2
                  className={`font-orbitron text-lg font-bold uppercase tracking-wider ${
                    isSelected ? meta.accentText : 'text-white'
                  }`}
                >
                  {robot.nombre}
                </h2>

                <div className="my-3 h-px bg-white/10" />

                <div className="text-[11px] text-cyan-400 tracking-wider uppercase mb-2 font-mono">
                  ESPECIFICACIONES BASE
                </div>

                {/* Stat bars */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80">HP TOTAL</span>
                      <span className="font-bold text-emerald-400">{hp}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
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
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
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
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(vel / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-center text-xs text-white/70 italic font-sans">
                "{meta.desc}"
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation button */}
      <div className="w-full max-w-md pb-2">
        <button
          onClick={handleConfirm}
          className="w-full rounded-xl bg-amber-400 hover:bg-amber-300 py-3.5 font-orbitron font-bold text-black uppercase tracking-wider text-sm md:text-base active:scale-98 transition shadow-[0_0_25px_rgba(251,191,36,0.4)] cursor-pointer"
        >
          DESPLEGAR CAZADOR CON PILOTO {pilotoActual.callsign}
        </button>
      </div>

      {/* Pilot Profile Modal */}
      <PilotProfileModal
        isOpen={isPilotModalOpen}
        onClose={() => setIsPilotModalOpen(false)}
      />
    </div>
  );
};


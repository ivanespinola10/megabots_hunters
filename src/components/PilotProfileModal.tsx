import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PilotData } from '../types/game';
import { audioService } from '../services/audioService';
import { User, Shield, Zap, Award, Edit3, Check, X, Sparkles, Terminal } from 'lucide-react';

interface PilotProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PilotProfileModal: React.FC<PilotProfileModalProps> = ({ isOpen, onClose }) => {
  const { pilotoActual, pilotosDisponibles, seleccionarPiloto, actualizarPerfilPiloto, triggerHaptic } = useGame();
  const [selectedPilot, setSelectedPilot] = useState<PilotData>(pilotoActual);
  const [isEditingName, setIsEditingName] = useState(false);
  const [customName, setCustomName] = useState(pilotoActual.nombre);
  const [customCallsign, setCustomCallsign] = useState(pilotoActual.callsign);

  if (!isOpen) return null;

  const handleSelectPilot = (p: PilotData) => {
    setSelectedPilot(p);
    setCustomName(p.nombre);
    setCustomCallsign(p.callsign);
    audioService.playSfx('click');
    triggerHaptic('light');
  };

  const handleConfirmActive = () => {
    seleccionarPiloto(selectedPilot);
    if (customName !== selectedPilot.nombre || customCallsign !== selectedPilot.callsign) {
      actualizarPerfilPiloto(customName.trim() || selectedPilot.nombre, customCallsign.trim() || selectedPilot.callsign);
    }
    audioService.playSfx('equip');
    triggerHaptic('success');
    onClose();
  };

  const handleSaveCustomProfile = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarPerfilPiloto(customName.trim() || selectedPilot.nombre, customCallsign.trim() || selectedPilot.callsign);
    setIsEditingName(false);
    triggerHaptic('medium');
  };

  const isCurrentActive = pilotoActual.id === selectedPilot.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0E0E12] border-2 border-cyan-500/40 rounded-2xl p-4 md:p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-orbitron text-xl md:text-2xl font-bold text-white tracking-wider">
                  REGISTRO DE PILOTOS CIBERPUNK
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  NEURAL LINK
                </span>
              </div>
              <p className="text-xs text-white/60">
                Selecciona tu enlace neural de piloto y personaliza tu firma en combate
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioService.playSfx('click');
              onClose();
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Grid: Gallery + Active Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-5">
          
          {/* Pilot Roster (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              PILOTOS DISPONIBLES ({pilotosDisponibles.length})
            </div>

            <div className="grid grid-cols-2 gap-3">
              {pilotosDisponibles.map((p) => {
                const isSelected = selectedPilot.id === p.id;
                const isActive = pilotoActual.id === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPilot(p)}
                    className={`cursor-pointer rounded-xl p-3 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]'
                        : 'border-white/10 bg-[#141419] hover:border-white/30 hover:bg-[#181820]'
                    }`}
                  >
                    {/* Active Tag */}
                    {isActive && (
                      <span className="absolute top-2 right-2 z-10 text-[9px] font-orbitron font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-black">
                        ACTIVO
                      </span>
                    )}

                    {/* Portrait Thumbnail */}
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-white/10 mb-2.5 bg-black">
                      <img
                        src={p.avatar}
                        alt={p.nombre}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isSelected ? 'scale-105' : 'scale-100 grayscale-20'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-1.5 left-2">
                        <span
                          className="text-[10px] font-orbitron font-extrabold uppercase px-1.5 py-0.5 rounded backdrop-blur-xs"
                          style={{ color: p.colorTema, backgroundColor: 'rgba(0,0,0,0.7)' }}
                        >
                          {p.callsign}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-orbitron text-sm font-bold text-white truncate">
                        {p.nombre}
                      </h3>
                      <p className="text-[11px] text-white/50 truncate">
                        {p.rango}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dossier Detail View (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-[#14141C] border border-cyan-500/20 rounded-xl p-4 flex flex-col justify-between">
            <div>
              {/* Pilot Card Large View */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 mb-4 bg-black"
                style={{ borderColor: selectedPilot.colorTema }}
              >
                <img
                  src={selectedPilot.avatar}
                  alt={selectedPilot.nombre}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3">
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded border backdrop-blur-sm"
                    style={{
                      borderColor: selectedPilot.colorTema,
                      color: selectedPilot.colorTema,
                      backgroundColor: 'rgba(0,0,0,0.75)',
                    }}
                  >
                    CALLSIGN: {selectedPilot.callsign}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-[11px] font-mono text-cyan-300">
                    {selectedPilot.rango}
                  </div>
                  <h3 className="font-orbitron text-lg font-bold text-white">
                    {selectedPilot.nombre}
                  </h3>
                </div>
              </div>

              {/* Bio & Passive Perk */}
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white/80 leading-relaxed font-sans">
                  {selectedPilot.biografia}
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2">
                  <Zap className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                      SINCRONIZACIÓN DE COMBATE
                    </div>
                    <div className="text-xs text-cyan-100 font-medium">
                      {selectedPilot.habilidadPiloto}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2">
                  <Terminal className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] italic text-white/70">
                    "{selectedPilot.fraseVictoria}"
                  </div>
                </div>
              </div>
            </div>

            {/* Customizer or Set Active Action */}
            <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
              {isEditingName ? (
                <form onSubmit={handleSaveCustomProfile} className="space-y-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50">
                      Nombre Personalizado
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      maxLength={24}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50">
                      Callsign Táctico
                    </label>
                    <input
                      type="text"
                      value={customCallsign}
                      onChange={(e) => setCustomCallsign(e.target.value)}
                      maxLength={14}
                      className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-sm font-orbitron text-amber-400 focus:outline-none focus:border-cyan-400 uppercase"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase flex items-center justify-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" /> Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs uppercase"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="px-3 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
                    title="Editar firma de llamada"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Firma
                  </button>

                  <button
                    onClick={handleConfirmActive}
                    className={`flex-1 py-2.5 rounded-xl font-orbitron font-bold text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isCurrentActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                    }`}
                  >
                    {isCurrentActive ? (
                      <>
                        <Check className="h-4 w-4" />
                        PILOTO VINCULADO
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        VINCULAR NEURALMENTE
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-white/50 font-mono">
          <span>* La calibración sináptica se refleja en tu ficha táctica compartible.</span>
          <span className="text-cyan-400">ESTADO SINÁPTICO: 100% OPERATIVO</span>
        </div>

      </div>
    </div>
  );
};

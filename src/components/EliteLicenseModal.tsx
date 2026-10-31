import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Shield, Sparkles, CheckCircle, X, Award, Zap, LockOpen } from 'lucide-react';

interface EliteLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetZoneName?: string;
}

export const EliteLicenseModal: React.FC<EliteLicenseModalProps> = ({
  isOpen,
  onClose,
  targetZoneName,
}) => {
  const {
    licenciaElite,
    comprarLicenciaElite,
    desbloquearPorMaestria,
    robotPrincipal,
  } = useGame();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = () => {
    comprarLicenciaElite();
    setSuccessMsg('¡LICENCIA ÉLITE ACTIVADA! Todos los sectores y piezas desbloqueados permanentemente.');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1800);
  };

  const handleFreeMasteryUnlock = () => {
    // Check if player has at least reached level 2 or customized their robot
    const nivel = robotPrincipal?.nivel || 1;
    if (nivel >= 2) {
      desbloquearPorMaestria();
      setSuccessMsg('¡MAESTRÍA RECONOCIDA! Has desbloqueado el pase completo por mérito de combate.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1800);
    } else {
      alert('Para desbloquear gratis por maestría, sube tu chasis al Nivel 2 en el Sector 1.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-amber-500 bg-[#141414] p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Award className="h-6 w-6 text-amber-400" />
          <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
            PROTOCOLO DE ACCESO RESTRINGIDO
          </span>
        </div>

        <h2 className="font-orbitron text-xl md:text-2xl font-black text-white tracking-wide">
          LICENCIA DE CAZADOR ÉLITE
        </h2>

        {targetZoneName && (
          <p className="mt-1 text-xs text-red-400 font-mono">
            Bloqueado: {targetZoneName} requiere credenciales de Cazador Élite.
          </p>
        )}

        <p className="mt-2 text-xs text-white/70 leading-relaxed">
          Sin suscripciones, sin trampas de vidas y sin anuncios sorpresa. Un único pase para desbloquear la experiencia completa de <strong>Megabots Hunters</strong> para siempre offline.
        </p>

        {successMsg && (
          <div className="mt-4 rounded-lg bg-emerald-950/90 border border-emerald-500 p-3 text-xs font-bold text-emerald-300 flex items-center gap-2 animate-bounce">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Benefits List */}
        <div className="mt-4 space-y-2.5 rounded-xl border border-white/10 bg-black/50 p-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Desbloqueo permanente de Sectores 2, 3 y Zona Cero (Goliath)</span>
          </div>
          <div className="flex items-center gap-2 text-amber-300">
            <Zap className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Modo Arena Infinita de Supervivencia con contador de racha</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-300">
            <Shield className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>Chasis Élite Titan Core + 250 CHTR de refacciones iniciales</span>
          </div>
          <div className="flex items-center gap-2 text-purple-300">
            <Sparkles className="h-4 w-4 shrink-0 text-purple-400" />
            <span>Mercado Negro del Sindicato siempre disponible</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <LockOpen className="h-4 w-4 shrink-0 text-white/60" />
            <span>100% Offline para siempre, compatible con Google Play Store</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {!licenciaElite ? (
            <>
              <button
                onClick={handlePurchase}
                className="w-full rounded-xl bg-amber-400 py-3.5 font-orbitron text-sm font-black text-black uppercase tracking-wider hover:bg-amber-300 active:scale-98 transition shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer"
              >
                DESBLOQUEAR TODO ($1.99 USD)
              </button>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-white/50">
                  ¿Prefieres jugar 100% gratis?
                </span>
                <button
                  onClick={handleFreeMasteryUnlock}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline font-mono"
                >
                  Desbloquear por Maestría (Nivel 2+)
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-lg bg-emerald-950/60 border border-emerald-500/50 p-3 text-center text-xs font-bold text-emerald-400">
              ✓ Tu cuenta ya posee la Licencia de Cazador Élite. Todos los sistemas están abiertos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

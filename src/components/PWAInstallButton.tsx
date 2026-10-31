import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded border border-emerald-500/50 bg-emerald-950/40 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 hover:bg-emerald-900/60 transition cursor-pointer"
        title="Instalar en tu pantalla de inicio"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">INSTALAR</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-mono text-white/80 hover:bg-white/10 transition cursor-pointer"
        >
          <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">INSTALAR PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-sm rounded-xl border border-white/20 bg-[#1a1a1a] p-5 shadow-2xl text-white">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute right-4 top-4 text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-orbitron text-sm font-bold text-amber-400 uppercase tracking-wide">
                Instalar en iPhone / iPad
              </h3>
              <p className="mt-2 text-xs text-white/70 leading-relaxed font-mono">
                1. Toca el botón <strong>Compartir</strong> en Safari.<br />
                2. Selecciona <strong>Agregar a pantalla de inicio</strong>.<br />
                3. ¡Disfruta Megabots Hunters 100% offline a pantalla completa!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded bg-amber-400 py-2 text-xs font-bold text-black uppercase"
              >
                ENTENDIDO
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

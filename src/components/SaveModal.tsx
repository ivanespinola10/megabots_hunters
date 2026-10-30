import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Copy, Download, AlertTriangle, X, Check } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose }) => {
  const { exportSave, importSave, hardReset } = useGame();
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<{ text: string; isError: boolean } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const code = exportSave();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setNotification({ text: 'Partida copiada al portapapeles', isError: false });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    if (!importCode.trim()) {
      setNotification({ text: 'Por favor pega un código válido', isError: true });
      return;
    }
    const success = importSave(importCode);
    if (success) {
      setNotification({ text: 'Partida importada con éxito', isError: false });
      setImportCode('');
      setTimeout(() => {
        onClose();
        setNotification(null);
      }, 1200);
    } else {
      setNotification({ text: 'Código inválido o corrupto', isError: true });
    }
  };

  const handleReset = () => {
    hardReset();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-lg border border-amber-500/60 bg-[#1e1e1e] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-orbitron text-lg font-bold text-amber-400">
          DATOS DE LA PARTIDA
        </h3>
        <p className="mt-2 text-xs text-white/70">
          Puedes respaldar tu partida copiando el código y guardándolo en un archivo de texto.
        </p>

        {notification && (
          <div
            className={`mt-3 rounded p-2 text-xs font-bold ${
              notification.isError
                ? 'bg-red-950/80 text-red-300 border border-red-500/50'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
            }`}
          >
            {notification.text}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <button
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-500"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? '¡CÓDIGO COPIADO!' : 'COPIAR CÓDIGO DE GUARDADO'}
          </button>

          <div className="border-t border-white/10 pt-4">
            <label className="block text-xs text-white/60 mb-1">
              Pegar código para importar:
            </label>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Pega el código Base64 aquí..."
              className="w-full h-20 rounded border border-white/20 bg-black/50 p-2 text-xs text-white focus:border-amber-400 focus:outline-hidden font-mono"
            />
            <button
              onClick={handleImport}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-500"
            >
              <Download className="h-4 w-4" />
              IMPORTAR (SOBRESCRIBIR)
            </button>
          </div>

          <div className="border-t border-red-500/30 pt-4">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex w-full items-center justify-center gap-2 rounded bg-red-950/80 border border-red-600/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-900"
              >
                <AlertTriangle className="h-4 w-4 text-red-400" />
                RESETEAR PARTIDA (BORRAR TODO)
              </button>
            ) : (
              <div className="rounded border border-red-500 bg-black/90 p-3 text-center">
                <p className="text-xs font-bold text-red-400">¿ESTÁS SEGURO?</p>
                <p className="mt-1 text-[11px] text-white/80">
                  Perderás tu robot, nivel y créditos de forma irreversible.
                </p>
                <div className="mt-3 flex gap-2 justify-center">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="rounded bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500"
                  >
                    SÍ, BORRAR
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

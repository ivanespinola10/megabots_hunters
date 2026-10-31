import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import {
  getHpTotal,
  getAtaqueTotal,
  getVelocidadTotal,
  getMarcasConteo,
} from '../types/game';
import { Download, Share2, X, Check } from 'lucide-react';

interface ShareBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareBuildModal: React.FC<ShareBuildModalProps> = ({ isOpen, onClose }) => {
  const { robotPrincipal, pilotoActual } = useGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const drawCard = useCallback(() => {
    if (!robotPrincipal || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    canvas.width = 800;
    canvas.height = 1000;

    // Background Cyberpunk Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#0a0a0a');
    bgGradient.addColorStop(0.5, '#121214');
    bgGradient.addColorStop(1, '#050505');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Outer Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inner Corner accents
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    const cornerSize = 25;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(25, 25 + cornerSize);
    ctx.lineTo(25, 25);
    ctx.lineTo(25 + cornerSize, 25);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 25 - cornerSize, 25);
    ctx.lineTo(canvas.width - 25, 25);
    ctx.lineTo(canvas.width - 25, 25 + cornerSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(25, canvas.height - 25 - cornerSize);
    ctx.lineTo(25, canvas.height - 25);
    ctx.lineTo(25 + cornerSize, canvas.height - 25);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 25 - cornerSize, canvas.height - 25);
    ctx.lineTo(canvas.width - 25, canvas.height - 25);
    ctx.lineTo(canvas.width - 25, canvas.height - 25 - cornerSize);
    ctx.stroke();

    // Header Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MEGABOTS HUNTERS // FICHA TÁCTICA DE CAZA', 50, 75);

    ctx.fillStyle = '#06b6d4';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.fillText(`PILOTO: [${pilotoActual.callsign}] ${pilotoActual.nombre.toUpperCase()} · FECHA: ${new Date().toLocaleDateString()}`, 50, 105);

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 125);
    ctx.lineTo(canvas.width - 50, 125);
    ctx.stroke();

    // Robot Name
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 36px Orbitron, sans-serif';
    ctx.fillText(robotPrincipal.nombre.toUpperCase(), 50, 180);

    // Level Badge
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px Orbitron, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`NIVEL ${robotPrincipal.nivel || 1}`, canvas.width - 50, 180);

    // Core Stats Cards
    const hp = getHpTotal(robotPrincipal);
    const atk = getAtaqueTotal(robotPrincipal);
    const vel = getVelocidadTotal(robotPrincipal);

    const statBoxWidth = 215;
    const statBoxHeight = 85;
    const statY = 220;

    // HP Box
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.fillRect(50, statY, statBoxWidth, statBoxHeight);
    ctx.strokeRect(50, statY, statBoxWidth, statBoxHeight);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px "Share Tech Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('HP TOTAL', 65, statY + 30);
    ctx.font = 'bold 32px Orbitron, sans-serif';
    ctx.fillText(`${hp}`, 65, statY + 68);

    // ATK Box
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.fillRect(290, statY, statBoxWidth, statBoxHeight);
    ctx.strokeRect(290, statY, statBoxWidth, statBoxHeight);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px "Share Tech Mono", monospace';
    ctx.fillText('ATAQUE', 305, statY + 30);
    ctx.font = 'bold 32px Orbitron, sans-serif';
    ctx.fillText(`${atk}`, 305, statY + 68);

    // VEL Box
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.fillRect(530, statY, statBoxWidth, statBoxHeight);
    ctx.strokeRect(530, statY, statBoxWidth, statBoxHeight);
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 14px "Share Tech Mono", monospace';
    ctx.fillText('VELOCIDAD', 545, statY + 30);
    ctx.font = 'bold 32px Orbitron, sans-serif';
    ctx.fillText(`${vel}`, 545, statY + 68);

    // Modules Section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CONFIGURACIÓN DE MÓDULOS EQUIPADOS', 50, 355);

    const modules = [
      { label: 'CABEZA (NÚCLEO)', mod: robotPrincipal.cabeza },
      { label: 'BRAZO IZQUIERDO', mod: robotPrincipal.brazoIzquierdo },
      { label: 'BRAZO DERECHO', mod: robotPrincipal.brazoDerecho },
      { label: 'PIERNAS', mod: robotPrincipal.piernas },
    ];

    let modY = 380;
    modules.forEach(({ label, mod }) => {
      ctx.fillStyle = '#1c1c1e';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.fillRect(50, modY, canvas.width - 100, 85);
      ctx.strokeRect(50, modY, canvas.width - 100, 85);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '12px "Share Tech Mono", monospace';
      ctx.fillText(label, 70, modY + 28);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Share Tech Mono", monospace';
      ctx.fillText(mod.nombre, 70, modY + 54);

      // Durability & Stats
      ctx.textAlign = 'right';
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 14px "Share Tech Mono", monospace';
      const statsStr = `HP: ${mod.hpActual ?? mod.hpMaximo}/${mod.hpMaximo} ${mod.bonusAtaque ? `· +${mod.bonusAtaque} ATK` : ''} ${mod.bonusVelocidad ? `· +${mod.bonusVelocidad} VEL` : ''}`;
      ctx.fillText(statsStr, canvas.width - 70, modY + 38);

      // Trait tag
      ctx.fillStyle = '#a855f7';
      ctx.font = '12px "Share Tech Mono", monospace';
      const traits = [
        mod.elemento && mod.elemento !== 'neutro' ? `[${mod.elemento.toUpperCase()}]` : null,
        mod.pasiva && mod.pasiva !== 'ninguna' ? `[${mod.pasiva.toUpperCase()}]` : null,
        mod.marca && mod.marca !== 'sinMarca' ? `[SET: ${mod.marca.toUpperCase()}]` : null,
      ].filter(Boolean).join(' ');
      if (traits) {
        ctx.fillText(traits, canvas.width - 70, modY + 62);
      }
      ctx.textAlign = 'left';

      modY += 100;
    });

    // Synergies summary
    const marcas = getMarcasConteo(robotPrincipal);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 15px Orbitron, sans-serif';
    ctx.fillText('SINERGIAS DE MARCA ACTIVAS:', 50, 810);

    ctx.font = '13px "Share Tech Mono", monospace';
    let synergyFound = false;
    let synY = 835;
    if (marcas.titanio >= 3) {
      ctx.fillStyle = '#10b981';
      ctx.fillText('★ SINERGIA TITANIO (3+ piezas): +20% HP Máximo Total', 50, synY);
      synY += 22;
      synergyFound = true;
    }
    if (marcas.oxido >= 3) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('★ SINERGIA ÓXIDO (3+ piezas): +15 Ataque Balístico Directo', 50, synY);
      synY += 22;
      synergyFound = true;
    }
    if (marcas.neon >= 3) {
      ctx.fillStyle = '#06b6d4';
      ctx.fillText('★ SINERGIA NEÓN (3+ piezas): +10 Velocidad de Propulsión', 50, synY);
      synY += 22;
      synergyFound = true;
    }
    if (!synergyFound) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText('Sin set completo de 3 piezas. Equipa 3 módulos de la misma marca.', 50, synY);
    }

    // Footer Watermark
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 915);
    ctx.lineTo(canvas.width - 50, 915);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JUEGA MEGABOTS HUNTERS EN GOOGLE PLAY STORE', canvas.width / 2, 950);

    setDataUrl(canvas.toDataURL('image/png'));
  }, [robotPrincipal]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => drawCard(), 80);
    }
  }, [isOpen, drawCard]);

  if (!isOpen || !robotPrincipal) return null;

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Megabot_${robotPrincipal.nombre.replace(/\s+/g, '_')}_Nivel${robotPrincipal.nivel || 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    const textToShare = `¡Mira mi build en Megabots Hunters! Robot: ${robotPrincipal.nombre} (Nivel ${robotPrincipal.nivel || 1}) · HP: ${getHpTotal(robotPrincipal)} · ATK: ${getAtaqueTotal(robotPrincipal)} · VEL: ${getVelocidadTotal(robotPrincipal)}.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Megabots Hunters - Build ${robotPrincipal.nombre}`,
          text: textToShare,
          url: window.location.href,
        });
      } catch {
        // Dismissed or unsupported
      }
    } else {
      navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border-2 border-amber-400 bg-[#161616] p-4 md:p-6 shadow-[0_0_35px_rgba(251,191,36,0.25)] text-white overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/50 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-orbitron text-lg font-bold text-amber-400 uppercase tracking-wider mb-1">
          FICHA TÁCTICA DE COMBATE
        </h3>
        <p className="text-xs text-white/60 mb-3">
          Genera y exporta la ficha oficial de tu Mecha para compartir tu build en redes o con amigos.
        </p>

        {/* Canvas Preview Container */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center bg-black/80 rounded-xl border border-white/10 p-2 mb-4">
          <canvas
            ref={canvasRef}
            className="w-full max-w-md h-auto rounded-lg shadow-lg border border-amber-500/40"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-xs md:text-sm font-orbitron font-bold text-black uppercase tracking-wider hover:bg-amber-300 transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>DESCARGAR PNG</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-xs md:text-sm font-orbitron font-bold text-black uppercase tracking-wider hover:bg-cyan-400 transition cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            <span>{copied ? '¡COPIADO!' : 'COMPARTIR'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

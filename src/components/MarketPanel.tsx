import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  TipoModulo,
  TipoPasiva,
  TipoElemento,
  Marca,
  HabilidadActiva,
  ModuloData,
  ItemData,
} from '../types/game';
import { audioService } from '../services/audioService';
import { Wrench, Package, Diamond, X, CheckCircle, Coins } from 'lucide-react';

export const MarketPanel: React.FC = () => {
  const {
    creditos,
    gastarCreditos,
    curarRobotCompleto,
    agregarLoot,
    mercadoNegroDisponible,
    desactivarMercadoNegro,
  } = useGame();

  const [toast, setToast] = useState<{ text: string; color: string } | null>(null);

  const showToast = (text: string, color: string) => {
    setToast({ text, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBuyKit = () => {
    if (gastarCreditos(50)) {
      curarRobotCompleto();
      audioService.playSfx('heal');
      showToast('Robot reparado al máximo.', 'border-emerald-500 text-emerald-300 bg-emerald-950/80');
    }
  };

  const handleBuyBox = () => {
    if (gastarCreditos(100)) {
      const tipos: TipoModulo[] = ['cabeza', 'brazoIzquierdo', 'brazoDerecho', 'piernas'];
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];

      let pasiva: TipoPasiva = 'ninguna';
      let prefijo = 'Chatarra de';

      if (Math.random() < 0.25) {
        const pasivas: TipoPasiva[] = ['critico', 'aturdir', 'roboDeVida'];
        pasiva = pasivas[Math.floor(Math.random() * pasivas.length)];
        prefijo = '[RARO] Pieza de';
      }

      const mod: ModuloData = {
        nombre: `${prefijo} ${tipo}`,
        tipo,
        pasiva,
        hpMaximo: 20 + Math.floor(Math.random() * 30),
        hpActual: 20 + Math.floor(Math.random() * 30),
        bonusAtaque: tipo === 'brazoIzquierdo' || tipo === 'brazoDerecho' ? Math.floor(Math.random() * 10) : 0,
        bonusVelocidad: tipo === 'piernas' ? Math.floor(Math.random() * 5) : 0,
        estado: 'intacto',
        elemento: 'neutro',
        marca: 'sinMarca',
        habilidadActiva: 'ninguna',
      };

      const nuevoItem: ItemData = {
        id: `tienda_${Date.now()}`,
        nombre: `Caja Misteriosa: ${mod.nombre}`,
        tipo: 'moduloDirecto',
        moduloAsociado: mod,
      };

      agregarLoot([nuevoItem]);
      audioService.playSfx('equip');
      showToast(`Has obtenido: ${mod.nombre}`, 'border-amber-500 text-amber-300 bg-amber-950/80');
    }
  };

  const handleBuySyndicate = () => {
    if (gastarCreditos(300)) {
      const tipos: TipoModulo[] = ['cabeza', 'brazoIzquierdo', 'brazoDerecho', 'piernas'];
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];

      const pasivas: TipoPasiva[] = ['critico', 'aturdir', 'roboDeVida'];
      const pasiva = pasivas[Math.floor(Math.random() * pasivas.length)];

      const elementos: TipoElemento[] = ['fuego', 'hielo', 'corrosivo'];
      const elemento = elementos[Math.floor(Math.random() * elementos.length)];

      const marcas: Marca[] = ['titanio', 'oxido', 'neon'];
      const marca = marcas[Math.floor(Math.random() * marcas.length)];

      const habilidades: HabilidadActiva[] = ['canonLaser', 'reparacion', 'escudo', 'ataqueRapido'];
      const habilidadActiva = habilidades[Math.floor(Math.random() * habilidades.length)];

      const maxHp = 50 + Math.floor(Math.random() * 50);

      const mod: ModuloData = {
        nombre: `[LEGENDARIO] Pieza de ${tipo}`,
        tipo,
        pasiva,
        elemento,
        marca,
        habilidadActiva,
        hpMaximo: maxHp,
        hpActual: maxHp,
        bonusAtaque: tipo === 'brazoIzquierdo' || tipo === 'brazoDerecho' ? 10 + Math.floor(Math.random() * 20) : 0,
        bonusVelocidad: tipo === 'piernas' ? 5 + Math.floor(Math.random() * 15) : 0,
        estado: 'intacto',
      };

      const nuevoItem: ItemData = {
        id: `tienda_leg_${Date.now()}`,
        nombre: `Caja del Sindicato: ${mod.nombre}`,
        tipo: 'moduloDirecto',
        moduloAsociado: mod,
      };

      agregarLoot([nuevoItem]);
      audioService.playSfx('equip');
      showToast(`Has obtenido: ${mod.nombre}`, 'border-purple-500 text-purple-300 bg-purple-950/80');
    }
  };

  return (
    <div className="h-full p-4 md:p-6 overflow-y-auto space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`p-3 rounded border text-xs font-bold flex items-center gap-2 ${toast.color}`}>
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header del Mercado */}
      <div className="rounded-xl border-2 border-amber-500 bg-black/90 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-orbitron text-xl md:text-2xl font-bold text-amber-400">
            EL MERCADER DE ÓXIDO
          </h2>
          <p className="mt-1 text-xs md:text-sm text-white/70 italic">
            "Si tiene engranajes, me interesa. ¿Qué buscas hoy, Cazador?"
          </p>
        </div>

        <div className="flex items-center gap-2 rounded border border-emerald-400/80 bg-black px-4 py-2 text-emerald-400 font-mono font-bold text-sm md:text-base">
          <Coins className="h-4 w-4" />
          <span>CHTR: {creditos}</span>
        </div>
      </div>

      {/* Black Market Container */}
      {mercadoNegroDisponible && (
        <div className="rounded-xl border-2 border-purple-500 bg-purple-950/30 p-4 md:p-5 relative shadow-[0_0_20px_rgba(168,85,247,0.2)]">
          <button
            onClick={desactivarMercadoNegro}
            className="absolute right-3 top-3 text-white/50 hover:text-white"
            title="Cerrar oferta"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 text-purple-400 font-orbitron font-bold text-sm md:text-base">
            <Diamond className="h-5 w-5 animate-pulse" />
            <span>&gt;&gt;&gt; MERCADO NEGRO ENCONTRADO &lt;&lt;&lt;</span>
          </div>
          <p className="mt-1 text-xs text-white/60">
            Oferta por tiempo limitado. Al salir de la ciudad o cerrar desaparecerá.
          </p>

          <div className="mt-3 rounded-lg border border-purple-400/40 bg-black/60 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Diamond className="h-6 w-6 text-purple-400" />
                <h3 className="font-orbitron text-base font-bold text-white">
                  Caja del Sindicato
                </h3>
              </div>
              <p className="mt-1 text-xs text-white/70">
                Garantiza pieza Épica/Legendaria (Marca + Elemento + Habilidad + Pasiva).
              </p>
            </div>

            <button
              onClick={handleBuySyndicate}
              disabled={creditos < 300}
              className={`rounded px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition ${
                creditos >= 300
                  ? 'bg-purple-500 text-black hover:bg-purple-400 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {creditos >= 300 ? 'COMPRAR (300 CHTR)' : 'FONDOS INSUFICIENTES (300 CHTR)'}
            </button>
          </div>
        </div>
      )}

      {/* Normal Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product 1: Repair Kit */}
        <div className="rounded-xl border border-white/10 bg-[#151515] p-5 flex flex-col justify-between hover:border-white/20 transition">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-6 w-6 text-emerald-400" />
              <h3 className="font-orbitron text-base font-bold text-white">
                Kit de Reparación
              </h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              Restaura el 100% de HP a todos los módulos de tu chasis actual. Indispensable antes de cazar jefes.
            </p>
          </div>

          <button
            onClick={handleBuyKit}
            disabled={creditos < 50}
            className={`w-full rounded py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
              creditos >= 50
                ? 'bg-amber-400 text-black hover:bg-amber-300 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {creditos >= 50 ? 'COMPRAR (50 CHTR)' : 'FONDOS INSUFICIENTES'}
          </button>
        </div>

        {/* Product 2: Mystery Scrap Box */}
        <div className="rounded-xl border border-white/10 bg-[#151515] p-5 flex flex-col justify-between hover:border-white/20 transition">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-6 w-6 text-amber-400" />
              <h3 className="font-orbitron text-base font-bold text-white">
                Caja de Chatarra
              </h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              Contiene una pieza misteriosa de refacción de refacciones de emergencia. 25% de probabilidad de pasiva especial.
            </p>
          </div>

          <button
            onClick={handleBuyBox}
            disabled={creditos < 100}
            className={`w-full rounded py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition ${
              creditos >= 100
                ? 'bg-amber-400 text-black hover:bg-amber-300 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {creditos >= 100 ? 'COMPRAR (100 CHTR)' : 'FONDOS INSUFICIENTES'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { WorldZone, RobotData, ModuloData, TipoModulo, HabilidadActiva, BattleEvent } from '../types/game';
import { useGame } from '../context/GameContext';
import { useBattleEngine } from '../hooks/useBattleEngine';
import { audioService } from '../services/audioService';
import { Flame, Snowflake, Skull, Zap, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

interface BattleScreenProps {
  zona: WorldZone;
  onExit: () => void;
}

interface FloatingNumber {
  id: string;
  monto: number;
  esCura: boolean;
  objetivoEsJugador: boolean;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ zona, onExit }) => {
  const {
    robotPrincipal,
    enemigosDisponibles,
    agregarLoot,
    agregarCreditos,
    ganarXpYGuardar,
    rollMercadoNegro,
    isMuted,
    toggleMute,
  } = useGame();

  const [playerShaking, setPlayerShaking] = useState(false);
  const [enemyShaking, setEnemyShaking] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);

  // Submenu modals
  const [showAttackModal, setShowAttackModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [pendingSkill, setPendingSkill] = useState<{ hab: HabilidadActiva; mod: ModuloData } | null>(null);

  const handleAnimationEvent = useCallback((event: BattleEvent) => {
    if (event.monto > 0 && !event.esCura) {
      if (event.objetivoEsJugador) {
        setPlayerShaking(true);
        setTimeout(() => setPlayerShaking(false), 350);
      } else {
        setEnemyShaking(true);
        setTimeout(() => setEnemyShaking(false), 350);
      }
    }

    const newId = `${Date.now()}_${Math.random()}`;
    setFloatingNumbers((prev) => [
      ...prev,
      {
        id: newId,
        monto: event.monto,
        esCura: event.esCura,
        objetivoEsJugador: event.objetivoEsJugador,
      },
    ]);

    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((item) => item.id !== newId));
    }, 1200);
  }, []);

  const {
    jugador,
    enemigo,
    isPlayerTurn,
    battleEnded,
    resultadoFinal,
    lootGenerado,
    creditosGenerados,
    xpGenerada,
    logCombate,
    initCombate,
    ataqueJugador,
    usarHabilidadJugador,
    usarBitSoporte,
  } = useBattleEngine(handleAnimationEvent);

  useEffect(() => {
    if (robotPrincipal) {
      const enemyId = zona.enemigosIds.length > 0 ? zona.enemigosIds[0] : 'e_scrapper';
      initCombate(robotPrincipal, enemyId, enemigosDisponibles);

      if (zona.nombreBioma.includes('JEFE')) {
        audioService.playBgm('boss');
      } else {
        audioService.playBgm('battle');
      }
    }

    return () => {
      audioService.playBgm('hub');
    };
  }, [zona, robotPrincipal, enemigosDisponibles, initCombate]);

  const handleBattleReturn = () => {
    agregarLoot(lootGenerado);
    agregarCreditos(creditosGenerados);
    ganarXpYGuardar(xpGenerada);

    if (resultadoFinal === 'VICTORIA') {
      rollMercadoNegro();
    }

    onExit();
  };

  if (!jugador || !enemigo) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-amber-400 font-orbitron">
        CONECTANDO SISTEMAS DE COMBATE...
      </div>
    );
  }

  const renderModuleBar = (modulo: ModuloData, isPlayer: boolean) => {
    const isDestroyed = modulo.estado === 'destruido';
    const hpCur = modulo.hpActual ?? modulo.hpMaximo;
    const pct = Math.max(0, Math.min(1, hpCur / modulo.hpMaximo));

    return (
      <div key={modulo.tipo} className="mb-2.5">
        <div className={`flex items-center justify-between text-xs mb-1 ${isPlayer ? '' : 'flex-row-reverse'}`}>
          <div className="flex items-center gap-1.5">
            {modulo.elemento === 'fuego' && <Flame className="h-3 w-3 text-orange-400" />}
            {modulo.elemento === 'hielo' && <Snowflake className="h-3 w-3 text-cyan-300" />}
            {modulo.elemento === 'corrosivo' && <Skull className="h-3 w-3 text-emerald-400" />}
            <span className={`font-mono text-[11px] ${isDestroyed ? 'text-red-500 line-through' : 'text-white'}`}>
              {modulo.nombre}
            </span>
          </div>
          <span className={`text-[11px] font-mono font-bold ${isDestroyed ? 'text-red-500' : isPlayer ? 'text-cyan-400' : 'text-amber-400'}`}>
            {hpCur}/{modulo.hpMaximo}
          </span>
        </div>

        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isDestroyed ? 'bg-red-600' : isPlayer ? 'bg-cyan-400' : 'bg-amber-400'
            }`}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>
    );
  };

  const habilidadesDisponibles = [
    jugador.cabeza,
    jugador.brazoIzquierdo,
    jugador.brazoDerecho,
    jugador.piernas,
  ].filter((m) => m.estado !== 'destruido' && m.habilidadActiva && m.habilidadActiva !== 'ninguna');

  return (
    <div
      className="relative flex flex-col h-screen overflow-hidden select-none"
      style={{ backgroundColor: zona.fondoVisual || '#111111' }}
    >
      {/* Top Combat Bar */}
      <div className="flex items-center justify-between bg-black/85 border-b border-white/10 px-4 py-2.5 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-white/50 hover:text-white text-xs mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">RETIRADA</span>
          </button>
          <span className="font-orbitron font-bold text-sm md:text-base text-red-500 tracking-wider">
            COMBATE - {zona.nombreBioma}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-2 py-0.5 rounded text-xs font-orbitron font-bold ${
            isPlayerTurn ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}>
            {isPlayerTurn ? 'TU TURNO' : 'TURNO ENEMIGO'}
          </div>

          <button
            onClick={toggleMute}
            className="rounded p-1 text-white/60 hover:text-white"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Robot Panels & Floating Numbers */}
      <div className="flex-3 grid grid-cols-2 relative p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
        {/* Player Robot Panel */}
        <div
          className={`rounded-xl border border-cyan-500/30 bg-black/75 p-3 md:p-4 flex flex-col justify-between backdrop-blur-xs transition-transform ${
            playerShaking ? 'shake border-red-500 bg-red-950/40' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400">
                  SISTEMA ALIADO
                </span>
                <h2 className="font-orbitron text-base md:text-xl font-bold text-cyan-400">
                  {jugador.nombre}
                </h2>
              </div>
              <span className="text-xs font-mono text-white/60">
                NIVEL {jugador.nivel || 1}
              </span>
            </div>

            {/* Energy Meter */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-mono font-bold text-orange-400 mb-1">
                <span>ENERGÍA</span>
                <span>{jugador.energiaActual ?? 100}/{jugador.energiaMax ?? 100}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-300"
                  style={{ width: `${((jugador.energiaActual ?? 100) / (jugador.energiaMax ?? 100)) * 100}%` }}
                />
              </div>
            </div>

            {/* Modules */}
            {renderModuleBar(jugador.cabeza, true)}
            {renderModuleBar(jugador.brazoIzquierdo, true)}
            {renderModuleBar(jugador.brazoDerecho, true)}
            {renderModuleBar(jugador.piernas, true)}
          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-white/60 flex justify-between">
            <span>ATK: {jugador.baseAtaque || 10}</span>
            <span>VEL: {jugador.baseVelocidad || 5}</span>
          </div>
        </div>

        {/* Enemy Robot Panel */}
        <div
          className={`rounded-xl border border-amber-500/30 bg-black/75 p-3 md:p-4 flex flex-col justify-between backdrop-blur-xs transition-transform ${
            enemyShaking ? 'shake border-red-500 bg-red-950/40' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2 mb-3 flex-row-reverse text-right">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400">
                  OBJETIVO HOSTIL
                </span>
                <h2 className="font-orbitron text-base md:text-xl font-bold text-amber-400">
                  {enemigo.nombre}
                </h2>
              </div>
              <span className="text-xs font-mono text-white/60">
                NIVEL {enemigo.nivel || 1}
              </span>
            </div>

            {/* Spacer to match layout */}
            <div className="h-6 mb-2" />

            {/* Modules */}
            {renderModuleBar(enemigo.cabeza, false)}
            {renderModuleBar(enemigo.brazoIzquierdo, false)}
            {renderModuleBar(enemigo.brazoDerecho, false)}
            {renderModuleBar(enemigo.piernas, false)}
          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-white/60 flex justify-between flex-row-reverse">
            <span>ATK: {enemigo.baseAtaque || 10}</span>
            <span>VEL: {enemigo.baseVelocidad || 5}</span>
          </div>
        </div>

        {/* Floating Numbers Overlay */}
        {floatingNumbers.map((fn) => (
          <div
            key={fn.id}
            className={`pointer-events-none absolute top-1/3 transform -translate-x-1/2 -translate-y-1/2 font-orbitron font-extrabold text-3xl md:text-5xl animate-bounce drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] ${
              fn.objetivoEsJugador ? 'left-1/4' : 'left-3/4'
            } ${fn.esCura ? 'text-emerald-400' : 'text-red-500'}`}
          >
            {fn.esCura ? `+${fn.monto}` : `-${fn.monto}`}
          </div>
        ))}
      </div>

      {/* Battle Log Box */}
      <div className="flex-1 bg-black/90 border-t border-b border-emerald-500/30 p-2 md:p-3 overflow-y-auto font-mono text-xs text-emerald-400 scanlines flex flex-col-reverse">
        {logCombate.map((log, idx) => (
          <div key={idx} className="py-0.5 leading-tight">
            {log}
          </div>
        ))}
      </div>

      {/* Action Controls Bar */}
      <div className="bg-[#111111] border-t border-white/10 p-3 md:p-4 z-20">
        {battleEnded ? (
          <button
            onClick={handleBattleReturn}
            className={`w-full rounded-xl py-3 font-orbitron text-base font-bold uppercase tracking-wider transition cursor-pointer shadow-lg ${
              resultadoFinal === 'VICTORIA'
                ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-amber-400/20'
                : 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/20'
            }`}
          >
            VOLVER AL HUB ({resultadoFinal})
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-xl mx-auto">
            <button
              onClick={() => setShowAttackModal(true)}
              disabled={!isPlayerTurn}
              className="rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-orbitron text-xs md:text-sm font-bold py-3 uppercase tracking-wider transition cursor-pointer shadow-md shadow-red-600/20"
            >
              ATACAR
            </button>

            <button
              onClick={() => setShowSkillModal(true)}
              disabled={!isPlayerTurn}
              className="rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-orbitron text-xs md:text-sm font-bold py-3 uppercase tracking-wider transition cursor-pointer shadow-md shadow-amber-500/20"
            >
              HABILIDAD
            </button>

            <button
              onClick={usarBitSoporte}
              disabled={!isPlayerTurn}
              className="rounded-lg bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-black font-orbitron text-xs md:text-sm font-bold py-3 uppercase tracking-wider transition cursor-pointer shadow-md shadow-cyan-400/20"
            >
              SOPORTE
            </button>
          </div>
        )}
      </div>

      {/* Attack Target Modal */}
      {showAttackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-red-500/60 bg-[#1e1e1e] p-5 shadow-2xl">
            <h3 className="font-orbitron text-sm font-bold text-red-400 uppercase tracking-wider mb-4 text-center">
              SELECCIONAR OBJETIVO (ATAQUE BÁSICO)
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowAttackModal(false);
                  ataqueJugador('cabeza');
                }}
                className="w-full rounded bg-[#282828] hover:bg-red-950/80 hover:border-red-500 border border-white/10 p-3 text-left font-mono text-xs text-white flex justify-between items-center transition"
              >
                <span>Cabeza (Núcleo)</span>
                <span className="text-[11px] text-white/50">{enemigo.cabeza.hpActual}/{enemigo.cabeza.hpMaximo} HP</span>
              </button>

              <button
                onClick={() => {
                  setShowAttackModal(false);
                  ataqueJugador('brazoIzquierdo');
                }}
                className="w-full rounded bg-[#282828] hover:bg-red-950/80 hover:border-red-500 border border-white/10 p-3 text-left font-mono text-xs text-white flex justify-between items-center transition"
              >
                <span>Brazo Izquierdo</span>
                <span className="text-[11px] text-white/50">{enemigo.brazoIzquierdo.hpActual}/{enemigo.brazoIzquierdo.hpMaximo} HP</span>
              </button>

              <button
                onClick={() => {
                  setShowAttackModal(false);
                  ataqueJugador('brazoDerecho');
                }}
                className="w-full rounded bg-[#282828] hover:bg-red-950/80 hover:border-red-500 border border-white/10 p-3 text-left font-mono text-xs text-white flex justify-between items-center transition"
              >
                <span>Brazo Derecho</span>
                <span className="text-[11px] text-white/50">{enemigo.brazoDerecho.hpActual}/{enemigo.brazoDerecho.hpMaximo} HP</span>
              </button>

              <button
                onClick={() => {
                  setShowAttackModal(false);
                  ataqueJugador('piernas');
                }}
                className="w-full rounded bg-[#282828] hover:bg-red-950/80 hover:border-red-500 border border-white/10 p-3 text-left font-mono text-xs text-white flex justify-between items-center transition"
              >
                <span>Piernas</span>
                <span className="text-[11px] text-white/50">{enemigo.piernas.hpActual}/{enemigo.piernas.hpMaximo} HP</span>
              </button>
            </div>

            <button
              onClick={() => setShowAttackModal(false)}
              className="mt-4 w-full rounded bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20 uppercase"
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {/* Skills Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-amber-500/60 bg-[#1e1e1e] p-5 shadow-2xl">
            <h3 className="font-orbitron text-sm font-bold text-amber-400 uppercase tracking-wider mb-2 text-center">
              HABILIDADES ACTIVAS (30 ENERGÍA)
            </h3>
            <p className="text-[11px] text-center text-white/60 mb-4">
              Energía actual: {jugador.energiaActual ?? 100}
            </p>

            <div className="space-y-2">
              {habilidadesDisponibles.length === 0 ? (
                <div className="p-4 text-center text-xs text-white/50">
                  NO HAY HABILIDADES DISPONIBLES EN LOS MÓDULOS ACTIVOS
                </div>
              ) : (
                habilidadesDisponibles.map((mod) => (
                  <button
                    key={`${mod.tipo}_${mod.habilidadActiva}`}
                    onClick={() => {
                      setShowSkillModal(false);
                      if (mod.habilidadActiva === 'reparacion' || mod.habilidadActiva === 'escudo') {
                        usarHabilidadJugador(mod.habilidadActiva, mod, 'cabeza');
                      } else if (mod.habilidadActiva) {
                        setPendingSkill({ hab: mod.habilidadActiva, mod });
                      }
                    }}
                    className="w-full rounded bg-[#282828] hover:bg-amber-950/80 hover:border-amber-400 border border-white/10 p-3 text-left transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white uppercase font-orbitron">
                        {mod.habilidadActiva}
                      </div>
                      <div className="text-[10px] text-white/50">
                        De: {mod.nombre}
                      </div>
                    </div>
                    <Zap className="h-4 w-4 text-amber-400" />
                  </button>
                ))
              )}
            </div>

            <button
              onClick={() => setShowSkillModal(false)}
              className="mt-4 w-full rounded bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20 uppercase"
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {/* Offensive Skill Target Selection Modal */}
      {pendingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-amber-500/60 bg-[#1e1e1e] p-5 shadow-2xl">
            <h3 className="font-orbitron text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 text-center">
              OBJETIVO PARA {pendingSkill.hab.toUpperCase()}
            </h3>

            <div className="space-y-2">
              {(['cabeza', 'brazoIzquierdo', 'brazoDerecho', 'piernas'] as TipoModulo[]).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => {
                    usarHabilidadJugador(pendingSkill.hab, pendingSkill.mod, tipo);
                    setPendingSkill(null);
                  }}
                  className="w-full rounded bg-[#282828] hover:bg-amber-950/80 hover:border-amber-400 border border-white/10 p-3 text-left font-mono text-xs text-white uppercase transition"
                >
                  {tipo === 'cabeza' ? 'Cabeza (Núcleo)' : tipo === 'brazoIzquierdo' ? 'Brazo Izquierdo' : tipo === 'brazoDerecho' ? 'Brazo Derecho' : 'Piernas'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPendingSkill(null)}
              className="mt-4 w-full rounded bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20 uppercase"
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

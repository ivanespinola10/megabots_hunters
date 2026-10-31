import React, { useState, useEffect, useCallback } from 'react';
import { WorldZone, ModuloData, TipoModulo, HabilidadActiva, BattleEvent } from '../types/game';
import { useGame } from '../context/GameContext';
import { useBattleEngine } from '../hooks/useBattleEngine';
import { audioService } from '../services/audioService';
import { getRobotPortrait, GAME_ASSETS } from '../assets/gameAssets';
import { Flame, Snowflake, Skull, Zap, Volume2, VolumeX, ArrowLeft, Radio, Trophy, Check } from 'lucide-react';

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
    triggerHaptic,
    actualizarArenaRacha,
    pilotoActual,
  } = useGame();

  const [playerShaking, setPlayerShaking] = useState(false);
  const [enemyShaking, setEnemyShaking] = useState(false);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  const [laserActive, setLaserActive] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [satelliteBonusClaimed, setSatelliteBonusClaimed] = useState(false);
  const [bonusMultiplier, setBonusMultiplier] = useState(1);

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
    arenaWave,
    isArenaMode,
    initCombate,
    ataqueJugador,
    usarHabilidadJugador,
    usarBitSoporte,
  } = useBattleEngine(handleAnimationEvent, triggerHaptic);

  useEffect(() => {
    if (robotPrincipal) {
      const enemyId = zona.enemigosIds.length > 0 ? zona.enemigosIds[0] : 'e_rust_raptor';
      initCombate(robotPrincipal, enemyId, enemigosDisponibles, !!zona.esArena);

      if (zona.nombreBioma.includes('Jefe') || zona.nombreBioma.includes('JEFE')) {
        audioService.playBgm('boss');
      } else {
        audioService.playBgm('battle');
      }
    }

    return () => {
      audioService.playBgm('hub');
    };
  }, [zona, robotPrincipal, enemigosDisponibles, initCombate]);

  // Monitor turn changes to trigger enemy attack animation
  useEffect(() => {
    if (!isPlayerTurn && !battleEnded) {
      const timer = setTimeout(() => {
        setEnemyAttacking(true);
        setTimeout(() => setEnemyAttacking(false), 450);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, battleEnded]);

  const handlePlayerAttackWithAnimation = (tipo: TipoModulo) => {
    setPlayerAttacking(true);
    setTimeout(() => setPlayerAttacking(false), 450);
    ataqueJugador(tipo);
  };

  const handlePlayerSkillWithAnimation = (hab: HabilidadActiva, mod: ModuloData, tipo: TipoModulo) => {
    if (hab === 'canonLaser') {
      setLaserActive(true);
      setTimeout(() => setLaserActive(false), 500);
    } else if (hab === 'escudo' || hab === 'reparacion') {
      setShieldActive(true);
      setTimeout(() => setShieldActive(false), 800);
    } else {
      setPlayerAttacking(true);
      setTimeout(() => setPlayerAttacking(false), 450);
    }
    usarHabilidadJugador(hab, mod, tipo);
  };

  const handleSatelliteBroadcast = () => {
    if (satelliteBonusClaimed) return;
    setSatelliteBonusClaimed(true);
    setBonusMultiplier(2);
    audioService.playSfx('levelup');
    triggerHaptic('success');
  };

  const handleBattleReturn = () => {
    const finalLoot = bonusMultiplier > 1 ? [...lootGenerado, ...lootGenerado] : lootGenerado;
    const finalCreds = creditosGenerados * bonusMultiplier;
    const finalXp = xpGenerada * bonusMultiplier;

    agregarLoot(finalLoot);
    agregarCreditos(finalCreds);
    ganarXpYGuardar(finalXp);

    if (isArenaMode) {
      actualizarArenaRacha(arenaWave);
    }

    if (resultadoFinal.includes('VICTORIA') || (isArenaMode && arenaWave >= 2)) {
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

  const playerImg = getRobotPortrait(jugador.id);
  const enemyImg = getRobotPortrait(enemigo.id);

  const renderModuleBar = (modulo: ModuloData, isPlayer: boolean) => {
    const isDestroyed = modulo.estado === 'destruido';
    const hpCur = modulo.hpActual ?? modulo.hpMaximo;
    const pct = Math.max(0, Math.min(1, hpCur / modulo.hpMaximo));

    return (
      <div key={modulo.tipo} className="mb-2">
        <div className={`flex items-center justify-between text-xs mb-0.5 ${isPlayer ? '' : 'flex-row-reverse'}`}>
          <div className="flex items-center gap-1">
            {modulo.elemento === 'fuego' && <Flame className="h-3 w-3 text-orange-400" />}
            {modulo.elemento === 'hielo' && <Snowflake className="h-3 w-3 text-cyan-300" />}
            {modulo.elemento === 'corrosivo' && <Skull className="h-3 w-3 text-emerald-400" />}
            <span className={`font-mono text-[10px] md:text-xs truncate max-w-[110px] md:max-w-none ${isDestroyed ? 'text-red-500 line-through' : 'text-white'}`}>
              {modulo.nombre}
            </span>
          </div>
          <span className={`text-[10px] md:text-xs font-mono font-bold ${isDestroyed ? 'text-red-500' : isPlayer ? 'text-cyan-400' : 'text-amber-400'}`}>
            {hpCur}/{modulo.hpMaximo}
          </span>
        </div>

        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
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
    <div className="relative flex flex-col h-screen overflow-hidden select-none bg-black">
      {/* Background Graphic with Vignette Scrim */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
        style={{ backgroundImage: `url(${GAME_ASSETS.crimsonWastelandBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80 pointer-events-none" />

      {/* Laser Cannon Animation Beam */}
      {laserActive && (
        <div className="absolute top-1/2 left-1/4 right-1/4 h-6 -translate-y-1/2 bg-gradient-to-r from-cyan-400 via-white to-amber-400 rounded-full shadow-[0_0_30px_#06b6d4] z-30 animate-laser pointer-events-none" />
      )}

      {/* Top Combat Bar */}
      <div className="relative flex items-center justify-between bg-black/85 border-b border-white/10 px-3 md:px-4 py-2 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-white/50 hover:text-white text-xs mr-1 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">RETIRADA</span>
          </button>
          <span className="font-orbitron font-bold text-xs md:text-sm text-red-500 tracking-wider truncate">
            {isArenaMode ? `ARENA · OLEADA ${arenaWave}` : `COMBATE · ${zona.nombreBioma}`}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {isArenaMode && (
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
              <Trophy className="h-3.5 w-3.5" />
              <span>RÉCORD: {arenaWave}</span>
            </div>
          )}

          <div className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-orbitron font-bold ${
            isPlayerTurn ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}>
            {isPlayerTurn ? 'TU TURNO' : 'ENEMIGO'}
          </div>

          <button
            onClick={toggleMute}
            className="rounded p-1 text-white/60 hover:text-white"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Arena Viewport: Robot Figures & Floating Damage */}
      <div className="relative flex-1 grid grid-cols-2 p-2 md:p-4 gap-2 md:gap-4 overflow-hidden z-10">
        {/* Left: Player Robot */}
        <div
          className={`rounded-xl border border-cyan-500/40 bg-black/75 p-3 flex flex-col justify-between backdrop-blur-xs transition-all duration-300 ${
            playerShaking ? 'shake border-red-500 bg-red-950/40' : ''
          } ${playerAttacking ? 'animate-lunge-player' : ''} ${shieldActive ? 'animate-shield' : ''}`}
        >
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5 mb-2">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400 shrink-0 bg-black">
                  <img
                    src={pilotoActual.avatar}
                    alt={pilotoActual.callsign}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
                      {pilotoActual.callsign}
                    </span>
                    <span className="text-[8px] text-white/40 font-mono">
                      NV.{jugador.nivel || 1}
                    </span>
                  </div>
                  <h2 className="font-orbitron text-xs md:text-sm font-bold text-white truncate max-w-[110px] md:max-w-none">
                    {jugador.nombre}
                  </h2>
                </div>
              </div>
            </div>

            {/* Visual Portrait */}
            <div className="relative w-full h-24 md:h-36 mb-2 rounded-lg overflow-hidden border border-cyan-400/30 bg-black flex items-center justify-center">
              <img
                src={playerImg}
                alt={jugador.nombre}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-1 left-2 text-[9px] font-mono text-cyan-300">
                ESCUDOS ACTIVOS
              </div>
            </div>

            {/* Energy */}
            <div className="mb-2">
              <div className="flex justify-between text-[9px] font-mono font-bold text-orange-400 mb-0.5">
                <span>ENERGÍA</span>
                <span>{jugador.energiaActual ?? 100}/{jugador.energiaMax ?? 100}</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
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

          <div className="pt-1.5 border-t border-white/10 text-[10px] font-mono text-white/60 flex justify-between">
            <span>ATK: {jugador.baseAtaque || 10}</span>
            <span>VEL: {jugador.baseVelocidad || 5}</span>
          </div>
        </div>

        {/* Right: Hostile Enemy Robot */}
        <div
          className={`rounded-xl border border-amber-500/40 bg-black/75 p-3 flex flex-col justify-between backdrop-blur-xs transition-all duration-300 ${
            enemyShaking ? 'shake border-red-500 bg-red-950/40' : ''
          } ${enemyAttacking ? 'animate-lunge-enemy' : ''}`}
        >
          <div>
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5 mb-2 flex-row-reverse text-right">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-widest text-amber-400">
                  HOSTIL
                </span>
                <h2 className="font-orbitron text-xs md:text-base font-bold text-amber-400 truncate max-w-[120px] md:max-w-none">
                  {enemigo.nombre}
                </h2>
              </div>
              <span className="text-[10px] font-mono text-white/60">
                NV.{enemigo.nivel || 1}
              </span>
            </div>

            {/* Visual Portrait */}
            <div className="relative w-full h-24 md:h-36 mb-2 rounded-lg overflow-hidden border border-amber-400/30 bg-black flex items-center justify-center">
              <img
                src={enemyImg}
                alt={enemigo.nombre}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-1 right-2 text-[9px] font-mono text-amber-300">
                SISTEMA VIRAL
              </div>
            </div>

            <div className="h-4 mb-1" />

            {/* Modules */}
            {renderModuleBar(enemigo.cabeza, false)}
            {renderModuleBar(enemigo.brazoIzquierdo, false)}
            {renderModuleBar(enemigo.brazoDerecho, false)}
            {renderModuleBar(enemigo.piernas, false)}
          </div>

          <div className="pt-1.5 border-t border-white/10 text-[10px] font-mono text-white/60 flex justify-between flex-row-reverse">
            <span>ATK: {enemigo.baseAtaque || 10}</span>
            <span>VEL: {enemigo.baseVelocidad || 5}</span>
          </div>
        </div>

        {/* Floating Numbers Overlay */}
        {floatingNumbers.map((fn) => (
          <div
            key={fn.id}
            className={`pointer-events-none absolute top-1/3 transform -translate-x-1/2 -translate-y-1/2 font-orbitron font-black text-3xl md:text-5xl animate-bounce drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] z-40 ${
              fn.objetivoEsJugador ? 'left-1/4' : 'left-3/4'
            } ${fn.esCura ? 'text-emerald-400' : 'text-red-500'}`}
          >
            {fn.esCura ? `+${fn.monto}` : `-${fn.monto}`}
          </div>
        ))}
      </div>

      {/* Battle Log Terminal */}
      <div className="h-28 bg-black/90 border-t border-b border-emerald-500/30 p-2 md:p-3 overflow-y-auto font-mono text-xs text-emerald-400 scanlines flex flex-col-reverse z-10">
        {logCombate.map((log, idx) => (
          <div key={idx} className="py-0.5 leading-tight">
            {log}
          </div>
        ))}
      </div>

      {/* Action Controls Bar */}
      <div className="bg-[#111111] border-t border-white/10 p-2.5 md:p-3 z-20 space-y-2">
        {battleEnded ? (
          <div className="space-y-2 max-w-xl mx-auto">
            {!satelliteBonusClaimed && (
              <button
                onClick={handleSatelliteBroadcast}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-950/80 border border-purple-500/60 py-2.5 px-4 font-mono text-xs text-purple-300 hover:bg-purple-900 transition cursor-pointer"
              >
                <Radio className="h-4 w-4 animate-pulse text-purple-400" />
                <span>Sintonizar transmisión satelital (DUPLICAR CHATARRA Y XP x2)</span>
              </button>
            )}

            {satelliteBonusClaimed && (
              <div className="rounded border border-emerald-500/50 bg-emerald-950/50 p-2 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                <span>¡Recompensa duplicada por transmisión satelital! (x2)</span>
              </div>
            )}

            {resultadoFinal.includes('VICTORIA') && (
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-black/70 border border-cyan-500/30 text-xs text-white/90 font-mono">
                <img
                  src={pilotoActual.avatar}
                  alt={pilotoActual.nombre}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-cyan-400 shrink-0"
                />
                <div className="text-left">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">
                    ENLACE TÁCTICO // {pilotoActual.callsign}:
                  </span>
                  <p className="italic text-white/80">"{pilotoActual.fraseVictoria}"</p>
                </div>
              </div>
            )}

            <button
              onClick={handleBattleReturn}
              className={`w-full rounded-xl py-3 font-orbitron text-sm md:text-base font-bold uppercase tracking-wider transition cursor-pointer shadow-lg ${
                resultadoFinal.includes('VICTORIA') || isArenaMode
                  ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-amber-400/20'
                  : 'bg-red-600 text-white hover:bg-red-500 shadow-red-600/20'
              }`}
            >
              VOLVER AL HUB ({resultadoFinal})
            </button>
          </div>
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
              {(['cabeza', 'brazoIzquierdo', 'brazoDerecho', 'piernas'] as TipoModulo[]).map((tipo) => {
                const mod = tipo === 'cabeza' ? enemigo.cabeza : tipo === 'brazoIzquierdo' ? enemigo.brazoIzquierdo : tipo === 'brazoDerecho' ? enemigo.brazoDerecho : enemigo.piernas;
                const isDestroyed = mod.estado === 'destruido';
                return (
                  <button
                    key={tipo}
                    onClick={() => {
                      setShowAttackModal(false);
                      handlePlayerAttackWithAnimation(tipo);
                    }}
                    className={`w-full rounded bg-[#282828] hover:bg-red-950/80 hover:border-red-500 border border-white/10 p-3 text-left font-mono text-xs flex justify-between items-center transition cursor-pointer ${
                      isDestroyed ? 'opacity-50 text-red-400' : 'text-white'
                    }`}
                  >
                    <span>{tipo === 'cabeza' ? 'Cabeza (Núcleo)' : tipo === 'brazoIzquierdo' ? 'Brazo Izquierdo' : tipo === 'brazoDerecho' ? 'Brazo Derecho' : 'Piernas'}</span>
                    <span className="text-[11px] text-white/50">{mod.hpActual}/{mod.hpMaximo} HP</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowAttackModal(false)}
              className="mt-4 w-full rounded bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20 uppercase cursor-pointer"
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
                        handlePlayerSkillWithAnimation(mod.habilidadActiva, mod, 'cabeza');
                      } else if (mod.habilidadActiva) {
                        setPendingSkill({ hab: mod.habilidadActiva, mod });
                      }
                    }}
                    className="w-full rounded bg-[#282828] hover:bg-amber-950/80 hover:border-amber-400 border border-white/10 p-3 text-left transition flex items-center justify-between cursor-pointer"
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
              className="mt-4 w-full rounded bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20 uppercase cursor-pointer"
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
                    handlePlayerSkillWithAnimation(pendingSkill.hab, pendingSkill.mod, tipo);
                    setPendingSkill(null);
                  }}
                  className="w-full rounded bg-[#282828] hover:bg-amber-950/80 hover:border-amber-400 border border-white/10 p-3 text-left font-mono text-xs text-white uppercase transition cursor-pointer"
                >
                  {tipo === 'cabeza' ? 'Cabeza (Núcleo)' : tipo === 'brazoIzquierdo' ? 'Brazo Izquierdo' : tipo === 'brazoDerecho' ? 'Brazo Derecho' : 'Piernas'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPendingSkill(null)}
              className="mt-4 w-full rounded bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20 uppercase cursor-pointer"
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

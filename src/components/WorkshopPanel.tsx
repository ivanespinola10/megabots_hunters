import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  getAtaqueTotal,
  getVelocidadTotal,
  getXpRequerida,
  ModuloData,
  getMarcasConteo,
} from '../types/game';
import { getRobotPortrait } from '../assets/gameAssets';
import { ShareBuildModal } from './ShareBuildModal';
import { EliteLicenseModal } from './EliteLicenseModal';
import { Wrench, Shield, Zap, Sparkles, Flame, Snowflake, Skull, Share2, Award } from 'lucide-react';

export const WorkshopPanel: React.FC = () => {
  const { robotPrincipal, inventario, equiparDesdeInventario, licenciaElite } = useGame();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);

  if (!robotPrincipal) {
    return (
      <div className="flex h-full items-center justify-center text-white/50">
        No hay robot principal seleccionado.
      </div>
    );
  }

  const nivel = robotPrincipal.nivel || 1;
  const xpActual = robotPrincipal.xpActual || 0;
  const xpReq = getXpRequerida(nivel);
  const xpProgress = nivel === 20 ? 1 : Math.min(1, xpActual / xpReq);
  const atkTotal = getAtaqueTotal(robotPrincipal);
  const velTotal = getVelocidadTotal(robotPrincipal);
  const marcas = getMarcasConteo(robotPrincipal);
  const robotImg = getRobotPortrait(robotPrincipal.id);

  const renderModuleCard = (label: string, modulo: ModuloData) => {
    const isDestroyed = modulo.estado === 'destruido';
    const hpActual = modulo.hpActual ?? modulo.hpMaximo;

    return (
      <div
        key={label}
        className="mb-2 rounded border border-white/10 bg-[#161616] p-2.5 transition hover:border-white/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              {label}
            </span>
            <span className={`text-xs font-bold ${isDestroyed ? 'line-through text-red-500' : 'text-white'}`}>
              {modulo.nombre}
            </span>
          </div>
          <span className={`text-xs font-mono font-bold ${isDestroyed ? 'text-red-400' : 'text-cyan-400'}`}>
            HP: {hpActual}/{modulo.hpMaximo}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
          {modulo.bonusAtaque ? (
            <span className="rounded bg-red-950/60 border border-red-500/40 px-1.5 py-0.5 text-red-300">
              +{modulo.bonusAtaque} ATK
            </span>
          ) : null}
          {modulo.bonusVelocidad ? (
            <span className="rounded bg-blue-950/60 border border-blue-500/40 px-1.5 py-0.5 text-blue-300">
              +{modulo.bonusVelocidad} VEL
            </span>
          ) : null}
          {modulo.elemento && modulo.elemento !== 'neutro' && (
            <span className="inline-flex items-center gap-0.5 rounded bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 text-amber-300">
              {modulo.elemento === 'fuego' && <Flame className="h-3 w-3 text-orange-400" />}
              {modulo.elemento === 'hielo' && <Snowflake className="h-3 w-3 text-blue-300" />}
              {modulo.elemento === 'corrosivo' && <Skull className="h-3 w-3 text-emerald-400" />}
              {modulo.elemento.toUpperCase()}
            </span>
          )}
          {modulo.pasiva && modulo.pasiva !== 'ninguna' && (
            <span className="inline-flex items-center gap-0.5 rounded bg-purple-950/60 border border-purple-500/40 px-1.5 py-0.5 text-purple-300">
              <Sparkles className="h-3 w-3" />
              {modulo.pasiva.toUpperCase()}
            </span>
          )}
          {modulo.marca && modulo.marca !== 'sinMarca' && (
            <span className="rounded bg-zinc-800 border border-white/20 px-1.5 py-0.5 text-zinc-300">
              SET: {modulo.marca.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto">
      {/* Panel Izquierdo: Estadísticas del Robot Actual */}
      <div className="rounded-lg border border-white/10 bg-[#121212] p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-white/50">ROBOT ACTIVO</span>
                {licenciaElite ? (
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                    ÉLITE
                  </span>
                ) : (
                  <button
                    onClick={() => setLicenseModalOpen(true)}
                    className="text-[9px] bg-white/10 text-white/70 hover:text-amber-400 hover:border-amber-400 border border-white/20 px-1.5 py-0.5 rounded font-mono transition cursor-pointer"
                  >
                    + MEJORAR A ÉLITE
                  </button>
                )}
              </div>
              <h2 className="font-orbitron text-lg md:text-xl font-bold text-cyan-400 tracking-wide">
                {robotPrincipal.nombre}
              </h2>
            </div>
            <div className="text-right">
              <span className="font-orbitron text-sm font-bold text-amber-400">
                NIVEL {nivel}/20
              </span>
              <p className="text-[11px] text-white/60">
                XP: {xpActual} / {xpReq}
              </p>
            </div>
          </div>

          {/* Visual Mech Garage Banner */}
          <div className="relative w-full h-36 mb-3 rounded-lg overflow-hidden border border-cyan-500/30 bg-black flex items-center justify-center">
            <img
              src={robotImg}
              alt={robotPrincipal.nombre}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center animate-float opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/30 pointer-events-none" />
            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-400 bg-black/70 px-2 py-0.5 rounded border border-cyan-500/30">
              SISTEMAS OPERATIVOS EN LÍNEA
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-4">
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${xpProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded border border-red-500/30 bg-red-950/20 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <Zap className="h-4 w-4 text-red-400" />
                <span>ATAQUE TOTAL</span>
              </div>
              <span className="font-orbitron text-lg font-bold text-red-400">{atkTotal}</span>
            </div>

            <div className="rounded border border-blue-500/30 bg-blue-950/20 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <Shield className="h-4 w-4 text-blue-400" />
                <span>VELOCIDAD TOTAL</span>
              </div>
              <span className="font-orbitron text-lg font-bold text-blue-400">{velTotal}</span>
            </div>
          </div>

          {/* Set bonuses status */}
          <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-white/60">
            {marcas.titanio >= 3 && (
              <span className="rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-2 py-0.5">
                ★ Sinergia Titanio (+20% HP Máx)
              </span>
            )}
            {marcas.oxido >= 3 && (
              <span className="rounded bg-red-950/80 border border-red-500 text-red-300 px-2 py-0.5">
                ★ Sinergia Óxido (+15 Ataque)
              </span>
            )}
            {marcas.neon >= 3 && (
              <span className="rounded bg-cyan-950/80 border border-cyan-500 text-cyan-300 px-2 py-0.5">
                ★ Sinergia Neón (+10 Velocidad)
              </span>
            )}
          </div>

          {/* Equipped Modules list */}
          <div className="text-xs font-mono text-white/70 uppercase mb-2 flex items-center gap-1">
            <Wrench className="h-3.5 w-3.5 text-amber-400" />
            MÓDULOS EQUIPADOS
          </div>

          {renderModuleCard('Cabeza (Núcleo)', robotPrincipal.cabeza)}
          {renderModuleCard('Brazo Izq', robotPrincipal.brazoIzquierdo)}
          {renderModuleCard('Brazo Der', robotPrincipal.brazoDerecho)}
          {renderModuleCard('Piernas', robotPrincipal.piernas)}
        </div>

        {/* Viral Share Build Button */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            onClick={() => setShareModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-300 py-2.5 font-orbitron text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>GENERAR FICHA DE COMBATE</span>
          </button>
        </div>
      </div>

      {/* Panel Derecho: Inventario y Piezas */}
      <div className="rounded-lg border border-white/10 bg-[#121212] p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <h2 className="font-orbitron text-lg font-bold text-amber-400 tracking-wide">
            INVENTARIO Y PIEZAS
          </h2>
          <span className="text-xs text-white/50">
            {inventario.length} {inventario.length === 1 ? 'pieza' : 'piezas'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {inventario.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-xs text-white/40">
              <p>Inventario vacío.</p>
              <p className="mt-1">Incursiona en las zonas para desmantelar enemigos y recolectar refacciones.</p>
            </div>
          ) : (
            inventario.map((item) => {
              const mod = item.moduloAsociado;
              return (
                <div
                  key={item.id}
                  className="rounded border border-white/10 bg-[#1a1a1a] p-3 flex items-center justify-between gap-3 hover:border-amber-400/50 transition"
                >
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-white">{item.nombre}</h3>
                    {mod && (
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-white/60">
                        {mod.tipo && (
                          <span className="text-amber-400 uppercase font-mono">
                            [{mod.tipo}]
                          </span>
                        )}
                        <span>HP: {mod.hpMaximo}</span>
                        {mod.bonusAtaque ? <span className="text-red-400">+{mod.bonusAtaque} ATK</span> : null}
                        {mod.bonusVelocidad ? <span className="text-blue-400">+{mod.bonusVelocidad} VEL</span> : null}
                        {mod.elemento && mod.elemento !== 'neutro' && (
                          <span className="text-orange-400">{mod.elemento.toUpperCase()}</span>
                        )}
                        {mod.pasiva && mod.pasiva !== 'ninguna' && (
                          <span className="text-purple-400">{mod.pasiva.toUpperCase()}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => equiparDesdeInventario(item)}
                    disabled={!mod}
                    className="shrink-0 rounded bg-amber-400 px-3 py-1.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-amber-300 disabled:opacity-50 transition cursor-pointer"
                  >
                    EQUIPAR
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ShareBuildModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      <EliteLicenseModal
        isOpen={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
      />
    </div>
  );
};

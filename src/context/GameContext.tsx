import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { RobotData, ItemData, WorldZone, PilotData, cloneRobot, getBaseAtaque, getBaseVelocidad, getEnergiaMax, getXpRequerida, ModuloData } from '../types/game';
import { DEFAULT_ENEMIES, DEFAULT_ZONES, DEFAULT_PILOTS, TITAN_ELITE_CHASSIS } from '../data/defaultData';
import { audioService } from '../services/audioService';

interface GameContextType {
  robotPrincipal: RobotData | null;
  inventario: ItemData[];
  creditos: number;
  mercadoNegroDisponible: boolean;
  zonasDisponibles: WorldZone[];
  enemigosDisponibles: RobotData[];
  pilotoActual: PilotData;
  pilotosDisponibles: PilotData[];
  isLoadingData: boolean;
  isMuted: boolean;
  licenciaElite: boolean;
  arenaRacha: number;
  puedeReclamarDiaria: boolean;
  toggleMute: () => void;
  seleccionarChasisInicial: (seleccion: RobotData) => void;
  seleccionarPiloto: (piloto: PilotData) => void;
  actualizarPerfilPiloto: (nombre: string, callsign: string) => void;
  curarRobotCompleto: () => void;
  agregarLoot: (items: ItemData[]) => void;
  equiparDesdeInventario: (item: ItemData) => void;
  agregarCreditos: (cantidad: number) => void;
  gastarCreditos: (cantidad: number) => boolean;
  rollMercadoNegro: () => void;
  desactivarMercadoNegro: () => void;
  ganarXpYGuardar: (cantidad: number) => boolean;
  comprarLicenciaElite: () => void;
  desbloquearPorMaestria: () => void;
  actualizarArenaRacha: (racha: number) => void;
  reclamarRecompensaDiaria: () => boolean;
  triggerHaptic: (tipo: 'light' | 'medium' | 'heavy' | 'success') => void;
  exportSave: () => string;
  importSave: (base64Save: string) => boolean;
  hardReset: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const SAVE_KEY = 'megabots_save';

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [robotPrincipal, setRobotPrincipal] = useState<RobotData | null>(null);
  const [inventario, setInventario] = useState<ItemData[]>([]);
  const [creditos, setCreditos] = useState<number>(0);
  const [mercadoNegroDisponible, setMercadoNegroDisponible] = useState<boolean>(false);
  const [zonasDisponibles] = useState<WorldZone[]>(DEFAULT_ZONES);
  const [enemigosDisponibles] = useState<RobotData[]>(DEFAULT_ENEMIES);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());
  const [licenciaElite, setLicenciaElite] = useState<boolean>(false);
  const [arenaRacha, setArenaRacha] = useState<number>(0);
  const [ultimaRecompensaDiaria, setUltimaRecompensaDiaria] = useState<string>('');
  const [pilotoActual, setPilotoActual] = useState<PilotData>(DEFAULT_PILOTS[0]);
  const [pilotosDisponibles] = useState<PilotData[]>(DEFAULT_PILOTS);

  const todayStr = new Date().toISOString().split('T')[0];
  const puedeReclamarDiaria = ultimaRecompensaDiaria !== todayStr;

  const toggleMute = () => {
    const updated = audioService.toggleMute();
    setIsMuted(updated);
  };

  const triggerHaptic = (tipo: 'light' | 'medium' | 'heavy' | 'success') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (tipo === 'light') navigator.vibrate(15);
        else if (tipo === 'medium') navigator.vibrate(35);
        else if (tipo === 'heavy') navigator.vibrate([40, 30, 40]);
        else if (tipo === 'success') navigator.vibrate([30, 50, 60]);
      } catch {
        // Ignore haptics restriction
      }
    }
  };

  const saveToStorage = useCallback((
    curCreditos: number,
    curInventario: ItemData[],
    curRobot: RobotData | null,
    curMercadoNegro: boolean,
    curLicencia: boolean,
    curArenaRacha: number,
    curRecompensaDiaria: string,
    curPiloto?: PilotData
  ) => {
    try {
      const saveData = {
        creditos: curCreditos,
        inventario: curInventario,
        robotPrincipal: curRobot,
        mercadoNegroDisponible: curMercadoNegro,
        licenciaElite: curLicencia,
        arenaRacha: curArenaRacha,
        ultimaRecompensaDiaria: curRecompensaDiaria,
        pilotoActual: curPiloto || pilotoActual,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error('Error saving game data', e);
    }
  }, [pilotoActual]);

  const seleccionarPiloto = useCallback((nuevoPiloto: PilotData) => {
    setPilotoActual(nuevoPiloto);
    audioService.playSfx('equip');
    triggerHaptic('medium');
    saveToStorage(creditos, inventario, robotPrincipal, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria, nuevoPiloto);
  }, [creditos, inventario, robotPrincipal, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria, saveToStorage]);

  const actualizarPerfilPiloto = useCallback((nombre: string, callsign: string) => {
    setPilotoActual((prev) => {
      const updated: PilotData = { ...prev, nombre, callsign };
      saveToStorage(creditos, inventario, robotPrincipal, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria, updated);
      return updated;
    });
    audioService.playSfx('click');
  }, [creditos, inventario, robotPrincipal, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria, saveToStorage]);

  const curarRobotCompleto = useCallback(() => {
    setRobotPrincipal((prev) => {
      if (!prev) return null;
      const healed: RobotData = {
        ...prev,
        cabeza: prev.cabeza.estado !== 'destruido' ? { ...prev.cabeza, hpActual: prev.cabeza.hpMaximo } : { ...prev.cabeza },
        brazoIzquierdo: prev.brazoIzquierdo.estado !== 'destruido' ? { ...prev.brazoIzquierdo, hpActual: prev.brazoIzquierdo.hpMaximo } : { ...prev.brazoIzquierdo },
        brazoDerecho: prev.brazoDerecho.estado !== 'destruido' ? { ...prev.brazoDerecho, hpActual: prev.brazoDerecho.hpMaximo } : { ...prev.brazoDerecho },
        piernas: prev.piernas.estado !== 'destruido' ? { ...prev.piernas, hpActual: prev.piernas.hpMaximo } : { ...prev.piernas },
        energiaActual: prev.energiaMax ?? getEnergiaMax(prev.nivel || 1),
      };
      saveToStorage(creditos, inventario, healed, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria);
      return healed;
    });
  }, [creditos, inventario, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria, saveToStorage]);

  useEffect(() => {
    const init = async () => {
      try {
        const savedString = localStorage.getItem(SAVE_KEY);
        if (savedString) {
          const parsed = JSON.parse(savedString);
          if (parsed.creditos !== undefined) setCreditos(parsed.creditos);
          if (parsed.mercadoNegroDisponible !== undefined) setMercadoNegroDisponible(parsed.mercadoNegroDisponible);
          if (parsed.licenciaElite !== undefined) setLicenciaElite(parsed.licenciaElite);
          if (parsed.arenaRacha !== undefined) setArenaRacha(parsed.arenaRacha);
          if (parsed.ultimaRecompensaDiaria !== undefined) setUltimaRecompensaDiaria(parsed.ultimaRecompensaDiaria);
          if (parsed.pilotoActual) setPilotoActual(parsed.pilotoActual);
          if (Array.isArray(parsed.inventario)) setInventario(parsed.inventario);
          if (parsed.robotPrincipal) {
            const loadedRobot = cloneRobot(parsed.robotPrincipal);
            if (loadedRobot.cabeza.estado !== 'destruido') loadedRobot.cabeza.hpActual = loadedRobot.cabeza.hpMaximo;
            if (loadedRobot.brazoIzquierdo.estado !== 'destruido') loadedRobot.brazoIzquierdo.hpActual = loadedRobot.brazoIzquierdo.hpMaximo;
            if (loadedRobot.brazoDerecho.estado !== 'destruido') loadedRobot.brazoDerecho.hpActual = loadedRobot.brazoDerecho.hpMaximo;
            if (loadedRobot.piernas.estado !== 'destruido') loadedRobot.piernas.hpActual = loadedRobot.piernas.hpMaximo;
            loadedRobot.energiaActual = loadedRobot.energiaMax ?? getEnergiaMax(loadedRobot.nivel || 1);
            setRobotPrincipal(loadedRobot);
          }
        }
      } catch (err) {
        console.error('Error loading game data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    init();
  }, []);

  const seleccionarChasisInicial = (seleccion: RobotData) => {
    const clone = cloneRobot(seleccion);
    setRobotPrincipal(clone);
    saveToStorage(creditos, inventario, clone, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria);
  };

  const agregarLoot = (items: ItemData[]) => {
    setInventario((prev) => {
      const next = [...prev, ...items];
      saveToStorage(creditos, next, robotPrincipal, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria);
      return next;
    });
  };

  const equiparDesdeInventario = (item: ItemData) => {
    if (!robotPrincipal || item.tipo !== 'moduloDirecto' || !item.moduloAsociado) return;
    const nuevoModulo: ModuloData = { ...item.moduloAsociado };
    const nextRobot: RobotData = { ...robotPrincipal };

    if (nuevoModulo.tipo === 'cabeza') nextRobot.cabeza = nuevoModulo;
    else if (nuevoModulo.tipo === 'brazoIzquierdo') nextRobot.brazoIzquierdo = nuevoModulo;
    else if (nuevoModulo.tipo === 'brazoDerecho') nextRobot.brazoDerecho = nuevoModulo;
    else if (nuevoModulo.tipo === 'piernas') nextRobot.piernas = nuevoModulo;

    const nextInventario = inventario.filter((i) => i.id !== item.id);
    setRobotPrincipal(nextRobot);
    setInventario(nextInventario);
    audioService.playSfx('equip');
    triggerHaptic('medium');
    saveToStorage(creditos, nextInventario, nextRobot, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria);
  };

  const agregarCreditos = (cantidad: number) => {
    setCreditos((prev) => {
      const next = prev + cantidad;
      saveToStorage(next, inventario, robotPrincipal, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria);
      return next;
    });
  };

  const gastarCreditos = (cantidad: number): boolean => {
    if (creditos >= cantidad) {
      const next = creditos - cantidad;
      setCreditos(next);
      saveToStorage(next, inventario, robotPrincipal, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria);
      return true;
    }
    return false;
  };

  const desactivarMercadoNegro = () => {
    setMercadoNegroDisponible(false);
    saveToStorage(creditos, inventario, robotPrincipal, false, licenciaElite, arenaRacha, ultimaRecompensaDiaria);
  };

  const rollMercadoNegro = () => {
    if (!mercadoNegroDisponible) {
      if (Math.random() < 0.20 || licenciaElite) {
        setMercadoNegroDisponible(true);
        saveToStorage(creditos, inventario, robotPrincipal, true, licenciaElite, arenaRacha, ultimaRecompensaDiaria);
      }
    }
  };

  const ganarXpYGuardar = (cantidad: number): boolean => {
    if (!robotPrincipal) return false;
    let nivel = robotPrincipal.nivel ?? 1;
    let xpActual = (robotPrincipal.xpActual ?? 0) + cantidad;
    let subioNivel = false;

    if (nivel < 20) {
      let xpReq = getXpRequerida(nivel);
      while (xpActual >= xpReq && nivel < 20) {
        xpActual -= xpReq;
        nivel++;
        subioNivel = true;
        xpReq = getXpRequerida(nivel);
      }
      if (nivel === 20) xpActual = 0;
    }

    const nextRobot: RobotData = {
      ...robotPrincipal,
      nivel,
      xpActual,
      baseAtaque: getBaseAtaque(nivel),
      baseVelocidad: getBaseVelocidad(nivel),
      energiaMax: getEnergiaMax(nivel),
    };

    setRobotPrincipal(nextRobot);
    saveToStorage(creditos, inventario, nextRobot, mercadoNegroDisponible, licenciaElite, arenaRacha, ultimaRecompensaDiaria);
    if (subioNivel) {
      audioService.playSfx('levelup');
      triggerHaptic('success');
    }
    return subioNivel;
  };

  const comprarLicenciaElite = () => {
    setLicenciaElite(true);
    setCreditos((prev) => {
      const next = prev + 250;
      // Add legendary Titan parts into inventory
      const titanItems: ItemData[] = [
        {
          id: `item_titan_head_${Date.now()}`,
          nombre: `Módulo Élite: ${TITAN_ELITE_CHASSIS.cabeza.nombre}`,
          tipo: 'moduloDirecto',
          moduloAsociado: TITAN_ELITE_CHASSIS.cabeza,
        },
        {
          id: `item_titan_arm_${Date.now()}`,
          nombre: `Módulo Élite: ${TITAN_ELITE_CHASSIS.brazoIzquierdo.nombre}`,
          tipo: 'moduloDirecto',
          moduloAsociado: TITAN_ELITE_CHASSIS.brazoIzquierdo,
        },
      ];
      const nextInv = [...inventario, ...titanItems];
      setInventario(nextInv);
      saveToStorage(next, nextInv, robotPrincipal, true, true, arenaRacha, ultimaRecompensaDiaria);
      return next;
    });
    audioService.playSfx('victory');
    triggerHaptic('success');
  };

  const desbloquearPorMaestria = () => {
    setLicenciaElite(true);
    saveToStorage(creditos, inventario, robotPrincipal, mercadoNegroDisponible, true, arenaRacha, ultimaRecompensaDiaria);
    audioService.playSfx('victory');
    triggerHaptic('success');
  };

  const actualizarArenaRacha = (racha: number) => {
    if (racha > arenaRacha) {
      setArenaRacha(racha);
      saveToStorage(creditos, inventario, robotPrincipal, mercadoNegroDisponible, licenciaElite, racha, ultimaRecompensaDiaria);
    }
  };

  const reclamarRecompensaDiaria = (): boolean => {
    if (!puedeReclamarDiaria) return false;
    const bonus = 75;
    const nextCreds = creditos + bonus;
    setCreditos(nextCreds);
    setUltimaRecompensaDiaria(todayStr);
    saveToStorage(nextCreds, inventario, robotPrincipal, mercadoNegroDisponible, licenciaElite, arenaRacha, todayStr);
    audioService.playSfx('heal');
    triggerHaptic('light');
    return true;
  };

  const exportSave = (): string => {
    const saveData = {
      creditos,
      inventario,
      robotPrincipal,
      mercadoNegroDisponible,
      licenciaElite,
      arenaRacha,
      ultimaRecompensaDiaria,
    };
    const jsonStr = JSON.stringify(saveData);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  };

  const importSave = (base64Save: string): boolean => {
    try {
      const jsonStr = decodeURIComponent(escape(atob(base64Save.trim())));
      const parsed = JSON.parse(jsonStr);

      const nextCreditos = parsed.creditos ?? 0;
      const nextMercado = parsed.mercadoNegroDisponible ?? false;
      const nextLicencia = parsed.licenciaElite ?? false;
      const nextArenaRacha = parsed.arenaRacha ?? 0;
      const nextDiaria = parsed.ultimaRecompensaDiaria ?? '';
      const nextInventario: ItemData[] = Array.isArray(parsed.inventario) ? parsed.inventario : [];
      let nextRobot: RobotData | null = null;
      let nextPiloto: PilotData = DEFAULT_PILOTS[0];

      if (parsed.pilotoActual) {
        nextPiloto = parsed.pilotoActual;
      }

      if (parsed.robotPrincipal) {
        nextRobot = cloneRobot(parsed.robotPrincipal);
        if (nextRobot.cabeza.estado !== 'destruido') nextRobot.cabeza.hpActual = nextRobot.cabeza.hpMaximo;
        if (nextRobot.brazoIzquierdo.estado !== 'destruido') nextRobot.brazoIzquierdo.hpActual = nextRobot.brazoIzquierdo.hpMaximo;
        if (nextRobot.brazoDerecho.estado !== 'destruido') nextRobot.brazoDerecho.hpActual = nextRobot.brazoDerecho.hpMaximo;
        if (nextRobot.piernas.estado !== 'destruido') nextRobot.piernas.hpActual = nextRobot.piernas.hpMaximo;
        nextRobot.energiaActual = nextRobot.energiaMax ?? getEnergiaMax(nextRobot.nivel || 1);
      }

      setCreditos(nextCreditos);
      setMercadoNegroDisponible(nextMercado);
      setLicenciaElite(nextLicencia);
      setArenaRacha(nextArenaRacha);
      setUltimaRecompensaDiaria(nextDiaria);
      setInventario(nextInventario);
      setRobotPrincipal(nextRobot);
      setPilotoActual(nextPiloto);
      saveToStorage(nextCreditos, nextInventario, nextRobot, nextMercado, nextLicencia, nextArenaRacha, nextDiaria, nextPiloto);
      return true;
    } catch (e) {
      console.error('Failed to import save code:', e);
      return false;
    }
  };

  const hardReset = () => {
    localStorage.removeItem(SAVE_KEY);
    setCreditos(0);
    setInventario([]);
    setRobotPrincipal(null);
    setMercadoNegroDisponible(false);
    setLicenciaElite(false);
    setArenaRacha(0);
    setUltimaRecompensaDiaria('');
    setPilotoActual(DEFAULT_PILOTS[0]);
  };

  return (
    <GameContext.Provider
      value={{
        robotPrincipal,
        inventario,
        creditos,
        mercadoNegroDisponible,
        zonasDisponibles,
        enemigosDisponibles,
        pilotoActual,
        pilotosDisponibles,
        isLoadingData,
        isMuted,
        licenciaElite,
        arenaRacha,
        puedeReclamarDiaria,
        toggleMute,
        seleccionarChasisInicial,
        seleccionarPiloto,
        actualizarPerfilPiloto,
        curarRobotCompleto,
        agregarLoot,
        equiparDesdeInventario,
        agregarCreditos,
        gastarCreditos,
        rollMercadoNegro,
        desactivarMercadoNegro,
        ganarXpYGuardar,
        comprarLicenciaElite,
        desbloquearPorMaestria,
        actualizarArenaRacha,
        reclamarRecompensaDiaria,
        triggerHaptic,
        exportSave,
        importSave,
        hardReset,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

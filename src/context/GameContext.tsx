import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { RobotData, ItemData, WorldZone, cloneRobot, getBaseAtaque, getBaseVelocidad, getEnergiaMax, getXpRequerida, ModuloData } from '../types/game';
import { DEFAULT_ENEMIES, DEFAULT_ZONES } from '../data/defaultData';
import { audioService } from '../services/audioService';

interface GameContextType {
  robotPrincipal: RobotData | null;
  inventario: ItemData[];
  creditos: number;
  mercadoNegroDisponible: boolean;
  zonasDisponibles: WorldZone[];
  enemigosDisponibles: RobotData[];
  isLoadingData: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  seleccionarChasisInicial: (seleccion: RobotData) => void;
  curarRobotCompleto: () => void;
  agregarLoot: (items: ItemData[]) => void;
  equiparDesdeInventario: (item: ItemData) => void;
  agregarCreditos: (cantidad: number) => void;
  gastarCreditos: (cantidad: number) => boolean;
  rollMercadoNegro: () => void;
  desactivarMercadoNegro: () => void;
  ganarXpYGuardar: (cantidad: number) => boolean;
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
  const [zonasDisponibles, setZonasDisponibles] = useState<WorldZone[]>(DEFAULT_ZONES);
  const [enemigosDisponibles, setEnemigosDisponibles] = useState<RobotData[]>(DEFAULT_ENEMIES);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());

  const toggleMute = () => {
    const updated = audioService.toggleMute();
    setIsMuted(updated);
  };

  const saveToStorage = useCallback((
    curCreditos: number,
    curInventario: ItemData[],
    curRobot: RobotData | null,
    curMercadoNegro: boolean
  ) => {
    try {
      const saveData = {
        creditos: curCreditos,
        inventario: curInventario,
        robotPrincipal: curRobot,
        mercadoNegroDisponible: curMercadoNegro,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error('Error saving game data', e);
    }
  }, []);

  // Heals non-destroyed modules to 100% HP
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
      saveToStorage(creditos, inventario, healed, mercadoNegroDisponible);
      return healed;
    });
  }, [creditos, inventario, mercadoNegroDisponible, saveToStorage]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const savedString = localStorage.getItem(SAVE_KEY);
        if (savedString) {
          const parsed = JSON.parse(savedString);
          if (parsed.creditos !== undefined) setCreditos(parsed.creditos);
          if (parsed.mercadoNegroDisponible !== undefined) setMercadoNegroDisponible(parsed.mercadoNegroDisponible);
          if (Array.isArray(parsed.inventario)) setInventario(parsed.inventario);
          if (parsed.robotPrincipal) {
            const loadedRobot = cloneRobot(parsed.robotPrincipal);
            // Auto-heal non-destroyed parts on load, matching original Flutter behavior
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
    saveToStorage(creditos, inventario, clone, mercadoNegroDisponible);
  };

  const agregarLoot = (items: ItemData[]) => {
    setInventario((prev) => {
      const next = [...prev, ...items];
      saveToStorage(creditos, next, robotPrincipal, mercadoNegroDisponible);
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
    saveToStorage(creditos, nextInventario, nextRobot, mercadoNegroDisponible);
  };

  const agregarCreditos = (cantidad: number) => {
    setCreditos((prev) => {
      const next = prev + cantidad;
      saveToStorage(next, inventario, robotPrincipal, mercadoNegroDisponible);
      return next;
    });
  };

  const gastarCreditos = (cantidad: number): boolean => {
    if (creditos >= cantidad) {
      const next = creditos - cantidad;
      setCreditos(next);
      saveToStorage(next, inventario, robotPrincipal, mercadoNegroDisponible);
      return true;
    }
    return false;
  };

  const desactivarMercadoNegro = () => {
    setMercadoNegroDisponible(false);
    saveToStorage(creditos, inventario, robotPrincipal, false);
  };

  const rollMercadoNegro = () => {
    if (!mercadoNegroDisponible) {
      if (Math.random() < 0.20) {
        setMercadoNegroDisponible(true);
        saveToStorage(creditos, inventario, robotPrincipal, true);
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
    saveToStorage(creditos, inventario, nextRobot, mercadoNegroDisponible);
    if (subioNivel) {
      audioService.playSfx('levelup');
    }
    return subioNivel;
  };

  const exportSave = (): string => {
    const saveData = {
      creditos,
      inventario,
      robotPrincipal,
      mercadoNegroDisponible,
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
      const nextInventario: ItemData[] = Array.isArray(parsed.inventario) ? parsed.inventario : [];
      let nextRobot: RobotData | null = null;

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
      setInventario(nextInventario);
      setRobotPrincipal(nextRobot);
      saveToStorage(nextCreditos, nextInventario, nextRobot, nextMercado);
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
        isLoadingData,
        isMuted,
        toggleMute,
        seleccionarChasisInicial,
        curarRobotCompleto,
        agregarLoot,
        equiparDesdeInventario,
        agregarCreditos,
        gastarCreditos,
        rollMercadoNegro,
        desactivarMercadoNegro,
        ganarXpYGuardar,
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

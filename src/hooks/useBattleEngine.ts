import { useState, useCallback, useRef } from 'react';
import {
  RobotData,
  ModuloData,
  TipoModulo,
  TipoElemento,
  HabilidadActiva,
  TipoPasiva,
  ItemData,
  BattleEvent,
  getModulos,
  getAtaqueTotal,
  getVelocidadTotal,
  getPasivasActivas,
  isDerrotado,
  cloneRobot,
} from '../types/game';
import { audioService } from '../services/audioService';

export function useBattleEngine(
  onAnimationEvent?: (event: BattleEvent) => void
) {
  const [jugador, setJugador] = useState<RobotData | null>(null);
  const [enemigo, setEnemigo] = useState<RobotData | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [battleEnded, setBattleEnded] = useState<boolean>(false);
  const [resultadoFinal, setResultadoFinal] = useState<string>('');
  const [lootGenerado, setLootGenerado] = useState<ItemData[]>([]);
  const [creditosGenerados, setCreditosGenerados] = useState<number>(0);
  const [xpGenerada, setXpGenerada] = useState<number>(0);
  const [logCombate, setLogCombate] = useState<string[]>([]);

  // Status effects
  const turnosQuemadoJugador = useRef<number>(0);
  const turnosQuemadoEnemigo = useRef<number>(0);
  const turnosHieloJugador = useRef<number>(0);
  const turnosHieloEnemigo = useRef<number>(0);

  const agregarLog = useCallback((mensaje: string) => {
    setLogCombate((prev) => [mensaje, ...prev.slice(0, 19)]);
  }, []);

  const verificarEvasion = (velAtacante: number, velDefensor: number): boolean => {
    if (velDefensor > velAtacante) {
      let chance = (velDefensor - velAtacante) * 0.05;
      if (chance > 0.5) chance = 0.5;
      return Math.random() < chance;
    }
    return false;
  };

  const getModuloPorTipo = (r: RobotData, tipo: TipoModulo): ModuloData => {
    switch (tipo) {
      case 'cabeza': return r.cabeza;
      case 'brazoIzquierdo': return r.brazoIzquierdo;
      case 'brazoDerecho': return r.brazoDerecho;
      case 'piernas': return r.piernas;
    }
  };

  const setModuloPorTipo = (r: RobotData, tipo: TipoModulo, nuevo: ModuloData): RobotData => {
    const next = { ...r };
    if (tipo === 'cabeza') next.cabeza = nuevo;
    else if (tipo === 'brazoIzquierdo') next.brazoIzquierdo = nuevo;
    else if (tipo === 'brazoDerecho') next.brazoDerecho = nuevo;
    else if (tipo === 'piernas') next.piernas = nuevo;
    return next;
  };

  const initCombate = useCallback((
    pJugador: RobotData,
    enemigoId: string,
    enemigosDisponibles: RobotData[]
  ) => {
    const baseEnemy = enemigosDisponibles.find((e) => e.id === enemigoId) || enemigosDisponibles[0];
    const cloneEnemigo = cloneRobot(baseEnemy);
    const cloneJugador = cloneRobot(pJugador);

    setJugador(cloneJugador);
    setEnemigo(cloneEnemigo);
    setIsPlayerTurn(true);
    setBattleEnded(false);
    setResultadoFinal('');
    setLootGenerado([]);
    setCreditosGenerados(0);
    setXpGenerada(0);

    turnosQuemadoJugador.current = 0;
    turnosQuemadoEnemigo.current = 0;
    turnosHieloJugador.current = 0;
    turnosHieloEnemigo.current = 0;

    setLogCombate([
      'Sistema de Combate Inicializado',
      `Enemigo Detectado: ${cloneEnemigo.nombre}`,
    ]);
  }, []);

  const calcularLootYRecompensas = useCallback((finalEnemigo: RobotData) => {
    const loot: ItemData[] = [];
    const modulosEnemigo = getModulos(finalEnemigo);

    for (const m of modulosEnemigo) {
      if (m.tipo !== 'cabeza' && m.estado === 'destruido') {
        const itemLoot: ItemData = {
          id: `loot_${Date.now()}_${m.nombre}_${Math.random().toString(36).substring(2, 6)}`,
          nombre: `Módulo: ${m.nombre}`,
          tipo: 'moduloDirecto',
          moduloAsociado: {
            ...m,
            hpActual: m.hpMaximo,
            estado: 'intacto',
          },
        };
        loot.push(itemLoot);
        agregarLog(`> Loot Obtenido: ${m.nombre}`);
      }
    }

    if (loot.length === 0) {
      agregarLog('> Sin piezas recuperables.');
    }

    const creds = 50 + Math.floor(Math.random() * 101);
    const xp = (finalEnemigo.nivel || 1) * 30 + Math.floor(Math.random() * 20);

    agregarLog(`>>> OBTIENES ${creds} CHTR <<<`);
    agregarLog(`>>> OBTIENES ${xp} XP <<<`);

    setLootGenerado(loot);
    setCreditosGenerados(creds);
    setXpGenerada(xp);
    audioService.playSfx('victory');
  }, [agregarLog]);

  const finalizarTurnoJugador = useCallback((curJugador: RobotData, curEnemigo: RobotData) => {
    setIsPlayerTurn(false);

    setTimeout(() => {
      // Procesar estados del enemigo al inicio de su turno
      let updatedEnemigo = { ...curEnemigo };
      if (turnosQuemadoEnemigo.current > 0) {
        const dmg = 5;
        const hpPrev = updatedEnemigo.cabeza.hpActual ?? updatedEnemigo.cabeza.hpMaximo;
        const hpNext = Math.max(0, hpPrev - dmg);
        updatedEnemigo.cabeza = {
          ...updatedEnemigo.cabeza,
          hpActual: hpNext,
          estado: hpNext === 0 ? 'destruido' : 'intacto',
        };
        turnosQuemadoEnemigo.current -= 1;
        agregarLog(`> ¡QUEMADURA! Enemigo recibe ${dmg} daño.`);
        onAnimationEvent?.({ monto: dmg, esCura: false, objetivoEsJugador: false, moduloAfectado: 'cabeza' });

        if (isDerrotado(updatedEnemigo)) {
          setEnemigo(updatedEnemigo);
          setBattleEnded(true);
          setResultadoFinal('VICTORIA');
          agregarLog('>>> ENEMIGO DERROTADO <<<');
          calcularLootYRecompensas(updatedEnemigo);
          return;
        }
      }
      if (turnosHieloEnemigo.current > 0) {
        turnosHieloEnemigo.current -= 1;
      }

      // Turno enemigo IA
      ejecutarTurnoEnemigo(curJugador, updatedEnemigo);
    }, 900);
  }, [agregarLog, onAnimationEvent, calcularLootYRecompensas]);

  const ejecutarTurnoEnemigo = useCallback((currentJugador: RobotData, currentEnemigo: RobotData) => {
    const disponibles = getModulos(currentJugador).filter((m) => m.estado !== 'destruido');
    if (disponibles.length === 0) return;

    const target = disponibles[Math.floor(Math.random() * disponibles.length)];
    let el: TipoElemento = 'neutro';
    if (currentEnemigo.brazoIzquierdo.estado !== 'destruido' && currentEnemigo.brazoIzquierdo.elemento) {
      el = currentEnemigo.brazoIzquierdo.elemento;
    } else if (currentEnemigo.brazoDerecho.estado !== 'destruido' && currentEnemigo.brazoDerecho.elemento) {
      el = currentEnemigo.brazoDerecho.elemento;
    }

    let velAtacante = getVelocidadTotal(currentEnemigo);
    if (turnosHieloEnemigo.current > 0) velAtacante = Math.floor(velAtacante * 0.5);

    let velDefensor = getVelocidadTotal(currentJugador);
    if (turnosHieloJugador.current > 0) velDefensor = Math.floor(velDefensor * 0.5);

    // Evasión
    if (verificarEvasion(velAtacante, velDefensor)) {
      agregarLog('> ¡ESQUIVASTE el ataque del enemigo!');
      finalizarTurnoEnemigo(currentJugador, currentEnemigo);
      return;
    }

    const pasivas = getPasivasActivas(currentEnemigo);
    let dmg = getAtaqueTotal(currentEnemigo);
    let saltarTurno = false;

    if (pasivas.includes('critico') && Math.random() < 0.15) {
      dmg *= 2;
      agregarLog('>>> ¡CRÍTICO ENEMIGO! <<<');
      audioService.playSfx('crit');
    }

    if (pasivas.includes('aturdir') && Math.random() < 0.15) {
      saltarTurno = true;
      agregarLog('>>> ¡SISTEMAS PARALIZADOS! <<<');
    }

    // Efecto elemental
    if (el === 'corrosivo' && target.tipo !== 'cabeza') {
      dmg = Math.floor(dmg * 1.5);
    }
    if (el === 'fuego' && Math.random() < 0.3) {
      turnosQuemadoJugador.current = 3;
      agregarLog('>>> ¡Tus sistemas se incendian! <<<');
    }
    if (el === 'hielo' && Math.random() < 0.3) {
      turnosHieloJugador.current = 2;
      agregarLog('>>> ¡Sistemas congelados! <<<');
    }

    const targetMod = getModuloPorTipo(currentJugador, target.tipo);
    const vidaPrevia = targetMod.hpActual ?? targetMod.hpMaximo;
    const hpNext = Math.max(0, vidaPrevia - dmg);
    const vidaPerdida = vidaPrevia - hpNext;

    const updatedTargetMod: ModuloData = {
      ...targetMod,
      hpActual: hpNext,
      estado: hpNext === 0 ? 'destruido' : 'intacto',
    };

    let nextJugador = setModuloPorTipo(currentJugador, target.tipo, updatedTargetMod);

    onAnimationEvent?.({
      monto: vidaPerdida,
      esCura: false,
      objetivoEsJugador: true,
      moduloAfectado: target.tipo,
    });
    audioService.playSfx('hit');
    agregarLog(`> Enemigo hace ${vidaPerdida} daño a ${targetMod.nombre}.`);

    if (pasivas.includes('roboDeVida') && vidaPerdida > 0) {
      const cura = Math.ceil(vidaPerdida * 0.25);
      if (currentEnemigo.cabeza.estado !== 'destruido') {
        const hPrev = currentEnemigo.cabeza.hpActual ?? currentEnemigo.cabeza.hpMaximo;
        const hMax = currentEnemigo.cabeza.hpMaximo;
        const hNext = Math.min(hMax, hPrev + cura);
        currentEnemigo.cabeza = { ...currentEnemigo.cabeza, hpActual: hNext };
        agregarLog(`>>> ¡Enemigo se cura ${cura}! <<<`);
      }
    }

    if (updatedTargetMod.estado === 'destruido') {
      agregarLog(`>> ¡Tu ${updatedTargetMod.nombre} ha sido DESTRUIDO!`);
    }

    setJugador(nextJugador);
    setEnemigo(currentEnemigo);

    if (isDerrotado(nextJugador)) {
      setBattleEnded(true);
      setResultadoFinal('DERROTA');
      agregarLog('>>> SISTEMA CAÍDO. HAS SIDO DERROTADO <<<');
      audioService.playSfx('defeat');
      return;
    }

    if (saltarTurno) {
      agregarLog('> ¡El enemigo vuelve a atacar!');
      setTimeout(() => {
        ejecutarTurnoEnemigo(nextJugador, currentEnemigo);
      }, 1000);
    } else {
      finalizarTurnoEnemigo(nextJugador, currentEnemigo);
    }
  }, [agregarLog, onAnimationEvent]);

  const finalizarTurnoEnemigo = useCallback((currentJugador: RobotData, currentEnemigo: RobotData) => {
    setIsPlayerTurn(true);

    // Inicio de turno jugador: regenerar 10 energía y procesar quemadura / hielo
    let nextJugador = { ...currentJugador };
    const maxEnergia = nextJugador.energiaMax ?? 100;
    const curEnergia = nextJugador.energiaActual ?? 100;
    if (curEnergia < maxEnergia) {
      nextJugador.energiaActual = Math.min(maxEnergia, curEnergia + 10);
    }

    if (turnosQuemadoJugador.current > 0) {
      const dmg = 5;
      const hpPrev = nextJugador.cabeza.hpActual ?? nextJugador.cabeza.hpMaximo;
      const hpNext = Math.max(0, hpPrev - dmg);
      nextJugador.cabeza = {
        ...nextJugador.cabeza,
        hpActual: hpNext,
        estado: hpNext === 0 ? 'destruido' : 'intacto',
      };
      turnosQuemadoJugador.current -= 1;
      agregarLog(`> ¡QUEMADURA! Tu núcleo recibe ${dmg} daño.`);
      onAnimationEvent?.({ monto: dmg, esCura: false, objetivoEsJugador: true, moduloAfectado: 'cabeza' });

      if (isDerrotado(nextJugador)) {
        setJugador(nextJugador);
        setBattleEnded(true);
        setResultadoFinal('DERROTA');
        agregarLog('>>> SISTEMA CAÍDO. HAS SIDO DERROTADO <<<');
        audioService.playSfx('defeat');
        return;
      }
    }

    if (turnosHieloJugador.current > 0) {
      turnosHieloJugador.current -= 1;
    }

    setJugador(nextJugador);
    setEnemigo(currentEnemigo);
  }, [agregarLog, onAnimationEvent]);

  // Player Basic Attack
  const ataqueJugador = useCallback((objetivo: TipoModulo) => {
    if (battleEnded || !isPlayerTurn || !jugador || !enemigo) return;

    let velAtacante = getVelocidadTotal(jugador);
    if (turnosHieloJugador.current > 0) velAtacante = Math.floor(velAtacante * 0.5);

    let velDefensor = getVelocidadTotal(enemigo);
    if (turnosHieloEnemigo.current > 0) velDefensor = Math.floor(velDefensor * 0.5);

    // Evasión
    if (verificarEvasion(velAtacante, velDefensor)) {
      agregarLog('> ¡El enemigo ESQUIVÓ tu ataque!');
      finalizarTurnoJugador(jugador, enemigo);
      return;
    }

    const pasivas = getPasivasActivas(jugador);
    let dmg = getAtaqueTotal(jugador);
    let saltarTurnoEnemigo = false;

    if (pasivas.includes('critico') && Math.random() < 0.15) {
      dmg *= 2;
      agregarLog('>>> ¡TU CRÍTICO! <<<');
      audioService.playSfx('crit');
    }

    if (pasivas.includes('aturdir') && Math.random() < 0.15) {
      saltarTurnoEnemigo = true;
      agregarLog('>>> ¡ENEMIGO ATURDIDO! <<<');
    }

    const targetMod = getModuloPorTipo(enemigo, objetivo);

    if (targetMod.estado === 'destruido') {
      agregarLog(`> Atacas a ${targetMod.nombre} ¡pero ya está destruido!`);
    } else {
      const vidaPrevia = targetMod.hpActual ?? targetMod.hpMaximo;
      const hpNext = Math.max(0, vidaPrevia - dmg);
      const vidaPerdida = vidaPrevia - hpNext;

      const updatedTargetMod: ModuloData = {
        ...targetMod,
        hpActual: hpNext,
        estado: hpNext === 0 ? 'destruido' : 'intacto',
      };

      const nextEnemigo = setModuloPorTipo(enemigo, objetivo, updatedTargetMod);

      onAnimationEvent?.({
        monto: vidaPerdida,
        esCura: false,
        objetivoEsJugador: false,
        moduloAfectado: objetivo,
      });
      audioService.playSfx('hit');
      agregarLog(`> Haces ${vidaPerdida} daño a ${targetMod.nombre}.`);

      let nextJugador = { ...jugador };
      if (pasivas.includes('roboDeVida') && vidaPerdida > 0) {
        const cura = Math.ceil(vidaPerdida * 0.25);
        if (nextJugador.cabeza.estado !== 'destruido') {
          const hPrev = nextJugador.cabeza.hpActual ?? nextJugador.cabeza.hpMaximo;
          const hMax = nextJugador.cabeza.hpMaximo;
          const hNext = Math.min(hMax, hPrev + cura);
          nextJugador.cabeza = { ...nextJugador.cabeza, hpActual: hNext };
          onAnimationEvent?.({ monto: cura, esCura: true, objetivoEsJugador: true, moduloAfectado: 'cabeza' });
          agregarLog(`>>> ¡Vampirismo cura ${cura}! <<<`);
        }
      }

      if (updatedTargetMod.estado === 'destruido') {
        agregarLog(`>> ¡${updatedTargetMod.nombre} enemigo DESTRUIDO!`);
      }

      setJugador(nextJugador);
      setEnemigo(nextEnemigo);

      if (isDerrotado(nextEnemigo)) {
        setBattleEnded(true);
        setResultadoFinal('VICTORIA');
        agregarLog('>>> ENEMIGO DERROTADO <<<');
        calcularLootYRecompensas(nextEnemigo);
        return;
      }

      if (saltarTurnoEnemigo) {
        agregarLog('> ¡Es tu turno de nuevo!');
        setIsPlayerTurn(true);
        return;
      }

      finalizarTurnoJugador(nextJugador, nextEnemigo);
      return;
    }

    finalizarTurnoJugador(jugador, enemigo);
  }, [battleEnded, isPlayerTurn, jugador, enemigo, agregarLog, onAnimationEvent, finalizarTurnoJugador, calcularLootYRecompensas]);

  // Player Active Skill
  const usarHabilidadJugador = useCallback((
    hab: HabilidadActiva,
    modOrigen: ModuloData,
    objetivo: TipoModulo
  ) => {
    if (battleEnded || !isPlayerTurn || !jugador || !enemigo) return;

    const costo = 30;
    const curEnergia = jugador.energiaActual ?? 100;
    if (curEnergia < costo) {
      agregarLog(`> ¡No hay suficiente energía para ${hab}!`);
      return;
    }

    const nextJugador = { ...jugador, energiaActual: curEnergia - costo };

    if (hab === 'reparacion') {
      agregarLog('> ¡USANDO REPARACIÓN DE EMERGENCIA!');
      const hPrev = nextJugador.cabeza.hpActual ?? nextJugador.cabeza.hpMaximo;
      const hMax = nextJugador.cabeza.hpMaximo;
      const hNext = Math.min(hMax, hPrev + 30);
      nextJugador.cabeza = { ...nextJugador.cabeza, hpActual: hNext };
      onAnimationEvent?.({ monto: 30, esCura: true, objetivoEsJugador: true, moduloAfectado: 'cabeza' });
      audioService.playSfx('heal');
      setJugador(nextJugador);
      finalizarTurnoJugador(nextJugador, enemigo);
      return;
    }

    if (hab === 'escudo') {
      agregarLog('> ¡USANDO ESCUDO DE ENERGÍA! (Cura 15 a todo)');
      const healMod = (m: ModuloData): ModuloData => {
        if (m.estado === 'destruido') return m;
        const curHp = m.hpActual ?? m.hpMaximo;
        return { ...m, hpActual: Math.min(m.hpMaximo, curHp + 15) };
      };
      nextJugador.cabeza = healMod(nextJugador.cabeza);
      nextJugador.brazoIzquierdo = healMod(nextJugador.brazoIzquierdo);
      nextJugador.brazoDerecho = healMod(nextJugador.brazoDerecho);
      nextJugador.piernas = healMod(nextJugador.piernas);

      onAnimationEvent?.({ monto: 15, esCura: true, objetivoEsJugador: true, moduloAfectado: 'cabeza' });
      audioService.playSfx('heal');
      setJugador(nextJugador);
      finalizarTurnoJugador(nextJugador, enemigo);
      return;
    }

    // Ataque ofensivo
    let multDmg = 1.0;
    let esquivable = true;
    if (hab === 'canonLaser') {
      multDmg = 2.0;
      agregarLog('> ¡USANDO CAÑÓN LÁSER!');
      audioService.playSfx('crit');
    } else if (hab === 'ataqueRapido') {
      multDmg = 0.8;
      esquivable = false;
      agregarLog('> ¡USANDO ATAQUE RÁPIDO!');
    }

    let velAtacante = getVelocidadTotal(nextJugador);
    if (turnosHieloJugador.current > 0) velAtacante = Math.floor(velAtacante * 0.5);

    let velDefensor = getVelocidadTotal(enemigo);
    if (turnosHieloEnemigo.current > 0) velDefensor = Math.floor(velDefensor * 0.5);

    if (esquivable && verificarEvasion(velAtacante, velDefensor)) {
      agregarLog('> ¡El enemigo ESQUIVÓ tu ataque!');
      setJugador(nextJugador);
      finalizarTurnoJugador(nextJugador, enemigo);
      return;
    }

    const pasivas = getPasivasActivas(nextJugador);
    let dmg = Math.floor(getAtaqueTotal(nextJugador) * multDmg);
    let saltarTurnoEnemigo = false;

    if (pasivas.includes('critico') && Math.random() < 0.15) {
      dmg *= 2;
      agregarLog('>>> ¡TU CRÍTICO! <<<');
    }

    if (pasivas.includes('aturdir') && Math.random() < 0.15) {
      saltarTurnoEnemigo = true;
      agregarLog('>>> ¡ENEMIGO ATURDIDO! <<<');
    }

    // Elemento del módulo origen
    const elemento = modOrigen.elemento || 'neutro';
    if (elemento === 'corrosivo' && objetivo !== 'cabeza') {
      dmg = Math.floor(dmg * 1.5);
    }
    if (elemento === 'fuego' && Math.random() < 0.3) {
      turnosQuemadoEnemigo.current = 3;
      agregarLog('>>> ¡Enemigo incendiado! <<<');
    }
    if (elemento === 'hielo' && Math.random() < 0.3) {
      turnosHieloEnemigo.current = 2;
      agregarLog('>>> ¡Enemigo ralentizado! <<<');
    }

    const targetMod = getModuloPorTipo(enemigo, objetivo);
    const vidaPrevia = targetMod.hpActual ?? targetMod.hpMaximo;
    const hpNext = Math.max(0, vidaPrevia - dmg);
    const vidaPerdida = vidaPrevia - hpNext;

    const updatedTargetMod: ModuloData = {
      ...targetMod,
      hpActual: hpNext,
      estado: hpNext === 0 ? 'destruido' : 'intacto',
    };

    const nextEnemigo = setModuloPorTipo(enemigo, objetivo, updatedTargetMod);

    onAnimationEvent?.({
      monto: vidaPerdida,
      esCura: false,
      objetivoEsJugador: false,
      moduloAfectado: objetivo,
    });
    audioService.playSfx('hit');
    agregarLog(`> Haces ${vidaPerdida} daño a ${targetMod.nombre}.`);

    if (pasivas.includes('roboDeVida') && vidaPerdida > 0) {
      const cura = Math.ceil(vidaPerdida * 0.25);
      if (nextJugador.cabeza.estado !== 'destruido') {
        const hPrev = nextJugador.cabeza.hpActual ?? nextJugador.cabeza.hpMaximo;
        const hMax = nextJugador.cabeza.hpMaximo;
        const hNext = Math.min(hMax, hPrev + cura);
        nextJugador.cabeza = { ...nextJugador.cabeza, hpActual: hNext };
        onAnimationEvent?.({ monto: cura, esCura: true, objetivoEsJugador: true, moduloAfectado: 'cabeza' });
        agregarLog(`>>> ¡Vampirismo cura ${cura}! <<<`);
      }
    }

    if (updatedTargetMod.estado === 'destruido') {
      agregarLog(`>> ¡${updatedTargetMod.nombre} enemigo DESTRUIDO!`);
    }

    setJugador(nextJugador);
    setEnemigo(nextEnemigo);

    if (isDerrotado(nextEnemigo)) {
      setBattleEnded(true);
      setResultadoFinal('VICTORIA');
      agregarLog('>>> ENEMIGO DERROTADO <<<');
      calcularLootYRecompensas(nextEnemigo);
      return;
    }

    if (saltarTurnoEnemigo) {
      agregarLog('> ¡Es tu turno de nuevo!');
      setIsPlayerTurn(true);
      return;
    }

    finalizarTurnoJugador(nextJugador, nextEnemigo);
  }, [battleEnded, isPlayerTurn, jugador, enemigo, agregarLog, onAnimationEvent, finalizarTurnoJugador, calcularLootYRecompensas]);

  // Support Bit action
  const usarBitSoporte = useCallback(() => {
    if (battleEnded || !isPlayerTurn || !jugador || !enemigo) return;

    let moduloHerido: ModuloData | null = null;
    let peorPorcentaje = 1.0;

    for (const m of getModulos(jugador)) {
      const curHp = m.hpActual ?? m.hpMaximo;
      if (m.estado !== 'destruido' && curHp < m.hpMaximo) {
        const pct = curHp / m.hpMaximo;
        if (pct < peorPorcentaje) {
          peorPorcentaje = pct;
          moduloHerido = m;
        }
      }
    }

    let nextJugador = { ...jugador };
    let nextEnemigo = { ...enemigo };

    if (moduloHerido) {
      const heal = 20;
      const prev = moduloHerido.hpActual ?? moduloHerido.hpMaximo;
      const nextHp = Math.min(moduloHerido.hpMaximo, prev + heal);
      const vidaGanada = nextHp - prev;

      const modHealed: ModuloData = { ...moduloHerido, hpActual: nextHp };
      nextJugador = setModuloPorTipo(nextJugador, moduloHerido.tipo, modHealed);

      if (vidaGanada > 0) {
        onAnimationEvent?.({
          monto: vidaGanada,
          esCura: true,
          objetivoEsJugador: true,
          moduloAfectado: moduloHerido.tipo,
        });
        audioService.playSfx('heal');
      }
      agregarLog(`> BIT SOPORTE: Repara ${vidaGanada} HP de ${moduloHerido.nombre}.`);
    } else {
      const modulosEnemigo = getModulos(nextEnemigo);
      const mRandom = modulosEnemigo[Math.floor(Math.random() * modulosEnemigo.length)];

      if (mRandom.estado !== 'destruido') {
        const prev = mRandom.hpActual ?? mRandom.hpMaximo;
        const nextHp = Math.max(0, prev - 10);
        const vidaPerdida = prev - nextHp;

        const updatedM: ModuloData = {
          ...mRandom,
          hpActual: nextHp,
          estado: nextHp === 0 ? 'destruido' : 'intacto',
        };
        nextEnemigo = setModuloPorTipo(nextEnemigo, mRandom.tipo, updatedM);

        onAnimationEvent?.({
          monto: vidaPerdida,
          esCura: false,
          objetivoEsJugador: false,
          moduloAfectado: mRandom.tipo,
        });
        audioService.playSfx('hit');
        agregarLog(`> BIT SOPORTE: Sabotea a enemigo. ${vidaPerdida} daño a ${mRandom.nombre}.`);

        if (updatedM.estado === 'destruido') {
          agregarLog(`>> ¡${updatedM.nombre} enemigo DESTRUIDO!`);
        }
      } else {
        agregarLog('> BIT SOPORTE: Sin objetivos viables.');
      }
    }

    setJugador(nextJugador);
    setEnemigo(nextEnemigo);

    if (isDerrotado(nextEnemigo)) {
      setBattleEnded(true);
      setResultadoFinal('VICTORIA');
      agregarLog('>>> ENEMIGO DERROTADO <<<');
      calcularLootYRecompensas(nextEnemigo);
      return;
    }

    finalizarTurnoJugador(nextJugador, nextEnemigo);
  }, [battleEnded, isPlayerTurn, jugador, enemigo, agregarLog, onAnimationEvent, finalizarTurnoJugador, calcularLootYRecompensas]);

  return {
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
  };
}

export type TipoModulo = 'cabeza' | 'brazoIzquierdo' | 'brazoDerecho' | 'piernas';
export type EstadoModulo = 'intacto' | 'destruido';
export type TipoPasiva = 'ninguna' | 'critico' | 'aturdir' | 'roboDeVida';
export type TipoElemento = 'neutro' | 'fuego' | 'corrosivo' | 'hielo';
export type Marca = 'sinMarca' | 'titanio' | 'oxido' | 'neon';
export type HabilidadActiva = 'ninguna' | 'canonLaser' | 'reparacion' | 'escudo' | 'ataqueRapido';
export type TipoItem = 'plano' | 'chatarraEspecializada' | 'moduloDirecto';

export interface ModuloData {
  nombre: string;
  tipo: TipoModulo;
  pasiva?: TipoPasiva;
  elemento?: TipoElemento;
  marca?: Marca;
  habilidadActiva?: HabilidadActiva;
  hpMaximo: number;
  hpActual?: number;
  bonusAtaque?: number;
  bonusVelocidad?: number;
  estado?: EstadoModulo;
}

export interface RobotData {
  id: string;
  nombre: string;
  cabeza: ModuloData;
  brazoIzquierdo: ModuloData;
  brazoDerecho: ModuloData;
  piernas: ModuloData;
  baseAtaque?: number;
  baseVelocidad?: number;
  energiaMax?: number;
  energiaActual?: number;
  nivel?: number;
  xpActual?: number;
}

export interface ItemData {
  id: string;
  nombre: string;
  tipo: TipoItem;
  moduloAsociado?: ModuloData;
}

export interface WorldZone {
  id: string;
  nombreBioma: string;
  descripcion: string;
  fondoVisual: string;
  enemigosIds: string[];
}

export interface BattleEvent {
  monto: number;
  esCura: boolean;
  objetivoEsJugador: boolean;
  moduloAfectado: TipoModulo;
}

// Helpers for robot calculations matching Robot and Modulo classes in Flutter

export function createModulo(data: ModuloData): ModuloData {
  return {
    nombre: data.nombre,
    tipo: data.tipo,
    pasiva: data.pasiva || 'ninguna',
    elemento: data.elemento || 'neutro',
    marca: data.marca || 'sinMarca',
    habilidadActiva: data.habilidadActiva || 'ninguna',
    hpMaximo: data.hpMaximo,
    hpActual: data.hpActual !== undefined ? data.hpActual : data.hpMaximo,
    bonusAtaque: data.bonusAtaque || 0,
    bonusVelocidad: data.bonusVelocidad || 0,
    estado: data.estado || 'intacto',
  };
}

export function cloneModulo(m: ModuloData): ModuloData {
  return {
    ...m,
  };
}

export function getModulos(r: RobotData): ModuloData[] {
  return [r.cabeza, r.brazoIzquierdo, r.brazoDerecho, r.piernas];
}

export function getMarcasConteo(r: RobotData): Record<Marca, number> {
  const conteo: Record<Marca, number> = {
    sinMarca: 0,
    titanio: 0,
    oxido: 0,
    neon: 0,
  };
  for (const m of getModulos(r)) {
    if (m.estado !== 'destruido' && m.marca && m.marca !== 'sinMarca') {
      conteo[m.marca] = (conteo[m.marca] || 0) + 1;
    }
  }
  return conteo;
}

export function getHpTotal(r: RobotData): number {
  let total = getModulos(r).reduce((sum, m) => sum + m.hpMaximo, 0);
  const marcas = getMarcasConteo(r);
  if ((marcas['titanio'] || 0) >= 3) {
    total = Math.floor(total * 1.2); // +20% HP Max
  }
  return total;
}

export function getHpActualTotal(r: RobotData): number {
  return getModulos(r).reduce((sum, m) => sum + (m.hpActual ?? m.hpMaximo), 0);
}

export function getBaseAtaque(nivel: number): number {
  return 10 + (nivel - 1) * 3;
}

export function getBaseVelocidad(nivel: number): number {
  return 5 + (nivel - 1) * 1;
}

export function getEnergiaMax(nivel: number): number {
  return 100 + (nivel - 1) * 10;
}

export function getAtaqueTotal(r: RobotData): number {
  const nivel = r.nivel || 1;
  let ataque = r.baseAtaque ?? getBaseAtaque(nivel);
  if (r.brazoIzquierdo.estado !== 'destruido') ataque += r.brazoIzquierdo.bonusAtaque || 0;
  if (r.brazoDerecho.estado !== 'destruido') ataque += r.brazoDerecho.bonusAtaque || 0;
  const marcas = getMarcasConteo(r);
  if ((marcas['oxido'] || 0) >= 3) ataque += 15; // +15 Ataque Fijo
  return ataque;
}

export function getVelocidadTotal(r: RobotData): number {
  const nivel = r.nivel || 1;
  let velocidad = r.baseVelocidad ?? getBaseVelocidad(nivel);
  if (r.piernas.estado !== 'destruido') velocidad += r.piernas.bonusVelocidad || 0;
  const marcas = getMarcasConteo(r);
  if ((marcas['neon'] || 0) >= 3) velocidad += 10; // +10 Velocidad Fija
  return velocidad;
}

export function getPasivasActivas(r: RobotData): TipoPasiva[] {
  return getModulos(r)
    .filter((m) => m.estado !== 'destruido' && m.pasiva && m.pasiva !== 'ninguna')
    .map((m) => m.pasiva as TipoPasiva);
}

export function isDerrotado(r: RobotData): boolean {
  return r.cabeza.estado === 'destruido';
}

export function cloneRobot(r: RobotData): RobotData {
  return {
    id: r.id,
    nombre: r.nombre,
    cabeza: cloneModulo(r.cabeza),
    brazoIzquierdo: cloneModulo(r.brazoIzquierdo),
    brazoDerecho: cloneModulo(r.brazoDerecho),
    piernas: cloneModulo(r.piernas),
    baseAtaque: r.baseAtaque ?? getBaseAtaque(r.nivel || 1),
    baseVelocidad: r.baseVelocidad ?? getBaseVelocidad(r.nivel || 1),
    energiaMax: r.energiaMax ?? getEnergiaMax(r.nivel || 1),
    energiaActual: r.energiaActual ?? 100,
    nivel: r.nivel ?? 1,
    xpActual: r.xpActual ?? 0,
  };
}

export function getXpRequerida(nivel: number): number {
  return nivel * 100;
}

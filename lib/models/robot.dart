import 'modulo.dart';

class Robot {
  final String id;
  final String nombre;
  Modulo cabeza;
  Modulo brazoIzquierdo;
  Modulo brazoDerecho;
  Modulo piernas;

  // Estadísticas base del núcleo (independientes de las piezas equipadas)
  int baseAtaque = 10;
  int baseVelocidad = 5;
  int energiaMax = 100;
  int energiaActual = 100;
  
  // Progresión
  int nivel = 1;
  int xpActual = 0;

  Robot({
    required this.id,
    required this.nombre,
    required this.cabeza,
    required this.brazoIzquierdo,
    required this.brazoDerecho,
    required this.piernas,
    this.energiaActual = 100,
    this.nivel = 1,
    this.xpActual = 0,
  });

  factory Robot.fromJson(Map<String, dynamic> json) {
    Robot r = Robot(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      cabeza: Modulo.fromJson(json['cabeza'], TipoModulo.cabeza),
      brazoIzquierdo: Modulo.fromJson(json['brazoIzquierdo'], TipoModulo.brazoIzquierdo),
      brazoDerecho: Modulo.fromJson(json['brazoDerecho'], TipoModulo.brazoDerecho),
      piernas: Modulo.fromJson(json['piernas'], TipoModulo.piernas),
      energiaActual: json['energiaActual'] ?? 100,
      nivel: json['nivel'] ?? 1,
      xpActual: json['xpActual'] ?? 0,
    );
    
    // Recalcular stats base según el nivel al cargar
    r._recalcularStatsBase();
    return r;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'cabeza': cabeza.toJson(),
      'brazoIzquierdo': brazoIzquierdo.toJson(),
      'brazoDerecho': brazoDerecho.toJson(),
      'piernas': piernas.toJson(),
      'energiaActual': energiaActual,
      'nivel': nivel,
      'xpActual': xpActual,
    };
  }

  int get hpTotal {
    int total = modulos.fold(0, (sum, m) => sum + m.hpMaximo);
    if ((marcasConteo[Marca.titanio] ?? 0) >= 3) total = (total * 1.2).toInt(); // +20% HP Max
    return total;
  }
  int get hpActualTotal => modulos.fold(0, (sum, m) => sum + m.hpActual);
  
  // El ataque total es el base + bonus de los brazos que no estén destruidos
  int get ataqueTotal {
    int ataque = baseAtaque;
    if (brazoIzquierdo.estado != EstadoModulo.destruido) ataque += brazoIzquierdo.bonusAtaque;
    if (brazoDerecho.estado != EstadoModulo.destruido) ataque += brazoDerecho.bonusAtaque;
    if ((marcasConteo[Marca.oxido] ?? 0) >= 3) ataque += 15; // +15 Ataque Fijo
    return ataque;
  }

  // La velocidad total es la base + bonus de las piernas que no estén destruidas
  int get velocidadTotal {
    int velocidad = baseVelocidad;
    if (piernas.estado != EstadoModulo.destruido) velocidad += piernas.bonusVelocidad;
    if ((marcasConteo[Marca.neon] ?? 0) >= 3) velocidad += 10; // +10 Velocidad
    return velocidad;
  }
  List<TipoPasiva> get pasivasActivas => modulos
      .where((m) => m.estado != EstadoModulo.destruido && m.pasiva != TipoPasiva.ninguna)
      .map((m) => m.pasiva)
      .toList();

  Map<Marca, int> get marcasConteo {
    Map<Marca, int> conteo = {};
    for (var m in modulos) {
      if (m.estado != EstadoModulo.destruido && m.marca != Marca.sinMarca) {
        conteo[m.marca] = (conteo[m.marca] ?? 0) + 1;
      }
    }
    return conteo;
  }

  void gastarEnergia(int cantidad) {
    energiaActual -= cantidad;
    if (energiaActual < 0) energiaActual = 0;
  }

  void curarEnergia(int cantidad) {
    energiaActual += cantidad;
    if (energiaActual > energiaMax) energiaActual = energiaMax;
  }

  int get xpRequerida => nivel * 100; // Escala simple: 100, 200, 300...

  bool ganarXp(int cantidad) {
    if (nivel >= 20) return false; // Nivel máximo

    xpActual += cantidad;
    bool subioNivel = false;
    
    while (xpActual >= xpRequerida && nivel < 20) {
      xpActual -= xpRequerida;
      nivel++;
      subioNivel = true;
      _recalcularStatsBase();
    }
    
    // Asegurar que si llega a 20 no tenga XP sobrante visual
    if (nivel == 20) xpActual = 0;
    
    return subioNivel;
  }

  void _recalcularStatsBase() {
    // Stats escalan por nivel
    baseAtaque = 10 + ((nivel - 1) * 3); // +3 atk por nivel
    baseVelocidad = 5 + ((nivel - 1) * 1); // +1 vel por nivel
    energiaMax = 100 + ((nivel - 1) * 10); // +10 max energía por nivel
  }

  // Si la cabeza (núcleo) es destruida, el robot entero pierde.
  bool get isDerrotado => cabeza.estado == EstadoModulo.destruido;

  // Método de conveniencia para obtener todos los módulos
  List<Modulo> get modulos => [cabeza, brazoIzquierdo, brazoDerecho, piernas];

  // Trasplantar o equipar un nuevo módulo (solo si coincide el tipo)
  void equiparModulo(Modulo nuevoModulo) {
    switch (nuevoModulo.tipo) {
      case TipoModulo.cabeza:
        cabeza = nuevoModulo;
        break;
      case TipoModulo.brazoIzquierdo:
        brazoIzquierdo = nuevoModulo;
        break;
      case TipoModulo.brazoDerecho:
        brazoDerecho = nuevoModulo;
        break;
      case TipoModulo.piernas:
        piernas = nuevoModulo;
        break;
    }
  }

  Robot clone() {
    return Robot(
      id: id,
      nombre: nombre,
      cabeza: cabeza.clone(),
      brazoIzquierdo: brazoIzquierdo.clone(),
      brazoDerecho: brazoDerecho.clone(),
      piernas: piernas.clone(),
      energiaActual: energiaActual,
      nivel: nivel,
      xpActual: xpActual,
    );
  }
}

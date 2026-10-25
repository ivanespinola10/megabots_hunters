import 'package:flutter/material.dart';
import 'dart:math';
import '../models/modulo.dart';
import '../models/robot.dart';
import '../models/item.dart';

class BattleEvent {
  final int monto;
  final bool esCura;
  final bool objetivoEsJugador;
  final TipoModulo moduloAfectado;

  BattleEvent({required this.monto, required this.esCura, required this.objetivoEsJugador, required this.moduloAfectado});
}

class BattleEngine extends ChangeNotifier {
  Robot? jugador;
  Robot? enemigo;

  bool isPlayerTurn = true;
  bool battleEnded = false;
  String resultadoFinal = '';
  List<Item> lootGenerado = [];
  int creditosGenerados = 0;
  int xpGenerada = 0;
  
  List<String> logCombate = [];
  void Function(BattleEvent)? onAnimationEvent;

  // Estados Alterados
  int turnosQuemadoJugador = 0;
  int turnosQuemadoEnemigo = 0;
  int turnosHieloJugador = 0;
  int turnosHieloEnemigo = 0;

  void initCombate(Robot pJugador, String enemigoId, List<Robot> enemigosDisponibles) {
    jugador = pJugador;
    enemigo = _generarEnemigo(enemigoId, enemigosDisponibles);
    isPlayerTurn = true;
    battleEnded = false;
    resultadoFinal = '';
    lootGenerado = [];
    creditosGenerados = 0;
    xpGenerada = 0;
    turnosQuemadoJugador = 0;
    turnosQuemadoEnemigo = 0;
    turnosHieloJugador = 0;
    turnosHieloEnemigo = 0;
    logCombate = ['Sistema de Combate Inicializado', 'Enemigo Detectado: ${enemigo!.nombre}'];
    notifyListeners();
  }

  Robot _generarEnemigo(String id, List<Robot> enemigosDisponibles) {
    var baseEnemy = enemigosDisponibles.firstWhere((e) => e.id == id, orElse: () => enemigosDisponibles.first);
    return baseEnemy.clone();
  }

  void _agregarLog(String mensaje) {
    logCombate.insert(0, mensaje); 
    if (logCombate.length > 20) logCombate.removeLast();
  }

  // Comprueba Evasión
  bool _verificarEvasion(int velAtacante, int velDefensor) {
    if (velDefensor > velAtacante) {
      // 5% de prob de esquivar por cada punto de diferencia, max 50%
      double chance = (velDefensor - velAtacante) * 0.05;
      if (chance > 0.5) chance = 0.5;
      if (Random().nextDouble() < chance) return true;
    }
    return false;
  }

  void _procesarEstadosTurno(bool esTurnoJugador) {
    if (battleEnded) return;

    if (esTurnoJugador) {
      // Regenerar energía
      if (jugador!.energiaActual < jugador!.energiaMax) {
        jugador!.curarEnergia(10);
      }
      if (turnosQuemadoJugador > 0) {
        int dmg = 5;
        jugador!.cabeza.recibirDano(dmg);
        turnosQuemadoJugador--;
        _agregarLog('> ¡QUEMADURA! Tu núcleo recibe $dmg daño.');
        if (onAnimationEvent != null) {
          onAnimationEvent!(BattleEvent(monto: dmg, esCura: false, objetivoEsJugador: true, moduloAfectado: TipoModulo.cabeza));
        }
      }
      if (turnosHieloJugador > 0) turnosHieloJugador--;
    } else {
      if (turnosQuemadoEnemigo > 0) {
        int dmg = 5;
        enemigo!.cabeza.recibirDano(dmg);
        turnosQuemadoEnemigo--;
        _agregarLog('> ¡QUEMADURA! Enemigo recibe $dmg daño.');
        if (onAnimationEvent != null) {
          onAnimationEvent!(BattleEvent(monto: dmg, esCura: false, objetivoEsJugador: false, moduloAfectado: TipoModulo.cabeza));
        }
      }
      if (turnosHieloEnemigo > 0) turnosHieloEnemigo--;
    }
    _verificarFinCombate();
  }

  // Modificador de daño por elemento
  int _aplicarEfectoElemental(TipoElemento elemento, int dmgBase, TipoModulo objetivo, bool esAtaqueJugador) {
    int dmg = dmgBase;
    if (elemento == TipoElemento.corrosivo && objetivo != TipoModulo.cabeza) {
      dmg = (dmg * 1.5).toInt(); // +50% daño a brazos y piernas
    }
    if (elemento == TipoElemento.fuego) {
      if (Random().nextDouble() < 0.3) {
        if (esAtaqueJugador) {
          turnosQuemadoEnemigo = 3;
          _agregarLog('>>> ¡Enemigo incendiado! <<<');
        } else {
          turnosQuemadoJugador = 3;
          _agregarLog('>>> ¡Tus sistemas se incendian! <<<');
        }
      }
    }
    if (elemento == TipoElemento.hielo) {
      if (Random().nextDouble() < 0.3) {
        if (esAtaqueJugador) {
          turnosHieloEnemigo = 2;
          _agregarLog('>>> ¡Enemigo ralentizado! <<<');
        } else {
          turnosHieloJugador = 2;
          _agregarLog('>>> ¡Sistemas congelados! <<<');
        }
      }
    }
    return dmg;
  }

  void usarHabilidadJugador(HabilidadActiva hab, Modulo modOrigen, TipoModulo objetivo) {
    if (battleEnded || !isPlayerTurn) return;

    int costo = 30; // Costo genérico
    if (jugador!.energiaActual < costo) {
      _agregarLog('> ¡No hay suficiente energía para ${hab.name}!');
      return;
    }

    jugador!.gastarEnergia(costo);
    
    if (hab == HabilidadActiva.canonLaser) {
      _agregarLog('> ¡USANDO CAÑÓN LÁSER!');
      _ejecutarAtaque(objetivo, true, multiplicadorDano: 2.0, elemento: modOrigen.elemento);
    } else if (hab == HabilidadActiva.ataqueRapido) {
      _agregarLog('> ¡USANDO ATAQUE RÁPIDO!');
      _ejecutarAtaque(objetivo, true, multiplicadorDano: 0.8, esquivable: false, elemento: modOrigen.elemento);
    } else if (hab == HabilidadActiva.reparacion) {
      _agregarLog('> ¡USANDO REPARACIÓN DE EMERGENCIA!');
      jugador!.cabeza.curar(30);
      if (onAnimationEvent != null) onAnimationEvent!(BattleEvent(monto: 30, esCura: true, objetivoEsJugador: true, moduloAfectado: TipoModulo.cabeza));
      _finalizarTurnoJugador();
    } else if (hab == HabilidadActiva.escudo) {
      _agregarLog('> ¡USANDO ESCUDO DE ENERGÍA! (Cura 15 a todo)');
      for (var m in jugador!.modulos) {
        m.curar(15);
      }
      _finalizarTurnoJugador();
    }
  }

  void ataqueJugador(TipoModulo objetivo) {
    if (battleEnded || !isPlayerTurn) return;
    _ejecutarAtaque(objetivo, true, elemento: TipoElemento.neutro);
  }

  void _ejecutarAtaque(TipoModulo objetivo, bool esJugador, {double multiplicadorDano = 1.0, bool esquivable = true, TipoElemento elemento = TipoElemento.neutro}) {
    Robot atacante = esJugador ? jugador! : enemigo!;
    Robot defensor = esJugador ? enemigo! : jugador!;

    int velAtacante = atacante.velocidadTotal;
    if (esJugador && turnosHieloJugador > 0) {
      velAtacante = (velAtacante * 0.5).toInt();
    }
    if (!esJugador && turnosHieloEnemigo > 0) {
      velAtacante = (velAtacante * 0.5).toInt();
    }

    int velDefensor = defensor.velocidadTotal;
    if (esJugador && turnosHieloEnemigo > 0) {
      velDefensor = (velDefensor * 0.5).toInt();
    }
    if (!esJugador && turnosHieloJugador > 0) {
      velDefensor = (velDefensor * 0.5).toInt();
    }

    // Evasión
    if (esquivable && _verificarEvasion(velAtacante, velDefensor)) {
      _agregarLog(esJugador ? '> ¡El enemigo ESQUIVÓ tu ataque!' : '> ¡ESQUIVASTE el ataque del enemigo!');
      if (esJugador) _finalizarTurnoJugador();
      else _finalizarTurnoEnemigo();
      return;
    }

    var pasivas = atacante.pasivasActivas;
    int dmg = (atacante.ataqueTotal * multiplicadorDano).toInt();

    bool saltarTurnoEnemigo = false;
    
    if (pasivas.contains(TipoPasiva.critico) && Random().nextDouble() < 0.15) {
      dmg *= 2;
      _agregarLog(esJugador ? '>>> ¡TU CRÍTICO! <<<' : '>>> ¡CRÍTICO ENEMIGO! <<<');
    }
    
    if (pasivas.contains(TipoPasiva.aturdir) && Random().nextDouble() < 0.15) {
      saltarTurnoEnemigo = true;
      _agregarLog(esJugador ? '>>> ¡ENEMIGO ATURDIDO! <<<' : '>>> ¡SISTEMAS PARALIZADOS! <<<');
    }

    Modulo target = _getModuloPorTipo(defensor, objetivo);

    if (target.estado == EstadoModulo.destruido) {
      _agregarLog(esJugador ? '> Atacas a ${target.nombre} ¡pero ya está destruido!' : '> Enemigo ataca ${target.nombre} destruido.');
    } else {
      dmg = _aplicarEfectoElemental(elemento, dmg, objetivo, esJugador);

      int vidaPrevia = target.hpActual;
      target.recibirDano(dmg);
      int vidaPerdida = vidaPrevia - target.hpActual;

      if (onAnimationEvent != null) {
        onAnimationEvent!(BattleEvent(monto: vidaPerdida, esCura: false, objetivoEsJugador: !esJugador, moduloAfectado: objetivo));
      }

      _agregarLog(esJugador ? '> Haces $vidaPerdida daño a ${target.nombre}.' : '> Enemigo hace $vidaPerdida daño a ${target.nombre}.');
      
      if (pasivas.contains(TipoPasiva.roboDeVida) && vidaPerdida > 0) {
        int cura = (vidaPerdida * 0.25).ceil();
        if (atacante.cabeza.estado != EstadoModulo.destruido) {
          atacante.cabeza.curar(cura);
          if (onAnimationEvent != null) {
            onAnimationEvent!(BattleEvent(monto: cura, esCura: true, objetivoEsJugador: esJugador, moduloAfectado: TipoModulo.cabeza));
          }
          _agregarLog(esJugador ? '>>> ¡Vampirismo cura $cura! <<<' : '>>> ¡Enemigo se cura $cura! <<<');
        }
      }

      if (target.estado == EstadoModulo.destruido) {
        _agregarLog(esJugador ? '>> ¡${target.nombre} enemigo DESTRUIDO!' : '>> ¡Tu ${target.nombre} ha sido DESTRUIDO!');
      }
    }

    _verificarFinCombate();
    if (!battleEnded) {
      if (saltarTurnoEnemigo) {
        _agregarLog(esJugador ? '> ¡Es tu turno de nuevo!' : '> ¡El enemigo vuelve a atacar!');
        if (!esJugador) {
          Future.delayed(const Duration(seconds: 1), () => _turnoEnemigo());
        } else {
          notifyListeners();
        }
      } else {
        if (esJugador) {
          _finalizarTurnoJugador();
        } else {
          _finalizarTurnoEnemigo();
        }
      }
    } else {
      notifyListeners();
    }
  }

  void _finalizarTurnoJugador() {
    isPlayerTurn = false;
    notifyListeners();
    Future.delayed(const Duration(seconds: 1), () {
      _procesarEstadosTurno(false);
      if (!battleEnded) _turnoEnemigo();
    });
  }

  void _finalizarTurnoEnemigo() {
    isPlayerTurn = true;
    notifyListeners();
    _procesarEstadosTurno(true);
  }

  void usarBitSoporte() {
    if (battleEnded || !isPlayerTurn) return;

    Modulo? moduloHerido;
    double peorPorcentaje = 1.0;

    for (var m in jugador!.modulos) {
      if (m.estado != EstadoModulo.destruido && m.hpActual < m.hpMaximo) {
        double pct = m.hpActual / m.hpMaximo;
        if (pct < peorPorcentaje) {
          peorPorcentaje = pct;
          moduloHerido = m;
        }
      }
    }

    if (moduloHerido != null) {
      int heal = 20;
      int vidaPrevia = moduloHerido.hpActual;
      moduloHerido.curar(heal);
      int vidaGanada = moduloHerido.hpActual - vidaPrevia;

      if (onAnimationEvent != null && vidaGanada > 0) {
        onAnimationEvent!(BattleEvent(monto: vidaGanada, esCura: true, objetivoEsJugador: true, moduloAfectado: moduloHerido.tipo));
      }
      _agregarLog('> BIT SOPORTE: Repara $vidaGanada HP de ${moduloHerido.nombre}.');
    } else {
      Modulo mRandom = enemigo!.modulos[Random().nextInt(4)];
      if (mRandom.estado != EstadoModulo.destruido) {
        int vidaPrevia = mRandom.hpActual;
        mRandom.recibirDano(10);
        int vidaPerdida = vidaPrevia - mRandom.hpActual;

        if (onAnimationEvent != null) {
          onAnimationEvent!(BattleEvent(monto: vidaPerdida, esCura: false, objetivoEsJugador: false, moduloAfectado: mRandom.tipo));
        }
        _agregarLog('> BIT SOPORTE: Sabotea a enemigo. $vidaPerdida daño a ${mRandom.nombre}.');
      } else {
        _agregarLog('> BIT SOPORTE: Sin objetivos viables.');
      }
    }

    _verificarFinCombate();
    if (!battleEnded) {
      _finalizarTurnoJugador();
    } else {
      notifyListeners();
    }
  }

  void _turnoEnemigo() {
    if (battleEnded) return;

    var disponibles = jugador!.modulos.where((m) => m.estado != EstadoModulo.destruido).toList();
    if (disponibles.isNotEmpty) {
      Modulo target = disponibles[Random().nextInt(disponibles.length)];
      // Elegir brazo al azar para elemento (si tiene)
      TipoElemento el = TipoElemento.neutro;
      if (enemigo!.brazoIzquierdo.estado != EstadoModulo.destruido) el = enemigo!.brazoIzquierdo.elemento;
      
      _ejecutarAtaque(target.tipo, false, elemento: el);
    }
  }

  void _verificarFinCombate() {
    if (enemigo!.isDerrotado) {
      battleEnded = true;
      resultadoFinal = 'VICTORIA';
      _agregarLog('>>> ENEMIGO DERROTADO <<<');
      _calcularLoot();
    } else if (jugador!.isDerrotado) {
      battleEnded = true;
      resultadoFinal = 'DERROTA';
      _agregarLog('>>> SISTEMA CAÍDO. HAS SIDO DERROTADO <<<');
    }
  }

  void _calcularLoot() {
    for (var m in enemigo!.modulos) {
      if (m.tipo != TipoModulo.cabeza && m.estado == EstadoModulo.destruido) {
        Item loot = Item(
          id: 'loot_${DateTime.now().millisecondsSinceEpoch}_${m.nombre}',
          nombre: 'Módulo: ${m.nombre}',
          tipo: TipoItem.moduloDirecto,
          moduloAsociado: Modulo(
            nombre: m.nombre,
            tipo: m.tipo,
            hpMaximo: m.hpMaximo,
            bonusAtaque: m.bonusAtaque,
            bonusVelocidad: m.bonusVelocidad,
            elemento: m.elemento,
            marca: m.marca,
            habilidadActiva: m.habilidadActiva,
            pasiva: m.pasiva,
          ), 
        );
        lootGenerado.add(loot);
        _agregarLog('> Loot Obtenido: ${m.nombre}');
      }
    }
    if (lootGenerado.isEmpty) {
      _agregarLog('> Sin piezas recuperables.');
    }

    creditosGenerados = 50 + Random().nextInt(101);
    _agregarLog('>>> OBTIENES $creditosGenerados CHTR <<<');
    
    // Calcular XP basada en el nivel del enemigo
    xpGenerada = (enemigo!.nivel * 30) + Random().nextInt(20);
    _agregarLog('>>> OBTIENES $xpGenerada XP <<<');
  }

  Modulo _getModuloPorTipo(Robot r, TipoModulo tipo) {
    switch (tipo) {
      case TipoModulo.cabeza: return r.cabeza;
      case TipoModulo.brazoIzquierdo: return r.brazoIzquierdo;
      case TipoModulo.brazoDerecho: return r.brazoDerecho;
      case TipoModulo.piernas: return r.piernas;
    }
  }
}

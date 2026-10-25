import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/battle_engine.dart';
import '../../providers/game_state.dart';
import '../../providers/audio_service.dart';
import '../../models/world_zone.dart';
import '../../models/modulo.dart';
import '../../models/robot.dart';
import 'battle_log_widget.dart';

class BattleScreen extends StatefulWidget {
  final WorldZone zona;

  const BattleScreen({super.key, required this.zona});

  @override
  State<BattleScreen> createState() => _BattleScreenState();
}

class _BattleScreenState extends State<BattleScreen> {
  final GlobalKey<_ShakeWidgetState> _playerShakeKey = GlobalKey<_ShakeWidgetState>();
  final GlobalKey<_ShakeWidgetState> _enemyShakeKey = GlobalKey<_ShakeWidgetState>();

  final List<_FloatingDamage> _floatingNumbers = [];
  late BattleEngine _battleEngineRef;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      var gameState = context.read<GameState>();
      _battleEngineRef = context.read<BattleEngine>();
      
      _battleEngineRef.onAnimationEvent = _handleBattleEvent;

      String enemigoId = widget.zona.enemigosIds.isNotEmpty ? widget.zona.enemigosIds[0] : 'e_scrapper';
      if (gameState.robotPrincipal != null) {
        _battleEngineRef.initCombate(gameState.robotPrincipal!, enemigoId, gameState.enemigosDisponibles);
      }
      
      if (widget.zona.nombreBioma.contains('JEFE')) {
        context.read<AudioService>().playBgm('boss_theme.mp3');
      } else {
        context.read<AudioService>().playBgm('battle_theme.mp3');
      }
    });
  }

  @override
  void dispose() {
    _battleEngineRef.onAnimationEvent = null;
    super.dispose();
  }

  void _handleBattleEvent(BattleEvent event) {
    if (!mounted) return;

    if (event.monto > 0 && !event.esCura) {
      if (event.objetivoEsJugador) {
        _playerShakeKey.currentState?.shake();
      } else {
        _enemyShakeKey.currentState?.shake();
      }
      context.read<AudioService>().playSfx('hit.mp3');
    } else if (event.esCura) {
      context.read<AudioService>().playSfx('heal.mp3');
    }

    setState(() {
      _floatingNumbers.add(
        _FloatingDamage(
          id: DateTime.now().millisecondsSinceEpoch.toString() + event.monto.toString(),
          monto: event.monto,
          esCura: event.esCura,
          objetivoEsJugador: event.objetivoEsJugador,
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    var battleEngine = context.watch<BattleEngine>();
    if (battleEngine.jugador == null || battleEngine.enemigo == null) {
      return const Scaffold(backgroundColor: Colors.black, body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      backgroundColor: Color(int.parse(widget.zona.fondoVisual)),
      appBar: AppBar(
        backgroundColor: Colors.black87,
        title: Text(
          'COMBATE - ${widget.zona.nombreBioma}',
          style: GoogleFonts.orbitron(color: Colors.redAccent),
        ),
        automaticallyImplyLeading: false,
      ),
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                flex: 3,
                child: Row(
                  children: [
                    Expanded(child: ShakeWidget(key: _playerShakeKey, child: _RobotPanel(robot: battleEngine.jugador!, isPlayer: true))),
                    Container(width: 4, color: Colors.black),
                    Expanded(child: ShakeWidget(key: _enemyShakeKey, child: _RobotPanel(robot: battleEngine.enemigo!, isPlayer: false))),
                  ],
                ),
              ),
              Expanded(
                flex: 1,
                child: Container(
                  width: double.infinity,
                  color: Colors.black87,
                  child: const BattleLogWidget(),
                ),
              ),
              Container(
                color: const Color(0xFF111111),
                padding: const EdgeInsets.all(16),
                child: battleEngine.battleEnded
                    ? ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black),
                        onPressed: () {
                          context.read<GameState>().agregarLoot(battleEngine.lootGenerado);
                          context.read<GameState>().agregarCreditos(battleEngine.creditosGenerados);
                          
                          // Ganar XP
                          bool subioNivel = context.read<GameState>().robotPrincipal?.ganarXp(battleEngine.xpGenerada) ?? false;
                          context.read<GameState>().saveGameState();

                          if (battleEngine.resultadoFinal == 'VICTORIA') {
                            context.read<GameState>().rollMercadoNegro();
                          }

                          context.read<AudioService>().playBgm('hub_theme.mp3');
                          Navigator.pop(context);
                          
                          if (subioNivel) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('¡SISTEMA MEJORADO! Nivel Superior Alcanzado', style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold)),
                                backgroundColor: Color(0xFF111111),
                                duration: Duration(seconds: 4),
                              )
                            );
                          }
                        },
                        child: Text('VOLVER AL HUB (${battleEngine.resultadoFinal})'),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
                            onPressed: battleEngine.isPlayerTurn ? () => _mostrarSubmenuAtaque(context, battleEngine) : null,
                            child: const Text('ATACAR', style: TextStyle(color: Colors.white)),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.orangeAccent),
                            onPressed: battleEngine.isPlayerTurn ? () => _mostrarSubmenuHabilidades(context, battleEngine) : null,
                            child: const Text('HABILIDAD', style: TextStyle(color: Colors.black)),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.cyanAccent),
                            onPressed: battleEngine.isPlayerTurn ? () => battleEngine.usarBitSoporte() : null,
                            child: const Text('SOPORTE', style: TextStyle(color: Colors.black)),
                          ),
                        ],
                      ),
              )
            ],
          ),
          ..._floatingNumbers.map((fn) => _buildFloatingDamageWidget(fn)),
        ],
      ),
    );
  }

  Widget _buildFloatingDamageWidget(_FloatingDamage fn) {
    double alignmentX = fn.objetivoEsJugador ? -0.5 : 0.5;

    return Positioned.fill(
      key: ValueKey(fn.id),
      child: Align(
        alignment: Alignment(alignmentX, -0.2),
        child: TweenAnimationBuilder<double>(
          tween: Tween<double>(begin: 0, end: 1),
          duration: const Duration(seconds: 1),
          onEnd: () {
            setState(() {
              _floatingNumbers.removeWhere((item) => item.id == fn.id);
            });
          },
          builder: (context, value, child) {
            double opacity = value < 0.2 ? value * 5 : (1 - value) * 1.25;
            if (opacity > 1) opacity = 1;
            if (opacity < 0) opacity = 0;
            double offsetY = value * -100;

            return Transform.translate(
              offset: Offset(0, offsetY),
              child: Opacity(
                opacity: opacity,
                child: Text(
                  fn.esCura ? '+${fn.monto}' : '-${fn.monto}',
                  style: GoogleFonts.orbitron(
                    color: fn.esCura ? Colors.greenAccent : Colors.redAccent,
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    shadows: [
                      const Shadow(color: Colors.black, blurRadius: 10, offset: Offset(2, 2)),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  void _mostrarSubmenuAtaque(BuildContext context, BattleEngine engine) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF222222),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('SELECCIONAR OBJETIVO (ATAQUE BÁSICO)', style: GoogleFonts.orbitron(color: Colors.redAccent, fontSize: 18)),
              const SizedBox(height: 16),
              _buildTargetTile(ctx, engine, 'Cabeza (Núcleo)', TipoModulo.cabeza),
              _buildTargetTile(ctx, engine, 'Brazo Izquierdo', TipoModulo.brazoIzquierdo),
              _buildTargetTile(ctx, engine, 'Brazo Derecho', TipoModulo.brazoDerecho),
              _buildTargetTile(ctx, engine, 'Piernas', TipoModulo.piernas),
            ],
          ),
        );
      },
    );
  }

  void _mostrarSubmenuHabilidades(BuildContext context, BattleEngine engine) {
    var habilidades = engine.jugador!.modulos
        .where((m) => m.estado != EstadoModulo.destruido && m.habilidadActiva != HabilidadActiva.ninguna)
        .toList();

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF222222),
      builder: (ctx) {
        if (habilidades.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(32),
            child: const Text('NO HAY HABILIDADES DISPONIBLES', style: TextStyle(color: Colors.white70)),
          );
        }
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('HABILIDADES ACTIVAS (30 ENERGÍA)', style: GoogleFonts.orbitron(color: Colors.orangeAccent, fontSize: 18)),
              const SizedBox(height: 16),
              ...habilidades.map((mod) {
                return ListTile(
                  title: Text(mod.habilidadActiva.name.toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  subtitle: Text('De: ${mod.nombre}', style: const TextStyle(color: Colors.white54)),
                  trailing: const Icon(Icons.flash_on, color: Colors.orangeAccent),
                  onTap: () {
                    Navigator.pop(ctx);
                    if (mod.habilidadActiva == HabilidadActiva.reparacion || mod.habilidadActiva == HabilidadActiva.escudo) {
                      engine.usarHabilidadJugador(mod.habilidadActiva, mod, TipoModulo.cabeza);
                    } else {
                      _mostrarSubmenuObjetivoHabilidad(context, engine, mod.habilidadActiva, mod);
                    }
                  },
                );
              }),
            ],
          ),
        );
      },
    );
  }

  void _mostrarSubmenuObjetivoHabilidad(BuildContext context, BattleEngine engine, HabilidadActiva hab, Modulo mod) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF222222),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('SELECCIONAR OBJETIVO PARA ${hab.name.toUpperCase()}', style: GoogleFonts.orbitron(color: Colors.orangeAccent, fontSize: 18)),
              const SizedBox(height: 16),
              ListTile(
                title: const Text('Cabeza (Núcleo)', style: TextStyle(color: Colors.white)),
                onTap: () { Navigator.pop(ctx); engine.usarHabilidadJugador(hab, mod, TipoModulo.cabeza); },
              ),
              ListTile(
                title: const Text('Brazo Izquierdo', style: TextStyle(color: Colors.white)),
                onTap: () { Navigator.pop(ctx); engine.usarHabilidadJugador(hab, mod, TipoModulo.brazoIzquierdo); },
              ),
              ListTile(
                title: const Text('Brazo Derecho', style: TextStyle(color: Colors.white)),
                onTap: () { Navigator.pop(ctx); engine.usarHabilidadJugador(hab, mod, TipoModulo.brazoDerecho); },
              ),
              ListTile(
                title: const Text('Piernas', style: TextStyle(color: Colors.white)),
                onTap: () { Navigator.pop(ctx); engine.usarHabilidadJugador(hab, mod, TipoModulo.piernas); },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTargetTile(BuildContext context, BattleEngine engine, String label, TipoModulo tipo) {
    return ListTile(
      title: Text(label, style: const TextStyle(color: Colors.white)),
      onTap: () {
        Navigator.pop(context);
        engine.ataqueJugador(tipo);
      },
    );
  }
}

class _RobotPanel extends StatelessWidget {
  final Robot robot;
  final bool isPlayer;

  const _RobotPanel({required this.robot, required this.isPlayer});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black54,
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: isPlayer ? CrossAxisAlignment.start : CrossAxisAlignment.end,
        children: [
          Text(
            robot.nombre,
            style: GoogleFonts.orbitron(
              color: isPlayer ? Colors.cyanAccent : Colors.amber,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          if (isPlayer) 
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('ENERGÍA', style: TextStyle(color: Colors.orangeAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                LinearProgressIndicator(
                  value: robot.energiaActual / robot.energiaMax,
                  backgroundColor: Colors.white24,
                  color: Colors.orangeAccent,
                  minHeight: 6,
                ),
                const SizedBox(height: 12),
              ],
            ),
          _ModuleHealthBar(modulo: robot.cabeza, isPlayer: isPlayer),
          _ModuleHealthBar(modulo: robot.brazoIzquierdo, isPlayer: isPlayer),
          _ModuleHealthBar(modulo: robot.brazoDerecho, isPlayer: isPlayer),
          _ModuleHealthBar(modulo: robot.piernas, isPlayer: isPlayer),
          const Spacer(),
          Text('ATK: ${robot.ataqueTotal} | VEL: ${robot.velocidadTotal}', style: const TextStyle(color: Colors.white70)),
        ],
      ),
    );
  }
}

class _ModuleHealthBar extends StatelessWidget {
  final Modulo modulo;
  final bool isPlayer;

  const _ModuleHealthBar({required this.modulo, required this.isPlayer});

  @override
  Widget build(BuildContext context) {
    Color barColor = isPlayer ? Colors.cyanAccent : Colors.amber;
    if (modulo.estado == EstadoModulo.destruido) {
      barColor = Colors.red;
    }

    double progress = modulo.hpActual / modulo.hpMaximo;

    // Indicador de elemento
    IconData? elementoIcon;
    Color? elementoColor;
    if (modulo.elemento == TipoElemento.fuego) { elementoIcon = Icons.local_fire_department; elementoColor = Colors.orange; }
    if (modulo.elemento == TipoElemento.hielo) { elementoIcon = Icons.ac_unit; elementoColor = Colors.lightBlueAccent; }
    if (modulo.elemento == TipoElemento.corrosivo) { elementoIcon = Icons.science; elementoColor = Colors.green; }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Column(
        crossAxisAlignment: isPlayer ? CrossAxisAlignment.start : CrossAxisAlignment.end,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (!isPlayer && elementoIcon != null) Icon(elementoIcon, size: 12, color: elementoColor),
              if (!isPlayer && elementoIcon != null) const SizedBox(width: 4),
              Text(
                '${modulo.nombre} (${modulo.hpActual}/${modulo.hpMaximo})',
                style: TextStyle(
                  color: modulo.estado == EstadoModulo.destruido ? Colors.red : Colors.white,
                  decoration: modulo.estado == EstadoModulo.destruido ? TextDecoration.lineThrough : null,
                  fontSize: 12,
                ),
              ),
              if (isPlayer && elementoIcon != null) const SizedBox(width: 4),
              if (isPlayer && elementoIcon != null) Icon(elementoIcon, size: 12, color: elementoColor),
            ],
          ),
          const SizedBox(height: 4),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.white24,
            color: barColor,
            minHeight: 8,
          ),
        ],
      ),
    );
  }
}

class _FloatingDamage {
  final String id;
  final int monto;
  final bool esCura;
  final bool objetivoEsJugador;

  _FloatingDamage({required this.id, required this.monto, required this.esCura, required this.objetivoEsJugador});
}

class ShakeWidget extends StatefulWidget {
  final Widget child;
  const ShakeWidget({super.key, required this.child});

  @override
  State<ShakeWidget> createState() => _ShakeWidgetState();
}

class _ShakeWidgetState extends State<ShakeWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
    _animation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0, end: -10), weight: 1),
      TweenSequenceItem(tween: Tween(begin: -10, end: 10), weight: 2),
      TweenSequenceItem(tween: Tween(begin: 10, end: -10), weight: 2),
      TweenSequenceItem(tween: Tween(begin: -10, end: 10), weight: 2),
      TweenSequenceItem(tween: Tween(begin: 10, end: 0), weight: 1),
    ]).animate(_controller);
  }

  void shake() {
    _controller.forward(from: 0);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(_animation.value, 0),
          child: child,
        );
      },
      child: widget.child,
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math';
import '../../providers/game_state.dart';
import '../../models/item.dart';
import '../../models/modulo.dart';

class MarketPanel extends StatelessWidget {
  const MarketPanel({super.key});

  @override
  Widget build(BuildContext context) {
    var gameState = context.watch<GameState>();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header del Mercado
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.black87,
              border: Border.all(color: Colors.amber, width: 2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'EL MERCADER DE ÓXIDO',
                        style: GoogleFonts.orbitron(color: Colors.amber, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '"Si tiene engranajes, me interesa. ¿Qué buscas hoy, Cazador?"',
                        style: GoogleFonts.shareTechMono(color: Colors.white70, fontStyle: FontStyle.italic),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    border: Border.all(color: Colors.greenAccent),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'CHTR: ${gameState.creditos}',
                    style: GoogleFonts.shareTechMono(color: Colors.greenAccent, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          if (gameState.mercadoNegroDisponible)
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.purple.withAlpha(50),
                border: Border.all(color: Colors.purpleAccent, width: 2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('>>> MERCADO NEGRO ENCONTRADO <<<', style: GoogleFonts.orbitron(color: Colors.purpleAccent, fontWeight: FontWeight.bold)),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white54),
                        onPressed: () => gameState.desactivarMercadoNegro(),
                      )
                    ],
                  ),
                  const Text('Oferta por tiempo limitado. Al salir de la ciudad o cerrar desaparecerá.', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 160,
                    child: _ProductoCard(
                      titulo: 'Caja del Sindicato',
                      descripcion: 'Garantiza pieza Épica/Legendaria (Marca + Elemento + Habilidad).',
                      precio: 300,
                      icono: Icons.diamond,
                      colorIcono: Colors.purpleAccent,
                      puedeComprar: gameState.creditos >= 300,
                      onComprar: () {
                        if (gameState.gastarCreditos(300)) {
                          _generarPiezaLegendaria(context, gameState);
                        }
                      },
                    ),
                  ),
                ],
              ),
            ),
            
          // Productos Normales
          Expanded(
            child: GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.2,
              children: [
                _ProductoCard(
                  titulo: 'Kit de Reparación',
                  descripcion: 'Restaura el 100% de HP a todos los módulos de tu chasis actual. Indispensable antes de cazar jefes.',
                  precio: 50,
                  icono: Icons.build_circle,
                  colorIcono: Colors.greenAccent,
                  puedeComprar: gameState.creditos >= 50,
                  onComprar: () {
                    if (gameState.gastarCreditos(50)) {
                      gameState.curarRobotCompleto();
                      _mostrarSnack(context, 'Robot reparado al máximo.', Colors.greenAccent);
                    }
                  },
                ),
                _ProductoCard(
                  titulo: 'Caja de Chatarra',
                  descripcion: 'Contiene una pieza misteriosa de calidad básica. Excelente para refacciones de emergencia.',
                  precio: 100,
                  icono: Icons.all_inbox,
                  colorIcono: Colors.amber,
                  puedeComprar: gameState.creditos >= 100,
                  onComprar: () {
                    if (gameState.gastarCreditos(100)) {
                      _generarPiezaAleatoria(context, gameState);
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _generarPiezaAleatoria(BuildContext context, GameState state) {
    List<TipoModulo> tipos = [TipoModulo.cabeza, TipoModulo.brazoIzquierdo, TipoModulo.brazoDerecho, TipoModulo.piernas];
    TipoModulo tipoGenerado = tipos[Random().nextInt(tipos.length)];
    
    // 25% de prob de tener una pasiva rara
    TipoPasiva pasivaGenerada = TipoPasiva.ninguna;
    String prefijo = 'Chatarra de';
    
    if (Random().nextDouble() < 0.25) {
      List<TipoPasiva> pasivasPosibles = [TipoPasiva.critico, TipoPasiva.aturdir, TipoPasiva.roboDeVida];
      pasivaGenerada = pasivasPosibles[Random().nextInt(pasivasPosibles.length)];
      prefijo = '[RARO] Pieza de';
    }

    Modulo mod = Modulo(
      nombre: '$prefijo ${tipoGenerado.name}',
      tipo: tipoGenerado,
      pasiva: pasivaGenerada,
      hpMaximo: 20 + Random().nextInt(30), // 20 a 50
      bonusAtaque: tipoGenerado == TipoModulo.brazoIzquierdo || tipoGenerado == TipoModulo.brazoDerecho ? Random().nextInt(10) : 0,
      bonusVelocidad: tipoGenerado == TipoModulo.piernas ? Random().nextInt(5) : 0,
    );

    Item nuevoItem = Item(
      id: 'tienda_${DateTime.now().millisecondsSinceEpoch}',
      nombre: 'Caja Misteriosa: ${mod.nombre}',
      tipo: TipoItem.moduloDirecto,
      moduloAsociado: mod,
    );

    state.agregarLoot([nuevoItem]);
    _mostrarSnack(context, 'Has obtenido: ${mod.nombre}', Colors.amber);
  }

  void _generarPiezaLegendaria(BuildContext context, GameState state) {
    List<TipoModulo> tipos = [TipoModulo.cabeza, TipoModulo.brazoIzquierdo, TipoModulo.brazoDerecho, TipoModulo.piernas];
    TipoModulo tipoGenerado = tipos[Random().nextInt(tipos.length)];
    
    // Todo asegurado
    List<TipoPasiva> pasivasPosibles = [TipoPasiva.critico, TipoPasiva.aturdir, TipoPasiva.roboDeVida];
    TipoPasiva pasivaGenerada = pasivasPosibles[Random().nextInt(pasivasPosibles.length)];
    
    List<TipoElemento> elementosPosibles = [TipoElemento.fuego, TipoElemento.hielo, TipoElemento.corrosivo];
    TipoElemento elementoGenerado = elementosPosibles[Random().nextInt(elementosPosibles.length)];
    
    List<Marca> marcasPosibles = [Marca.titanio, Marca.oxido, Marca.neon];
    Marca marcaGenerada = marcasPosibles[Random().nextInt(marcasPosibles.length)];

    List<HabilidadActiva> habilidadesPosibles = [HabilidadActiva.canonLaser, HabilidadActiva.reparacion, HabilidadActiva.escudo, HabilidadActiva.ataqueRapido];
    HabilidadActiva habilidadGenerada = habilidadesPosibles[Random().nextInt(habilidadesPosibles.length)];

    String prefijo = '[LEGENDARIO] Pieza de';

    Modulo mod = Modulo(
      nombre: '$prefijo ${tipoGenerado.name}',
      tipo: tipoGenerado,
      pasiva: pasivaGenerada,
      elemento: elementoGenerado,
      marca: marcaGenerada,
      habilidadActiva: habilidadGenerada,
      hpMaximo: 50 + Random().nextInt(50), 
      bonusAtaque: tipoGenerado == TipoModulo.brazoIzquierdo || tipoGenerado == TipoModulo.brazoDerecho ? 10 + Random().nextInt(20) : 0,
      bonusVelocidad: tipoGenerado == TipoModulo.piernas ? 5 + Random().nextInt(15) : 0,
    );

    Item nuevoItem = Item(
      id: 'tienda_leg_${DateTime.now().millisecondsSinceEpoch}',
      nombre: 'Caja del Sindicato: ${mod.nombre}',
      tipo: TipoItem.moduloDirecto,
      moduloAsociado: mod,
    );

    state.agregarLoot([nuevoItem]);
    _mostrarSnack(context, 'Has obtenido: ${mod.nombre}', Colors.purpleAccent);
  }

  void _mostrarSnack(BuildContext context, String mensaje, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensaje, style: GoogleFonts.shareTechMono(color: Colors.black)),
        backgroundColor: color,
        duration: const Duration(seconds: 2),
      ),
    );
  }
}

class _ProductoCard extends StatelessWidget {
  final String titulo;
  final String descripcion;
  final int precio;
  final IconData icono;
  final Color colorIcono;
  final bool puedeComprar;
  final VoidCallback onComprar;

  const _ProductoCard({
    required this.titulo,
    required this.descripcion,
    required this.precio,
    required this.icono,
    required this.colorIcono,
    required this.puedeComprar,
    required this.onComprar,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF151515),
        border: Border.all(color: puedeComprar ? Colors.white24 : Colors.red.withAlpha(100)),
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icono, color: colorIcono, size: 32),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  titulo,
                  style: GoogleFonts.orbitron(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Expanded(
            child: Text(
              descripcion,
              style: const TextStyle(color: Colors.white60, fontSize: 12),
              overflow: TextOverflow.fade,
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: puedeComprar ? Colors.amber : Colors.grey[800],
                foregroundColor: Colors.black,
              ),
              onPressed: puedeComprar ? onComprar : null,
              child: Text(
                puedeComprar ? 'COMPRAR ($precio CHTR)' : 'FONDOS INSUFICIENTES',
                style: GoogleFonts.shareTechMono(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

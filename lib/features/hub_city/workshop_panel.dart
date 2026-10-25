import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/game_state.dart';
import '../../models/modulo.dart';


class WorkshopPanel extends StatelessWidget {
  const WorkshopPanel({super.key});

  @override
  Widget build(BuildContext context) {
    var gameState = context.watch<GameState>();
    var robot = gameState.robotPrincipal;

    if (robot == null) {
      return const Center(child: Text('No hay robot principal seleccionado.'));
    }

    return Row(
      children: [
        // Panel Izquierdo: Estadísticas del Robot Actual
        Expanded(
          flex: 1,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(right: BorderSide(color: Colors.amber, width: 2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ROBOT PRINCIPAL: ${robot.nombre}',
                  style: GoogleFonts.orbitron(fontSize: 18, color: Colors.cyanAccent),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('NIVEL ${robot.nivel}/20', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
                    Text('XP: ${robot.xpActual} / ${robot.xpRequerida}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 4),
                LinearProgressIndicator(
                  value: robot.nivel == 20 ? 1.0 : (robot.xpActual / robot.xpRequerida),
                  backgroundColor: Colors.white24,
                  color: Colors.amber,
                  minHeight: 6,
                ),
                const SizedBox(height: 16),
                _StatRow(label: 'ATAQUE TOTAL', value: '${robot.ataqueTotal}', color: Colors.redAccent),
                _StatRow(label: 'VELOCIDAD TOTAL', value: '${robot.velocidadTotal}', color: Colors.blueAccent),
                const Divider(color: Colors.white24, height: 32),
                Text('MÓDULOS EQUIPADOS', style: GoogleFonts.shareTechMono(color: Colors.white70)),
                const SizedBox(height: 8),
                _EquippedModuleCard(modulo: robot.cabeza),
                _EquippedModuleCard(modulo: robot.brazoIzquierdo),
                _EquippedModuleCard(modulo: robot.brazoDerecho),
                _EquippedModuleCard(modulo: robot.piernas),
              ],
            ),
          ),
        ),
        // Panel Derecho: Inventario
        Expanded(
          flex: 1,
          child: Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'INVENTARIO Y PIEZAS',
                  style: GoogleFonts.orbitron(fontSize: 18, color: Colors.amber),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: gameState.inventario.isEmpty
                      ? Center(child: Text('Inventario vacío. Explora para conseguir piezas.', style: TextStyle(color: Colors.white54)))
                      : ListView.builder(
                          itemCount: gameState.inventario.length,
                          itemBuilder: (context, index) {
                            var item = gameState.inventario[index];
                            return Card(
                              color: const Color(0xFF2A2A2A),
                              child: ListTile(
                                title: Text(item.nombre, style: const TextStyle(color: Colors.white)),
                                subtitle: item.moduloAsociado != null
                                    ? Text('Ataque: +${item.moduloAsociado!.bonusAtaque} | Vel: +${item.moduloAsociado!.bonusVelocidad}', style: TextStyle(color: Colors.white54))
                                    : null,
                                trailing: ElevatedButton(
                                  style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black),
                                  onPressed: item.moduloAsociado != null
                                      ? () => context.read<GameState>().equiparDesdeInventario(item)
                                      : null,
                                  child: const Text('EQUIPAR'),
                                ),
                              ),
                            );
                          },
                        ),
                )
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _StatRow extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatRow({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.shareTechMono(color: Colors.white, fontSize: 16)),
          Text(value, style: GoogleFonts.orbitron(color: color, fontSize: 20, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _EquippedModuleCard extends StatelessWidget {
  final Modulo modulo;

  const _EquippedModuleCard({required this.modulo});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        border: Border.all(color: Colors.white24),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(modulo.nombre, style: const TextStyle(color: Colors.white)),
          Text('HP: ${modulo.hpActual}/${modulo.hpMaximo}', style: const TextStyle(color: Colors.cyanAccent)),
        ],
      ),
    );
  }
}

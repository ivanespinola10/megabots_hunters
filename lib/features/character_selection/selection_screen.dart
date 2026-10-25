import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/game_state.dart';
import '../../models/robot.dart';
import '../../models/modulo.dart';
import '../hub_city/hub_screen.dart';

class SelectionScreen extends StatefulWidget {
  const SelectionScreen({super.key});

  @override
  State<SelectionScreen> createState() => _SelectionScreenState();
}

class _SelectionScreenState extends State<SelectionScreen> {
  int _selectedIndex = 1; // Default to Scout (center)

  final List<Robot> _starters = [
    Robot(
      id: 'p_striker',
      nombre: 'Striker Frame',
      cabeza: Modulo(nombre: 'Sensor de Asalto', tipo: TipoModulo.cabeza, hpMaximo: 60, bonusAtaque: 0, bonusVelocidad: 0),
      brazoIzquierdo: Modulo(nombre: 'Cuchilla Ligera L', tipo: TipoModulo.brazoIzquierdo, hpMaximo: 30, bonusAtaque: 15, bonusVelocidad: 0),
      brazoDerecho: Modulo(nombre: 'Cuchilla Ligera R', tipo: TipoModulo.brazoDerecho, hpMaximo: 30, bonusAtaque: 15, bonusVelocidad: 0),
      piernas: Modulo(nombre: 'Propulsores', tipo: TipoModulo.piernas, hpMaximo: 40, bonusAtaque: 0, bonusVelocidad: 8),
    ),
    Robot(
      id: 'p_scout',
      nombre: 'Scout Frame',
      cabeza: Modulo(nombre: 'Sensor Táctico', tipo: TipoModulo.cabeza, hpMaximo: 80, bonusAtaque: 0, bonusVelocidad: 0),
      brazoIzquierdo: Modulo(nombre: 'Rifle Básico L', tipo: TipoModulo.brazoIzquierdo, hpMaximo: 40, bonusAtaque: 8, bonusVelocidad: 0),
      brazoDerecho: Modulo(nombre: 'Escudo Básico R', tipo: TipoModulo.brazoDerecho, hpMaximo: 60, bonusAtaque: 2, bonusVelocidad: 0),
      piernas: Modulo(nombre: 'Bípedas Ágiles', tipo: TipoModulo.piernas, hpMaximo: 50, bonusAtaque: 0, bonusVelocidad: 4),
    ),
    Robot(
      id: 'p_bulwark',
      nombre: 'Bulwark Frame',
      cabeza: Modulo(nombre: 'Blindaje Pesado', tipo: TipoModulo.cabeza, hpMaximo: 120, bonusAtaque: 0, bonusVelocidad: 0),
      brazoIzquierdo: Modulo(nombre: 'Mazo Roto L', tipo: TipoModulo.brazoIzquierdo, hpMaximo: 80, bonusAtaque: 10, bonusVelocidad: 0),
      brazoDerecho: Modulo(nombre: 'Mazo Roto R', tipo: TipoModulo.brazoDerecho, hpMaximo: 80, bonusAtaque: 10, bonusVelocidad: 0),
      piernas: Modulo(nombre: 'Orugas Titan', tipo: TipoModulo.piernas, hpMaximo: 100, bonusAtaque: 0, bonusVelocidad: 0),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 32),
            Text(
              'INICIANDO SISTEMAS DE CAZA',
              style: GoogleFonts.orbitron(color: Colors.amber, fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Selecciona tu Chasis de Despliegue',
              style: GoogleFonts.shareTechMono(color: Colors.white70, fontSize: 16),
            ),
            const SizedBox(height: 32),
            Expanded(
              child: PageView.builder(
                controller: PageController(viewportFraction: 0.8, initialPage: 1),
                onPageChanged: (index) => setState(() => _selectedIndex = index),
                itemCount: _starters.length,
                itemBuilder: (context, index) {
                  bool isSelected = index == _selectedIndex;
                  return _StarterCard(
                    robot: _starters[index],
                    isSelected: isSelected,
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(32.0),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(double.infinity, 50),
                ),
                onPressed: () {
                  context.read<GameState>().seleccionarChasisInicial(_starters[_selectedIndex].clone());
                  Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HubScreen()));
                },
                child: Text('CONFIRMAR SELECCIÓN', style: GoogleFonts.orbitron(fontWeight: FontWeight.bold, fontSize: 18)),
              ),
            )
          ],
        ),
      ),
    );
  }
}

class _StarterCard extends StatelessWidget {
  final Robot robot;
  final bool isSelected;

  const _StarterCard({required this.robot, required this.isSelected});

  @override
  Widget build(BuildContext context) {
    int totalHp = robot.modulos.fold(0, (sum, m) => sum + m.hpMaximo);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: EdgeInsets.symmetric(horizontal: 8, vertical: isSelected ? 16 : 48),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        border: Border.all(color: isSelected ? Colors.amber : Colors.white24, width: isSelected ? 3 : 1),
        borderRadius: BorderRadius.circular(16),
        boxShadow: isSelected
            ? [BoxShadow(color: Colors.amber.withAlpha(100), blurRadius: 20, spreadRadius: 2)]
            : [],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Text(
              robot.nombre.toUpperCase(),
              style: GoogleFonts.orbitron(color: isSelected ? Colors.amber : Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ),
          const Divider(color: Colors.white24, height: 32),
          Text('ESTADÍSTICAS BASE', style: GoogleFonts.shareTechMono(color: Colors.cyanAccent)),
          const SizedBox(height: 16),
          _StatBar(label: 'HP TOTAL', value: totalHp, max: 400, color: Colors.green),
          const SizedBox(height: 8),
          _StatBar(label: 'ATAQUE', value: robot.ataqueTotal, max: 50, color: Colors.redAccent),
          const SizedBox(height: 8),
          _StatBar(label: 'VELOCIDAD', value: robot.velocidadTotal, max: 20, color: Colors.blueAccent),
          const Spacer(),
          Text(
            _getDescripcion(),
            style: const TextStyle(color: Colors.white70, fontSize: 14),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  String _getDescripcion() {
    if (robot.id.contains('striker')) return 'Alto riesgo, alta recompensa. Golpea primero, golpea duro.';
    if (robot.id.contains('bulwark')) return 'Una fortaleza móvil. Resiste cualquier embate enemigo.';
    return 'Versátil y confiable. Perfecto para misiones de reconocimiento.';
  }
}

class _StatBar extends StatelessWidget {
  final String label;
  final int value;
  final int max;
  final Color color;

  const _StatBar({required this.label, required this.value, required this.max, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(color: Colors.white)),
            Text('$value', style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 4),
        LinearProgressIndicator(
          value: value / max,
          backgroundColor: Colors.white12,
          color: color,
        ),
      ],
    );
  }
}

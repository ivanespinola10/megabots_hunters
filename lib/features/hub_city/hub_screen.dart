import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/game_state.dart';
import '../../providers/audio_service.dart';
import '../battle/battle_screen.dart';
import 'workshop_panel.dart';
import 'market_panel.dart';

class HubScreen extends StatefulWidget {
  const HubScreen({super.key});

  @override
  State<HubScreen> createState() => _HubScreenState();
}

class _HubScreenState extends State<HubScreen> {
  int _currentIndex = 0;
  final List<Widget> _panels = [
    const WorkshopPanel(),
    const ExplorationPanel(),
    const MarketPanel(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AudioService>().playBgm('hub_theme.mp3');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D), // Dark background
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1A1A),
        title: Text(
          'SECTOR 7 - HUB',
          style: GoogleFonts.orbitron(
            color: Colors.amber,
            fontWeight: FontWeight.bold,
            letterSpacing: 2.0,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Center(
              child: Consumer<GameState>(
                builder: (context, state, child) {
                  return Text(
                    'CHTR: ${state.creditos}',
                    style: GoogleFonts.shareTechMono(color: Colors.greenAccent),
                  );
                },
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white54),
            onPressed: () => _mostrarMenuGuardado(context),
          ),
        ],
      ),
      body: _panels[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF1A1A1A),
        selectedItemColor: Colors.amber,
        unselectedItemColor: Colors.white54,
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.build), label: 'Taller'),
          BottomNavigationBarItem(icon: Icon(Icons.explore), label: 'Explorar'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Mercado'),
        ],
      ),
    );
  }

  void _mostrarMenuGuardado(BuildContext context) {
    var state = context.read<GameState>();
    TextEditingController importCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: const Color(0xFF222222),
          title: Text('DATOS DE LA PARTIDA', style: GoogleFonts.orbitron(color: Colors.amber)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Puedes respaldar tu partida copiando el código y guardándolo en un archivo de texto.', style: TextStyle(color: Colors.white70)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blueAccent, foregroundColor: Colors.white),
                icon: const Icon(Icons.copy),
                label: const Text('COPIAR CÓDIGO DE GUARDADO'),
                onPressed: () {
                  String code = state.exportSave();
                  Clipboard.setData(ClipboardData(text: code));
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Partida copiada al portapapeles')));
                  Navigator.pop(ctx);
                },
              ),
              const Divider(color: Colors.white24, height: 32),
              TextField(
                controller: importCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'Pegar código para importar',
                  labelStyle: TextStyle(color: Colors.white54),
                  enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                  focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.amber)),
                ),
              ),
              const SizedBox(height: 8),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
                icon: const Icon(Icons.download),
                label: const Text('IMPORTAR (SOBRESCRIBIR)'),
                onPressed: () async {
                  bool success = await state.importSave(importCtrl.text);
                  if (!ctx.mounted) return;
                  Navigator.pop(ctx);
                  if (success) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Partida importada con éxito', style: TextStyle(color: Colors.greenAccent))));
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Código inválido', style: TextStyle(color: Colors.redAccent))));
                  }
                },
              ),
              const SizedBox(height: 16),
              const Divider(color: Colors.red, height: 32),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red[900], foregroundColor: Colors.white),
                icon: const Icon(Icons.warning),
                label: const Text('RESETEAR PARTIDA (BORRAR TODO)'),
                onPressed: () {
                  showDialog(
                    context: ctx,
                    builder: (alertCtx) => AlertDialog(
                      backgroundColor: Colors.black,
                      title: const Text('¿ESTÁS SEGURO?', style: TextStyle(color: Colors.red)),
                      content: const Text('Perderás tu robot, tu nivel y tus créditos de forma irreversible.', style: TextStyle(color: Colors.white)),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(alertCtx), child: const Text('CANCELAR', style: TextStyle(color: Colors.white54))),
                        TextButton(
                          onPressed: () {
                            state.hardReset();
                            Navigator.pop(alertCtx); // Cierra alert
                            Navigator.pop(ctx); // Cierra modal
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Partida borrada', style: TextStyle(color: Colors.red))));
                          },
                          child: const Text('SÍ, BORRAR', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('CERRAR', style: TextStyle(color: Colors.white54)),
            )
          ],
        );
      }
    );
  }
}

class ExplorationPanel extends StatelessWidget {
  const ExplorationPanel({super.key});

  @override
  Widget build(BuildContext context) {
    var gameState = context.watch<GameState>();
    
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'SELECCIONAR ZONA DE INCURSIÓN',
            style: GoogleFonts.orbitron(fontSize: 20, color: Colors.white),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: gameState.zonasDisponibles.length,
              itemBuilder: (context, index) {
                var zona = gameState.zonasDisponibles[index];
                return Card(
                  color: const Color(0xFF222222),
                  shape: RoundedRectangleBorder(
                    side: const BorderSide(color: Colors.amber, width: 1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    title: Text(
                      zona.nombreBioma,
                      style: GoogleFonts.shareTechMono(color: Colors.amber, fontSize: 18),
                    ),
                    subtitle: Text(
                      zona.descripcion,
                      style: const TextStyle(color: Colors.white70),
                    ),
                    trailing: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber,
                        foregroundColor: Colors.black,
                      ),
                      onPressed: () {
                        // Navegar a la batalla y curar al jugador antes de salir
                        gameState.curarRobotCompleto();
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => BattleScreen(zona: zona),
                          ),
                        );
                      },
                      child: const Text('INICIAR'),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

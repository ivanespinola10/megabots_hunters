import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/battle_engine.dart';

class BattleLogWidget extends StatelessWidget {
  const BattleLogWidget({super.key});

  @override
  Widget build(BuildContext context) {
    var logs = context.watch<BattleEngine>().logCombate;

    return Container(
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.greenAccent.withAlpha(128)), // Aprox 50% opacity
      ),
      child: ListView.builder(
        reverse: true, // Mostrar los más recientes abajo o mantener el orden invertido
        itemCount: logs.length,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 2.0),
            child: Text(
              logs[index],
              style: GoogleFonts.shareTechMono(
                color: Colors.greenAccent,
                fontSize: 14,
              ),
            ),
          );
        },
      ),
    );
  }
}

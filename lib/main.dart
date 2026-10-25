import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/gestures.dart';

import 'providers/game_state.dart';
import 'providers/battle_engine.dart';
import 'providers/audio_service.dart';
import 'features/hub_city/hub_screen.dart';
import 'features/character_selection/selection_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => GameState()),
        ChangeNotifierProvider(create: (_) => BattleEngine()),
        ChangeNotifierProvider(create: (_) => AudioService()),
      ],
      child: const MegabotsHuntersApp(),
    ),
  );
}

class MegabotsHuntersApp extends StatelessWidget {
  const MegabotsHuntersApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Megabots Hunters',
      debugShowCheckedModeBanner: false,
      scrollBehavior: const MaterialScrollBehavior().copyWith(
        dragDevices: {PointerDeviceKind.mouse, PointerDeviceKind.touch, PointerDeviceKind.stylus, PointerDeviceKind.unknown},
      ),
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.amber,
        scaffoldBackgroundColor: const Color(0xFF0D0D0D),
        textTheme: GoogleFonts.shareTechMonoTextTheme(
          Theme.of(context).textTheme.apply(bodyColor: Colors.white, displayColor: Colors.amber),
        ),
      ),
      home: const BootScreen(),
    );
  }
}

class BootScreen extends StatefulWidget {
  const BootScreen({super.key});

  @override
  State<BootScreen> createState() => _BootScreenState();
}

class _BootScreenState extends State<BootScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<GameState>().initGameData();
    });
  }

  @override
  Widget build(BuildContext context) {
    var isLoading = context.watch<GameState>().isLoadingData;

    if (isLoading) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(color: Colors.amber),
              const SizedBox(height: 16),
              Text('CONECTANDO AL NÚCLEO...', style: GoogleFonts.orbitron(color: Colors.amber)),
            ],
          ),
        ),
      );
    }

    var robot = context.watch<GameState>().robotPrincipal;
    if (robot == null) {
      return const SelectionScreen();
    }

    return const HubScreen();
  }
}

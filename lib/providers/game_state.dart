import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/modulo.dart';
import '../models/robot.dart';
import '../models/item.dart';
import '../models/world_zone.dart';

class GameState extends ChangeNotifier {
  Robot? robotPrincipal;
  List<Item> inventario = [];
  int creditos = 0;
  bool mercadoNegroDisponible = false;

  // Zonas inyectadas simuladas (fase 2)
  List<WorldZone> zonasDisponibles = [];
  List<Robot> enemigosDisponibles = [];
  bool isLoadingData = true;

  GameState();

  Future<void> saveGameState() async {
    final prefs = await SharedPreferences.getInstance();
    
    Map<String, dynamic> saveData = {
      'creditos': creditos,
      'inventario': inventario.map((i) => i.toJson()).toList(),
      'robotPrincipal': robotPrincipal?.toJson(),
      'mercadoNegroDisponible': mercadoNegroDisponible,
    };
    
    await prefs.setString('megabots_save', jsonEncode(saveData));
  }

  Future<void> _loadSavedGame() async {
    final prefs = await SharedPreferences.getInstance();
    final String? saveString = prefs.getString('megabots_save');
    
    if (saveString != null) {
      try {
        Map<String, dynamic> saveData = jsonDecode(saveString);
        creditos = saveData['creditos'] ?? 0;
        mercadoNegroDisponible = saveData['mercadoNegroDisponible'] ?? false;
        
        if (saveData['inventario'] != null) {
          inventario = (saveData['inventario'] as List).map((i) => Item.fromJson(i)).toList();
        }
        
        if (saveData['robotPrincipal'] != null) {
          robotPrincipal = Robot.fromJson(saveData['robotPrincipal']);
          curarRobotCompleto(); // Auto-curar al cargar como pidió el usuario
        }
      } catch (e) {
        print('Error parsing save data: $e');
      }
    }
  }

  void seleccionarChasisInicial(Robot seleccion) {
    robotPrincipal = seleccion;
    saveGameState();
    notifyListeners();
  }

  Future<void> initGameData() async {
    try {
      // Cargar Zonas
      final String zonasString = await rootBundle.loadString('assets/data/zonas.json');
      final List<dynamic> zonasJson = jsonDecode(zonasString);
      zonasDisponibles = zonasJson.map((json) => WorldZone.fromJson(json)).toList();

      // Cargar Enemigos
      final String enemigosString = await rootBundle.loadString('assets/data/enemigos.json');
      final List<dynamic> enemigosJson = jsonDecode(enemigosString);
      enemigosDisponibles = enemigosJson.map((json) => Robot.fromJson(json)).toList();

      // Cargar Save Data
      await _loadSavedGame();

      isLoadingData = false;
      notifyListeners();
    } catch (e) {
      print("Error cargando Game Data: $e");
      enemigosDisponibles = [
        Robot(
          id: 'e_scrapper',
          nombre: 'Scrapper Mk I',
          cabeza: Modulo(nombre: 'Sensor Óptico Básico', tipo: TipoModulo.cabeza, hpMaximo: 30),
          brazoIzquierdo: Modulo(nombre: 'Brazo Pinza', tipo: TipoModulo.brazoIzquierdo, hpMaximo: 20, bonusAtaque: 5),
          brazoDerecho: Modulo(nombre: 'Brazo Taladro', tipo: TipoModulo.brazoDerecho, hpMaximo: 20, bonusAtaque: 8),
          piernas: Modulo(nombre: 'Orugas Oxidadas', tipo: TipoModulo.piernas, hpMaximo: 40, bonusVelocidad: 3),
          nivel: 2,
        ),
        Robot(
          id: 'e_goliath',
          nombre: 'Goliath (JEFE)',
          cabeza: Modulo(nombre: 'Núcleo Acorazado', tipo: TipoModulo.cabeza, hpMaximo: 150, pasiva: TipoPasiva.aturdir),
          brazoIzquierdo: Modulo(nombre: 'Cañón Pesado de Iones', tipo: TipoModulo.brazoIzquierdo, hpMaximo: 80, bonusAtaque: 30, elemento: TipoElemento.hielo),
          brazoDerecho: Modulo(nombre: 'Lanza-Llamas Industrial', tipo: TipoModulo.brazoDerecho, hpMaximo: 80, bonusAtaque: 25, elemento: TipoElemento.fuego),
          piernas: Modulo(nombre: 'Base Cuadrúpeda Titanio', tipo: TipoModulo.piernas, hpMaximo: 100, bonusVelocidad: 15),
          nivel: 20,
        )
      ];

      zonasDisponibles = [
        WorldZone(
          id: 'z_vertedero',
          nombreBioma: 'Vertedero Metálico',
          descripcion: 'Zona ideal para principiantes. Chatarra abundante.',
          fondoVisual: '0xFF2A2A2A',
          enemigosIds: ['e_scrapper'],
        ),
        WorldZone(
          id: 'z_cero_boss',
          nombreBioma: 'ZONA CERO (JEFE FINAL)',
          descripcion: 'Solo para robots de élite (Nivel Recomendado: 18+).',
          fondoVisual: '0xFF4A0000',
          enemigosIds: ['e_goliath'],
        )
      ];
      isLoadingData = false;
      notifyListeners();
    }
  }

  void curarRobotCompleto() {
    if (robotPrincipal == null) return;
    for (var modulo in robotPrincipal!.modulos) {
      if (modulo.estado != EstadoModulo.destruido) {
        modulo.hpActual = modulo.hpMaximo;
      }
    }
    saveGameState();
    notifyListeners();
  }

  void agregarLoot(List<Item> items) {
    inventario.addAll(items);
    saveGameState();
    notifyListeners();
  }

  void equiparDesdeInventario(Item item) {
    if (robotPrincipal == null) return;
    if (item.tipo == TipoItem.moduloDirecto && item.moduloAsociado != null) {
      robotPrincipal!.equiparModulo(item.moduloAsociado!.clone());
      inventario.remove(item);
      saveGameState();
      notifyListeners();
    }
  }

  void agregarCreditos(int cantidad) {
    creditos += cantidad;
    saveGameState();
    notifyListeners();
  }

  void desactivarMercadoNegro() {
    mercadoNegroDisponible = false;
    saveGameState();
    notifyListeners();
  }

  void rollMercadoNegro() {
    if (!mercadoNegroDisponible) {
      if (Random().nextDouble() < 0.20) {
        mercadoNegroDisponible = true;
      }
    }
  }

  bool gastarCreditos(int cantidad) {
    if (creditos >= cantidad) {
      creditos -= cantidad;
      saveGameState();
      notifyListeners();
      return true;
    }
    return false;
  }

  String exportSave() {
    Map<String, dynamic> saveData = {
      'creditos': creditos,
      'inventario': inventario.map((i) => i.toJson()).toList(),
      'robotPrincipal': robotPrincipal?.toJson(),
      'mercadoNegroDisponible': mercadoNegroDisponible,
    };
    String jsonString = jsonEncode(saveData);
    List<int> bytes = utf8.encode(jsonString);
    return base64Encode(bytes);
  }

  Future<bool> importSave(String base64Save) async {
    try {
      List<int> bytes = base64Decode(base64Save);
      String jsonString = utf8.decode(bytes);
      Map<String, dynamic> saveData = jsonDecode(jsonString);
      
      creditos = saveData['creditos'] ?? 0;
      mercadoNegroDisponible = saveData['mercadoNegroDisponible'] ?? false;
      
      if (saveData['inventario'] != null) {
        inventario = (saveData['inventario'] as List).map((i) => Item.fromJson(i)).toList();
      } else {
        inventario = [];
      }
      
      if (saveData['robotPrincipal'] != null) {
        robotPrincipal = Robot.fromJson(saveData['robotPrincipal']);
        curarRobotCompleto();
      }
      
      await saveGameState();
      notifyListeners();
      return true;
    } catch (e) {
      // Ignorar errores de parseo (código inválido)
      return false;
    }
  }

  Future<void> hardReset() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('megabots_save');
    
    // Reiniciar valores en memoria
    creditos = 0;
    inventario = [];
    robotPrincipal = null;
    mercadoNegroDisponible = false;
    
    // Iniciar nuevo juego
    await initGameData();
  }
}

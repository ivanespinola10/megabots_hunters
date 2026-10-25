import 'dart:convert';
import 'lib/models/robot.dart';
import 'lib/models/modulo.dart';
import 'lib/models/item.dart';

void main() {
  var robot = Robot(
    id: 'p_striker',
    nombre: 'Striker Frame',
    cabeza: Modulo(nombre: 'Sensor de Asalto', tipo: TipoModulo.cabeza, hpMaximo: 60, bonusAtaque: 0, bonusVelocidad: 0),
    brazoIzquierdo: Modulo(nombre: 'Cuchilla Ligera L', tipo: TipoModulo.brazoIzquierdo, hpMaximo: 30, bonusAtaque: 15, bonusVelocidad: 0),
    brazoDerecho: Modulo(nombre: 'Cuchilla Ligera R', tipo: TipoModulo.brazoDerecho, hpMaximo: 30, bonusAtaque: 15, bonusVelocidad: 0),
    piernas: Modulo(nombre: 'Propulsores', tipo: TipoModulo.piernas, hpMaximo: 40, bonusAtaque: 0, bonusVelocidad: 8),
  );

  String jsonString = jsonEncode(robot.toJson());
  print("Encoded: $jsonString");

  try {
    var decoded = jsonDecode(jsonString);
    var newRobot = Robot.fromJson(decoded);
    print("Decoded successfully: ${newRobot.nombre}");
  } catch (e, stacktrace) {
    print("Error: $e");
    print(stacktrace);
  }
}

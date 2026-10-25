import 'modulo.dart';

enum TipoItem { plano, chatarraEspecializada, moduloDirecto }

class Item {
  final String id;
  final String nombre;
  final TipoItem tipo;
  
  // Si el item es un módulo directo o plano que construye un módulo específico
  final Modulo? moduloAsociado;

  Item({
    required this.id,
    required this.nombre,
    required this.tipo,
    this.moduloAsociado,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    TipoItem tipo = TipoItem.values.firstWhere((e) => e.toString() == json['tipo'], orElse: () => TipoItem.moduloDirecto);
    Modulo? mod;
    if (json['moduloAsociado'] != null) {
      // Necesitamos adivinar el TipoModulo por los datos o lo guardamos? 
      // Por suerte en el save lo podemos guardar y Modulo.fromJson pide TipoModulo, así que lo inyectamos acá
      var modJson = json['moduloAsociado'];
      var tipoModStr = modJson['tipoModulo']; // Añadiremos esto en toJson de Item para facilitar
      TipoModulo tipoModulo = TipoModulo.values.firstWhere((e) => e.toString() == tipoModStr, orElse: () => TipoModulo.cabeza);
      mod = Modulo.fromJson(modJson, tipoModulo);
    }
    return Item(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      tipo: tipo,
      moduloAsociado: mod,
    );
  }

  Map<String, dynamic> toJson() {
    Map<String, dynamic>? modJson;
    if (moduloAsociado != null) {
      modJson = moduloAsociado!.toJson();
      modJson['tipoModulo'] = moduloAsociado!.tipo.toString();
    }
    return {
      'id': id,
      'nombre': nombre,
      'tipo': tipo.toString(),
      'moduloAsociado': modJson,
    };
  }
}

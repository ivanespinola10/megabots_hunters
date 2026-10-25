enum TipoModulo { cabeza, brazoIzquierdo, brazoDerecho, piernas }
enum EstadoModulo { intacto, destruido }
enum TipoPasiva { ninguna, critico, aturdir, roboDeVida }
enum TipoElemento { neutro, fuego, corrosivo, hielo }
enum Marca { sinMarca, titanio, oxido, neon }
enum HabilidadActiva { ninguna, canonLaser, reparacion, escudo, ataqueRapido }

class Modulo {
  final String nombre;
  final TipoModulo tipo;
  final TipoPasiva pasiva;
  final TipoElemento elemento;
  final Marca marca;
  final HabilidadActiva habilidadActiva;
  final int hpMaximo;
  int hpActual;
  final int bonusAtaque;
  final int bonusVelocidad;
  EstadoModulo estado;

  Modulo({
    required this.nombre,
    required this.tipo,
    this.pasiva = TipoPasiva.ninguna,
    this.elemento = TipoElemento.neutro,
    this.marca = Marca.sinMarca,
    this.habilidadActiva = HabilidadActiva.ninguna,
    required this.hpMaximo,
    this.bonusAtaque = 0,
    this.bonusVelocidad = 0,
    int? hpActual,
    this.estado = EstadoModulo.intacto,
  }) : hpActual = hpActual ?? hpMaximo;

  factory Modulo.fromJson(Map<String, dynamic> json, TipoModulo tipoModulo) {
    return Modulo(
      nombre: json['nombre'] as String,
      tipo: TipoModulo.values.firstWhere((e) => e.toString() == json['tipo'], orElse: () => tipoModulo),
      pasiva: json['pasiva'] != null 
          ? TipoPasiva.values.firstWhere((e) => e.toString() == json['pasiva'], orElse: () => TipoPasiva.ninguna)
          : TipoPasiva.ninguna,
      elemento: json['elemento'] != null
          ? TipoElemento.values.firstWhere((e) => e.toString() == json['elemento'], orElse: () => TipoElemento.neutro)
          : TipoElemento.neutro,
      marca: json['marca'] != null
          ? Marca.values.firstWhere((e) => e.toString() == json['marca'], orElse: () => Marca.sinMarca)
          : Marca.sinMarca,
      habilidadActiva: json['habilidadActiva'] != null
          ? HabilidadActiva.values.firstWhere((e) => e.toString() == json['habilidadActiva'], orElse: () => HabilidadActiva.ninguna)
          : HabilidadActiva.ninguna,
      hpMaximo: json['hpMaximo'] as int,
      bonusAtaque: json['bonusAtaque'] as int,
      bonusVelocidad: json['bonusVelocidad'] as int,
      hpActual: json['hpActual'] as int?,
      estado: json['estado'] != null 
          ? EstadoModulo.values.firstWhere((e) => e.toString() == json['estado'])
          : EstadoModulo.intacto,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nombre': nombre,
      'hpMaximo': hpMaximo,
      'hpActual': hpActual,
      'bonusAtaque': bonusAtaque,
      'bonusVelocidad': bonusVelocidad,
      'estado': estado.toString(),
      'pasiva': pasiva.toString(),
      'elemento': elemento.toString(),
      'marca': marca.toString(),
      'habilidadActiva': habilidadActiva.toString(),
    };
  }

  void recibirDano(int cantidad) {
    if (estado == EstadoModulo.destruido) return;

    hpActual -= cantidad;
    if (hpActual <= 0) {
      hpActual = 0;
      estado = EstadoModulo.destruido;
    }
  }

  void curar(int cantidad) {
    if (estado == EstadoModulo.destruido) return;

    hpActual += cantidad;
    if (hpActual > hpMaximo) {
      hpActual = hpMaximo;
    }
  }

  Modulo clone() {
    return Modulo(
      nombre: nombre,
      tipo: tipo,
      pasiva: pasiva,
      elemento: elemento,
      marca: marca,
      habilidadActiva: habilidadActiva,
      hpMaximo: hpMaximo,
      bonusAtaque: bonusAtaque,
      bonusVelocidad: bonusVelocidad,
      hpActual: hpActual,
      estado: estado,
    );
  }
}

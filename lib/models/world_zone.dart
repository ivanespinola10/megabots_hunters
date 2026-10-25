class WorldZone {
  final String id;
  final String nombreBioma;
  final String descripcion;
  // TODO: Puede ser la ruta a un asset de imagen, por ahora usamos un color o representación simple
  final String fondoVisual; 
  final List<String> enemigosIds;

  WorldZone({
    required this.id,
    required this.nombreBioma,
    required this.descripcion,
    required this.fondoVisual,
    required this.enemigosIds,
  });

  // Factoría para simular la carga desde un JSON inyectable
  factory WorldZone.fromJson(Map<String, dynamic> json) {
    return WorldZone(
      id: json['id'],
      nombreBioma: json['nombreBioma'],
      descripcion: json['descripcion'],
      fondoVisual: json['fondoVisual'],
      enemigosIds: List<String>.from(json['enemigosIds']),
    );
  }
}

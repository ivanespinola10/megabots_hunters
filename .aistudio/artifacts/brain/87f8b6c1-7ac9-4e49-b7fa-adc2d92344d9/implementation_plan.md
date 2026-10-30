# Megabots Hunters — Estrategia Viral & Monetización Google Play Store

Transformación de **Megabots Hunters** en un videojuego táctico offline optimizado para retención viral y monetización ética de alta conversión para Google Play Store, sustituyendo los modelos desgastados por el modelo de **Prueba Completa de Sector 1 + Desbloqueo de Licencia de Cazador Élite (Pago Único)**.

***

### Análisis Estratégico: Modelos Desgastados vs. Nuestra Nueva Estrategia

#### 1. Las Estrategias Más Desgastadas (y Odiadas) en Google Play
*   **Anuncios Intersticiales Forzados tras cada derrota**: Cortan la inmersión, enfurecen al usuario y provocan reseñas de 1 estrella seguidas de desinstalación inmediata.
*   **Barreras Artificiales de Energía / Vidas con temporizador**: Obligan a esperar 4 horas o pagar micropagos para poder jugar un combate.
*   **Gacha depredador con probabilidades mínimas (0.5%)**: Sensación de estafa que aleja a jugadores que buscan progresión basada en habilidad.
*   **Obligatoriedad de conexión constante a Internet**: Elimina al público que juega en metro, viajes, vuelos o zonas sin cobertura móvil.

#### 2. Nuestra Estrategia Ganadora: "Licencia de Cazador Élite (Try-Before-You-Buy / Shareware Moderno)"
Inspirado en el éxito histórico de títulos de culto (*DOOM, Grimvalor, Dead Cells demo, Vampire Survivors*):
1.  **Sector 1 (Páramo del Núcleo Caído) 100% Gratuito y Completo**:
    *   Sin anuncios sorpresa.
    *   Experiencia pulida con selección de chasis, combate modular, taller de piezas, mercader y jefe de sector.
    *   El jugador se enamora de la jugabilidad y la profundidad de personalización antes de ver cualquier solicitud de compra.
2.  **Licencia de Cazador Élite (Pago Único Mínimo: ~$1.99 - $2.99)**:
    *   Desbloquea los Sectores 2, 3 y la Zona Cero (Jefe Goliath).
    *   Desbloquea el Modo Arena de Supervivencia Infinita.
    *   Desbloquea el Chasis Exclusivo "Titan Heavy Core" y acceso permanente al Mercado Negro del Sindicato.
    *   Garantía total: **100% Offline para siempre, sin suscripciones ni cobros recurrentes**.
3.  **Vía de Desbloqueo Híbrida / Viral (Alternativa F2P)**:
    *   Para usuarios sin tarjeta o menores de edad: pueden desbloquear el Sector 2 gratis superando un desafío de maestría en el Sector 1 (e.g. derrotar al Raptor sin perder ningún brazo) y exportando su "Ficha de Caza" para compartirla.
4.  **Anuncios Recompensados Opcionales (Solo por Elección del Usuario)**:
    *   Nunca forzados. Botón opcional: *"Sintonizar transmisión satelital"* para obtener 2x chatarra al ganar o 1 reparación de emergencia por incursion.

***

## Decisiones Críticas y Aprobación del Usuario

> [!IMPORTANT]
> **Decisiones clave integradas en este plan:**
> 1. **Modelo de Pago**: Sector 1 gratuito con bloqueo narrativo en Sector 2 ("Protocolo de Acceso Restringido"). Botón de compra simulada/real de "Licencia de Cazador Élite" que desbloquea todo el contenido.
> 2. **Motor de Viralidad**: Generador de "Ficha de Caza Táctica" (Canvas descargable/compartible con la build, nivel y nombre de tu robot para redes sociales o WhatsApp) + Modo Supervivencia Infinita con récord local.
> 3. **Empaquetado Móvil**: PWA standalone completa con soporte offline (`manifest.json`, iconos adaptativos maskable, Service Worker con precaché, y soporte para empaquetado directo en APK/AAB mediante Trusted Web Activity o Capacitor).

***

## 1. Experiencia de Usuario & Flujos de Juego

```
┌────────────────────────────────────────────────────────┐
│                   SECTOR 1 (GRATIS)                    │
│   Striker / Scout / Bulwark  →  Combate y Taller        │
│   Desmantelamiento de Piezas y Derrota del Raptor-Bot  │
└───────────────────────────┬────────────────────────────┘
                            │
               ¿Intentar viajar a Sector 2?
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    [COMPRAR LICENCIA ÉLITE]     [DESAFÍO MAESTRO F2P]
      Pago único ($1.99)        Récord o Logro en Sector 1
              │                           │
              └─────────────┬─────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│               CONTENIDO COMPLETO DESBLOQUEADO           │
│  • Sectores 2, 3 y Zona Cero (Jefe Goliath)            │
│  • Modo Arena Infinita de Supervivencia                │
│  • Chasis Élite Titan Core                             │
│  • Exportador de Ficha de Caza Viral                   │
└────────────────────────────────────────────────────────┘
```

### A. Pantalla de Selección & Sector 1 Gratuito
*   Experiencia inicial sin fricción. Al iniciar, el jugador elige su chasis de despliegue y combate en el Páramo del Núcleo Caído.
*   Tutorial orgánico integrado en la interfaz de combate con el bit de soporte y daño localizado en extremidades.

### B. El Bloqueo del Sector 2 & Modal de Licencia Élite
*   En el panel de Exploración, los Sectores 2, 3, Jefe Goliath y la Arena Infinita muestran un candado cibernético con la leyenda: *"ACCESO DENEGADO - REQUIERE LICENCIA ÉLITE DE CAZADOR"*.
*   Al pulsar, se despliega una pantalla de compra de estética cyberpunk que detalla todos los beneficios del desbloqueo completo permanente.
*   En el entorno actual, la compra se procesa mediante una pasarela simulada con persistencia en `localStorage`, lista para vincular a Google Play Billing (IAP) o Stripe.

### C. Ficha de Caza Viral (Compartir Build)
*   En el Taller, se incorpora un botón *"GENERAR FICHA DE COMBATE"*.
*   Renderiza una tarjeta gráfica de alta resolución en canvas con el robot del jugador, estadísticas totales, módulos equipados, nivel, sinergias de marca y un código QR/código de guardado para que otros jugadores puedan importar o enfrentar ese mecha.
*   Botón directo de *"Descargar Imagen"* y *"Compartir"* usando la Web Share API nativa de Android.

### D. Modo Arena Infinita de Supervivencia
*   Oleadas consecutivas de mechas aleatorios con dificultad progresiva.
*   Permite al jugador probar hasta dónde llega su chasis.
*   Marcador de racha máxima guardado en el perfil.

***

## 2. Identidad Visual & Diseño Móvil

*   **Paleta de Color (60-30-10)**:
    *   60% Lienzo Neutro Profundo: Negro grafito cibernético (`#0A0A0A`, `#111111`).
    *   30% Estructuras & Tarjetas: Paneles metálicos con bordes sutiles (`#1A1A1A`, `#222222`).
    *   10% Acentos: Ámbar industrial (`#F59E0B`), Cian holográfico (`#06B6D4`) y Dorado Élite (`#EAB308`).
*   **Tipografía**: `Orbitron` para títulos y rangos militares; `Share Tech Mono` con cifras tabulares para estadísticas y telemetría de combate.
*   **Controles Táctiles Optimizados**:
    *   Áreas de toque de mínimo 48px para pulgares.
    *   Respuesta háptica simulada/vibración (`navigator.vibrate`) en golpes críticos y victorias.
    *   Compatibilidad total con pantallas panorámicas y notch/safe-areas móviles.

***

## 3. Arquitectura Técnica & Persistencia

```
┌──────────────────────────────────────────────────────────────┐
│                      CAPA DE APLICACIÓN                      │
│                                                              │
│  ┌─────────────────┐   ┌──────────────────┐   ┌────────────┐ │
│  │   Selection     │   │     Sector 7     │   │   Battle   │ │
│  │     Screen      │   │    Hub Screen    │   │   Screen   │ │
│  └────────┬────────┘   └────────┬─────────┘   └─────┬──────┘ │
│           │                     │                   │        │
│  ┌────────▼─────────────────────▼───────────────────▼──────┐ │
│  │                     GameContext                         │ │
│  │  • robotPrincipal  • inventario    • creditos           │ │
│  │  • licenciaElite   • arenaRacha    • misionesDiarias    │ │
│  └──────────────────────────────┬──────────────────────────┘ │
│                                 │                            │
│  ┌──────────────────────────────▼──────────────────────────┐ │
│  │                    Servicios & PWA                      │ │
│  │  • soundEngine     • shareService  • pwaInstallService  │ │
│  │  • storageService  • billingService (IAP / Simulado)    │ │
│  └──────────────────────────────┬──────────────────────────┘ │
│                                 ▼                            │
│           LocalStorage  &  Cache Storage (ServiceWorker)     │
└──────────────────────────────────────────────────────────────┘
```

### Entidades y Estados Nuevos:
1.  `licenciaElite: boolean`: Controla el acceso irrestricto a todos los biomas, chasis especial y arena.
2.  `arenaRacha: number`: Máximo récord de oleadas consecutivas alcanzadas en la Arena Infinita.
3.  `misionDiariaCompletada: boolean`: Recompensa de chatarra por primer inicio de sesión del día.
4.  `PWA Service Worker & Manifest`:
    *   `public/manifest.json`: Configurado con `display: "standalone"`, `orientation: "portrait"`, iconos 192x192 y 512x512 maskable, y color de tema `#0D0D0D`.
    *   Botón de instalación en barra superior o taller (`PWAInstallButton`).

***

## Plan de Ejecución por Fases (Tras Aprobación)

1.  **Fase 1: Motor de Monetización y Licencia Élite**
    *   Integrar estado `licenciaElite` en `GameContext` y persistencia.
    *   Implementar candados cibernéticos y el modal interactivo de adquisición de la Licencia Élite con prueba simulada.
    *   Añadir el cuarto chasis desbloqueable: *Titan Heavy Core*.
2.  **Fase 2: Motor Viral & Ficha Táctica Compartible**
    *   Crear generador de ficha de mecha en Canvas con exportación de imagen (PNG) y Web Share API.
    *   Implementar Modo Arena Infinita de Supervivencia con selector de dificultad por oleadas.
3.  **Fase 3: Optimización PWA y Preparación Play Store**
    *   Crear `manifest.json`, iconos web compliant e in-app install prompt.
    *   Añadir retroalimentación háptica móvil (`navigator.vibrate`).
    *   Verificar compilación final con `compile_applet`.

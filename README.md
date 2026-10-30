# Megabots Hunters (React + TypeScript + Vite)

Cybernetic turn-based mecha combat RPG ported from Flutter to React with TypeScript and Tailwind CSS.

## Features

- **Chassis Selection (Despliegue)**: Choose between Striker Frame, Scout Frame, and Bulwark Frame with tailored base statistics (HP, Attack, Speed).
- **Sector 7 - Central Hub**:
  - **Taller (Workshop)**: Inspect robot level progression (Levels 1–20), equipped modules with durability/HP bars, set bonuses (Titanio HP, Óxido Attack, Neón Speed), and hot-swap salvage from inventory.
  - **Exploración (Biomes)**: Dispatch your hunter into dangerous sectors such as *Páramo del Núcleo Caído*, *Ciudad de Neón Muerta*, *Fábrica de Motores Infectada*, and *ZONA CERO (JEFE FINAL - Goliath)*.
  - **Mercado de Óxido (Market & Black Market)**: Repair kits, scrap surprise boxes, and time-limited Syndicate Black Market offerings.
- **Modular Turn-Based Combat Engine**:
  - Targeted module attacks: Core/Head (destruction causes immediate defeat), Left Arm, Right Arm, and Legs.
  - Elemental mechanics: Fuego (burn damage over time), Hielo (speed-halving freeze), and Corrosivo (+50% damage to limbs).
  - Active skills with energy management: Cañón Láser (2x dmg), Reparación de Emergencia (+30 HP head), Escudo de Energía (+15 HP all modules), and Ataque Rápido (undodgeable).
  - Bit de Soporte: Dynamic tactical assistant repairing your lowest damaged module or sabotaging enemy components.
  - Combat feedback: Hit shake animations, floating damage/heal numbers, and green phosphor battle telemetry log.
  - Salvage mechanics: Any destroyed limbs drop directly as equipable inventory modules.
- **Audio Synthesizer**: In-engine Web Audio SFX and ambient mecha soundscape with instant mute toggle.
- **Game State Persistence & Portability**: LocalStorage automatic synchronization, Base64 save export/import codes, and hard reset capabilities.

## Tech Stack

- React 19 + TypeScript
- Vite 6 + Tailwind CSS v4
- Lucide React Icons
- Web Audio API Sound Engine

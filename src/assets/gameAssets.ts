export const GAME_ASSETS = {
  // Mechas de inicio del jugador
  strikerMecha: '/src/assets/images/striker_frame_mech_1793405941625.jpg',
  scoutMecha: '/src/assets/images/mecha_player_scout_1793405685716.jpg',
  bulwarkMecha: '/src/assets/images/bulwark_frame_mech_1793405954657.jpg',
  titanEliteMecha: '/src/assets/images/titan_elite_mech_1793405967382.jpg',

  // Enemigos
  rustRaptor: '/src/assets/images/enemy_rust_raptor_1793405687360.jpg',
  neonCentipede: '/src/assets/images/enemy_neon_centipede_1793405687381.jpg',
  goliathBoss: '/src/assets/images/boss_titan_goliath_1793405686929.jpg',

  // Biomas
  crimsonWastelandBg: '/src/assets/images/biome_crimson_wasteland_1793405688573.jpg',

  // Retratos de Pilotos Ciberpunk
  pilotVance: '/src/assets/images/pilot_cyborg_veteran_1793405992148.jpg',
  pilotKira: '/src/assets/images/pilot_neon_hacker_1793406003568.jpg',
  pilotAether: '/src/assets/images/pilot_synth_operative_1793406019692.jpg',
  pilotThorne: '/src/assets/images/pilot_heavy_ace_1793406030704.jpg',
};

export function getRobotPortrait(robotId: string): string {
  const lower = robotId.toLowerCase();

  // Enemigos
  if (lower.includes('raptor')) {
    return GAME_ASSETS.rustRaptor;
  }
  if (lower.includes('centipede')) {
    return GAME_ASSETS.neonCentipede;
  }
  if (lower.includes('goliath') || lower.includes('golem')) {
    return GAME_ASSETS.goliathBoss;
  }

  // Mechas del Jugador
  if (lower.includes('striker')) {
    return GAME_ASSETS.strikerMecha;
  }
  if (lower.includes('bulwark')) {
    return GAME_ASSETS.bulwarkMecha;
  }
  if (lower.includes('titan')) {
    return GAME_ASSETS.titanEliteMecha;
  }
  if (lower.includes('scout')) {
    return GAME_ASSETS.scoutMecha;
  }

  return GAME_ASSETS.scoutMecha;
}

export function getZoneBackground(zoneId: string): string {
  return GAME_ASSETS.crimsonWastelandBg;
}

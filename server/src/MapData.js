// =============================================================================
//  MapData.js - Emergency Crew map definition
//  30x24 tile-based isometric space station with 9 rooms
//  Merged from version_Arthur (S-Mopty/Emergency-Crew)
// =============================================================================

// Tile types: 0=void, 1=metal floor, 2=hub grate, 3=corridor, 4=elevated, 5=hazard grate
const MAP_TILES = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,0,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,0,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,1,1,1,1,1,1,0],
  [0,0,0,0,1,1,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,1,1,0,0,0],
  [0,0,0,0,3,3,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,3,3,0,0,0],
  [0,0,0,0,3,3,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,3,3,0,0,0],
  [0,0,0,0,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,3,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,0,0,0,3,2,2,2,2,2,2,2,2,3,0,0,0,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,3,3,3,3,2,2,2,2,2,2,2,2,3,3,3,3,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,3,3,3,3,2,2,2,2,2,2,2,2,3,3,3,3,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,0,0,0,0,3,2,2,2,2,2,2,2,2,3,0,0,0,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,0,0,0,0,3,2,2,2,2,2,2,2,2,3,0,0,0,0,1,1,1,1,0,0],
  [0,0,0,1,1,0,0,0,0,0,3,2,2,2,2,2,2,2,2,3,0,0,0,0,1,1,1,1,0,0],
  [0,0,0,3,3,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,3,3,0,0,0],
  [0,0,0,3,3,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,3,3,0,0,0],
  [0,1,1,1,1,1,1,1,0,0,5,5,5,5,5,5,5,5,5,5,0,0,0,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,0,0,5,5,5,5,5,5,5,5,5,5,0,0,0,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,0,0,0,0,5,5,5,5,5,5,5,5,5,5,0,0,0,1,1,1,1,0,0,0],
  [0,1,1,1,1,1,0,0,0,0,5,5,5,5,5,5,5,5,5,5,0,0,0,1,1,1,1,0,0,0],
  [0,1,1,1,1,1,0,0,0,0,5,5,5,5,5,5,5,5,5,5,0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const MAP_W = 30;
const MAP_H = 24;

// 16 machines across 9 rooms
const MACHINES = {
  storage_heat:    { x: 2.5,  y: 2,    machineType: 'overheat',      requiredItem: 'coolant' },
  storage_gas:     { x: 6.5,  y: 1.5,  machineType: 'gas_leak',      requiredItem: 'welding_kit' },
  command_circuit: { x: 14.5, y: 2,    machineType: 'short_circuit',  requiredItem: 'fuse' },
  reactor_gas:     { x: 25.5, y: 2,    machineType: 'gas_leak',      requiredItem: 'welding_kit' },
  reactor_cool:    { x: 27,   y: 3,    machineType: 'overheat',      requiredItem: 'coolant' },
  hub_circuit1:    { x: 13,   y: 11,   machineType: 'short_circuit',  requiredItem: 'fuse' },
  hub_circuit2:    { x: 16,   y: 11,   machineType: 'short_circuit',  requiredItem: 'fuse' },
  med_gas:         { x: 3,    y: 12,   machineType: 'gas_leak',      requiredItem: 'welding_kit' },
  med_heat:        { x: 5,    y: 14,   machineType: 'overheat',      requiredItem: 'coolant' },
  elec_circuit:    { x: 25.5, y: 12,   machineType: 'short_circuit',  requiredItem: 'fuse' },
  elec_cool:       { x: 27,   y: 13,   machineType: 'overheat',      requiredItem: 'coolant' },
  armory_gas:      { x: 3,    y: 20,   machineType: 'gas_leak',      requiredItem: 'welding_kit' },
  engine_heat1:    { x: 13,   y: 20,   machineType: 'overheat',      requiredItem: 'coolant' },
  engine_heat2:    { x: 16,   y: 20,   machineType: 'overheat',      requiredItem: 'coolant' },
  engine_gas:      { x: 18,   y: 19,   machineType: 'gas_leak',      requiredItem: 'welding_kit' },
  life_circuit:    { x: 25,   y: 20,   machineType: 'short_circuit',  requiredItem: 'fuse' },
};

// 11 item spawn locations across storage, medical, armory, engine
const ITEM_SPAWNS = [
  { x: 2, y: 1.5 }, { x: 4, y: 1.5 }, { x: 6, y: 1.5 },
  { x: 2, y: 3 },   { x: 4, y: 3 },
  { x: 2, y: 11 },  { x: 4, y: 13 },
  { x: 2, y: 19 },  { x: 5, y: 20 },
  { x: 11, y: 19 }, { x: 14, y: 22 },
];

// Player spawns in central hub
const PLAYER_SPAWNS = [
  { x: 13.5, y: 11 },
  { x: 15.5, y: 11 },
  { x: 13.5, y: 13 },
  { x: 15.5, y: 13 },
];

function isWalkable(x, y) {
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);
  if (tileX < 0 || tileX >= MAP_W || tileY < 0 || tileY >= MAP_H) return false;
  return MAP_TILES[tileY][tileX] > 0;
}

module.exports = { MAP_TILES, MAP_W, MAP_H, MACHINES, ITEM_SPAWNS, PLAYER_SPAWNS, isWalkable };

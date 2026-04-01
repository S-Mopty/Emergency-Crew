// =============================================================================
//  MapData.js - Emergency Crew map definition
//  16x14 tile-based isometric map with 4 connected areas
// =============================================================================

// Tile types: 0 = void (unwalkable), 1 = dirt (walkable), 2 = planks/station (walkable)
const MAP_TILES = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // row 0
  [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0], // row 1: Storage(L) + Reactor(R)
  [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0], // row 2
  [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0], // row 3
  [0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0], // row 4: corridors
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0], // row 5: Hub top
  [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0], // row 6: Hub
  [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0], // row 7: Hub
  [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0], // row 8: Hub bottom
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0], // row 9: corridor
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0], // row 10: Electrical top
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0], // row 11: Electrical
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0], // row 12: Electrical
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // row 13
];

const MAP_W = 16;
const MAP_H = 14;

// Machine definitions: id -> { x, y, machineType, requiredItem }
// machineType matches emergency type that can occur on it
const MACHINES = {
  reactor_gas:  { x: 12, y: 2,  machineType: "gas_leak",      requiredItem: "welding_kit" },
  reactor_cool: { x: 13, y: 3,  machineType: "overheat",      requiredItem: "coolant" },
  hub_circuit1: { x: 7,  y: 6,  machineType: "short_circuit",  requiredItem: "fuse" },
  hub_circuit2: { x: 9,  y: 7,  machineType: "short_circuit",  requiredItem: "fuse" },
  elec_gas:     { x: 7,  y: 11, machineType: "gas_leak",      requiredItem: "welding_kit" },
  elec_cool:    { x: 8,  y: 11, machineType: "overheat",      requiredItem: "coolant" },
};

// Item spawn points (Storage Room, top-left area)
const ITEM_SPAWNS = [
  { x: 2, y: 2 },
  { x: 3, y: 2 },
  { x: 2, y: 3 },
  { x: 3, y: 3 },
];

// Player spawn points (Hub, center area)
const PLAYER_SPAWNS = [
  { x: 6, y: 6 },
  { x: 8, y: 6 },
  { x: 6, y: 8 },
  { x: 8, y: 8 },
];

/**
 * Check if a world position is on a walkable tile.
 * Positions are in tile float coords; we check the tile at floor(x), floor(y).
 * @param {number} x - world x in tile coords
 * @param {number} y - world y in tile coords
 * @returns {boolean}
 */
function isWalkable(x, y) {
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);
  if (tileX < 0 || tileX >= MAP_W || tileY < 0 || tileY >= MAP_H) return false;
  return MAP_TILES[tileY][tileX] > 0;
}

module.exports = { MAP_TILES, MAP_W, MAP_H, MACHINES, ITEM_SPAWNS, PLAYER_SPAWNS, isWalkable };

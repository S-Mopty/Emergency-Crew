// =============================================================================
//  GameState.js - Emergency Crew Colyseus schema definitions
//  All networked state is defined here using @colyseus/schema + defineTypes
// =============================================================================

const schema = require("@colyseus/schema");
const { Schema, MapSchema, defineTypes } = schema;

// =============================================================================
//  Player Schema
// =============================================================================
class Player extends Schema {
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.state = "normal";        // "normal" | "stunned" | "knocked" | "repairing"
    this.stateTimer = 0;          // seconds remaining in current state
    this.carryingItemId = "";     // id of carried item, or ""
    this.color = 0;               // player color index (0-3)
    this.score = 0;               // maintenance credits
    this.attackCooldown = 0;      // seconds until next wrench hit
    this.dashCooldown = 0;        // seconds until next dash
    this.repairTarget = "";       // machineId being repaired, or ""
    this.repairProgress = 0;      // 0..1 progress toward repair completion
  }
}
defineTypes(Player, {
  x:               "number",
  y:               "number",
  vx:              "number",
  vy:              "number",
  state:           "string",
  stateTimer:      "number",
  carryingItemId:  "string",
  color:           "uint8",
  score:           "number",
  attackCooldown:  "number",
  dashCooldown:    "number",
  repairTarget:    "string",
  repairProgress:  "number",
});

// =============================================================================
//  Machine Schema
// =============================================================================
class Machine extends Schema {
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.machineType = "";        // "gas_leak" | "short_circuit" | "overheat"
    this.status = "working";      // "working" | "broken"
    this.requiredItem = "";       // item type needed to repair
    this.repairProgress = 0;      // 0..1 current repair progress
    this.repairerId = "";         // sessionId of player repairing, or ""
  }
}
defineTypes(Machine, {
  x:              "number",
  y:              "number",
  machineType:    "string",
  status:         "string",
  requiredItem:   "string",
  repairProgress: "number",
  repairerId:     "string",
});

// =============================================================================
//  Item Schema
// =============================================================================
class GameItem extends Schema {
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.itemType = "";           // "welding_kit" | "fuse" | "coolant"
    this.carried = false;
    this.carrierId = "";          // sessionId of carrier, or ""
  }
}
defineTypes(GameItem, {
  x:         "number",
  y:         "number",
  itemType:  "string",
  carried:   "boolean",
  carrierId: "string",
});

// =============================================================================
//  Emergency Schema
// =============================================================================
class Emergency extends Schema {
  constructor() {
    super();
    this.machineId = "";          // which machine is affected
    this.emergencyType = "";      // "gas_leak" | "short_circuit" | "overheat"
    this.active = true;
    this.timeRemaining = 0;       // seconds left before consequence (overheat explosion)
  }
}
defineTypes(Emergency, {
  machineId:     "string",
  emergencyType: "string",
  active:        "boolean",
  timeRemaining: "number",
});

// =============================================================================
//  Root Game State
// =============================================================================
class GameState extends Schema {
  constructor() {
    super();
    this.players     = new MapSchema();
    this.machines    = new MapSchema();
    this.items       = new MapSchema();
    this.emergencies = new MapSchema();
    this.stability   = 100;       // 0-100, if 0 everyone loses
    this.timer       = 180;       // seconds remaining (3 minutes)
    this.phase       = "waiting"; // "waiting" | "playing" | "ended"
    this.hostId      = "";        // sessionId of room creator
  }
}
defineTypes(GameState, {
  players:     { map: Player },
  machines:    { map: Machine },
  items:       { map: GameItem },
  emergencies: { map: Emergency },
  stability:   "number",
  timer:       "number",
  phase:       "string",
  hostId:      "string",
});

module.exports = { Player, Machine, GameItem, Emergency, GameState };

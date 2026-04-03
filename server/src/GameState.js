// =============================================================================
//  GameState.js - Emergency Crew Colyseus schema definitions
// =============================================================================

const schema = require("@colyseus/schema");
const { Schema, MapSchema, defineTypes } = schema;

// =============================================================================
//  Player Schema
// =============================================================================
class Player extends Schema {
  constructor() {
    super();
    this.x = 0; this.y = 0;
    this.vx = 0; this.vy = 0;
    this.state = "normal";
    this.stateTimer = 0;
    this.carryingItemId = "";
    this.color = 0;
    this.score = 0;
    this.attackCooldown = 0;
    this.dashCooldown = 0;
    this.repairTarget = "";
    this.repairProgress = 0;
    this.koCount = 0;
    this.nickname = "";
    this.ready = false;
    this.hat = 0;
    this.accessory = 0;
    this.characterType = 0;
    this.laserCooldown = 0;
    // Power-up system
    this.powerUpType = "";        // "" | "speed" | "shield" | "turbo_repair" | "invisible"
    this.powerUpTimer = 0;        // seconds remaining
    // Emote
    this.emote = "";              // "" | "hello" | "help" | "follow" | "ok"
    this.emoteTimer = 0;          // seconds remaining
  }
}
defineTypes(Player, {
  x: "number", y: "number", vx: "number", vy: "number",
  state: "string", stateTimer: "number",
  carryingItemId: "string", color: "uint8", score: "number",
  attackCooldown: "number", dashCooldown: "number",
  repairTarget: "string", repairProgress: "number",
  koCount: "uint8", nickname: "string", ready: "boolean",
  hat: "uint8", accessory: "uint8", characterType: "uint8",
  laserCooldown: "number",
  powerUpType: "string", powerUpTimer: "number",
  emote: "string", emoteTimer: "number",
});

// =============================================================================
//  Machine Schema
// =============================================================================
class Machine extends Schema {
  constructor() {
    super();
    this.x = 0; this.y = 0;
    this.machineType = "";
    this.status = "working";
    this.requiredItem = "";
    this.repairProgress = 0;
    this.repairerId = "";
  }
}
defineTypes(Machine, {
  x: "number", y: "number", machineType: "string",
  status: "string", requiredItem: "string",
  repairProgress: "number", repairerId: "string",
});

// =============================================================================
//  Item Schema
// =============================================================================
class GameItem extends Schema {
  constructor() {
    super();
    this.x = 0; this.y = 0;
    this.itemType = "";
    this.carried = false;
    this.carrierId = "";
  }
}
defineTypes(GameItem, {
  x: "number", y: "number", itemType: "string",
  carried: "boolean", carrierId: "string",
});

// =============================================================================
//  Emergency Schema
// =============================================================================
class Emergency extends Schema {
  constructor() {
    super();
    this.machineId = "";
    this.emergencyType = "";
    this.active = true;
    this.timeRemaining = 0;
  }
}
defineTypes(Emergency, {
  machineId: "string", emergencyType: "string",
  active: "boolean", timeRemaining: "number",
});

// =============================================================================
//  PowerUp Schema (NEW)
// =============================================================================
class PowerUp extends Schema {
  constructor() {
    super();
    this.x = 0; this.y = 0;
    this.powerType = "";          // "speed" | "shield" | "turbo_repair" | "invisible" | "shockwave"
    this.active = true;
    this.lifeTimer = 15;          // seconds before it disappears
  }
}
defineTypes(PowerUp, {
  x: "number", y: "number", powerType: "string",
  active: "boolean", lifeTimer: "number",
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
    this.powerUps    = new MapSchema();
    this.stability   = 100;
    this.timer       = 180;
    this.phase       = "waiting";
    this.hostId      = "";
  }
}
defineTypes(GameState, {
  players:     { map: Player },
  machines:    { map: Machine },
  items:       { map: GameItem },
  emergencies: { map: Emergency },
  powerUps:    { map: PowerUp },
  stability:   "number",
  timer:       "number",
  phase:       "string",
  hostId:      "string",
});

module.exports = { Player, Machine, GameItem, Emergency, PowerUp, GameState };

// =============================================================================
//  GameRoom.js - Emergency Crew authoritative game server
//  All physics, combat, repair, emergency, and scoring logic runs here.
// =============================================================================

const { Room } = require("colyseus");
const { GameState, Player, Machine, GameItem, Emergency } = require("./GameState");
const { MACHINES, ITEM_SPAWNS, PLAYER_SPAWNS, isWalkable } = require("./MapData");

// =============================================================================
//  Constants
// =============================================================================
const TICK_RATE            = 20;    // Hz (simulation interval)
const PLAYER_SPEED         = 3.5;   // tiles/s
const PLAYER_RADIUS        = 0.35;  // tiles
const PICKUP_RANGE         = 1.8;   // tiles
const ATTACK_RANGE         = 1.5;   // tiles
const ATTACK_KNOCKBACK     = 3;     // tiles (ejection distance)
const ATTACK_COOLDOWN      = 1;     // seconds
const DASH_SPEED           = 8;     // tiles/s
const DASH_DURATION        = 0.3;   // seconds
const DASH_COOLDOWN        = 3;     // seconds
const DASH_RADIUS          = 0.5;   // tiles (hit radius during dash)
const STUN_DURATION        = 1.5;   // seconds (wrench hit)
const KNOCKED_DURATION     = 2;     // seconds (dash knockdown)
const REPAIR_DURATION      = 3;     // seconds to fully repair
const REPAIR_RANGE         = 1.5;   // tiles
const STABILITY_DRAIN      = 2;     // pts/s per active emergency
const STABILITY_REPAIR_BONUS = 15;  // pts restored on repair
const EMERGENCY_INTERVAL_MIN = 15;  // seconds
const EMERGENCY_INTERVAL_MAX = 20;  // seconds
const MAX_ACTIVE_EMERGENCIES = 3;
const GAME_DURATION        = 180;   // seconds (3 minutes)
const OVERHEAT_TIMEOUT     = 30;    // seconds before explosion
const ITEM_RESPAWN_DELAY   = 5;     // seconds after consumption
const AUTO_DISPOSE_DELAY   = 30;    // seconds after game ends
const SCORE_MINOR_REPAIR   = 20;
const SCORE_CRITICAL_REPAIR = 100;
const SCORE_KO             = 5;

// Item types that can spawn, cycled through spawn points
const ITEM_TYPES = ["welding_kit", "fuse", "coolant"];

class GameRoom extends Room {

  // ===========================================================================
  //  Lifecycle
  // ===========================================================================

  onCreate(_options) {
    this.setState(new GameState());

    // Internal bookkeeping (not synced to clients)
    this.inputs = {};                // sessionId -> latest input
    this.colorIndex = 0;             // rotating color assignment
    this.emergencyIdCounter = 0;     // unique id for emergencies
    this.itemIdCounter = 0;          // unique id for items
    this.nextEmergencyTimer = 0;     // seconds until next emergency spawn
    this.itemRespawnQueue = [];      // { spawnIndex, itemType, timer }
    this.dashStates = {};            // sessionId -> { timer, dx, dy }
    this.disposeTimeout = null;

    // Spawn machines from map data
    this._initMachines();

    // Spawn initial items in Storage Room
    this._spawnInitialItems();

    // Schedule first emergency
    this._scheduleNextEmergency();

    // --- Message handlers ---
    this.onMessage("input", (client, data) => {
      const prev = this.inputs[client.sessionId];
      if (prev) {
        // Preserve server-side handled flags across input updates
        data._pickupHandled = prev._pickupHandled || false;
        data._attackHandled = prev._attackHandled || false;
        data._dashHandled   = prev._dashHandled   || false;
      }
      this.inputs[client.sessionId] = data;
    });

    this.onMessage("start_game", (client, _data) => {
      this._handleStartGame(client);
    });

    console.log("[GameRoom] Created, waiting for players...");
  }

  onJoin(client, _options) {
    const player = new Player();
    const spawnIdx = this.colorIndex % PLAYER_SPAWNS.length;
    const spawn = PLAYER_SPAWNS[spawnIdx];
    player.x = spawn.x + 0.5;  // center of tile
    player.y = spawn.y + 0.5;
    player.color = this.colorIndex % 4;
    this.colorIndex++;

    this.state.players.set(client.sessionId, player);
    this.inputs[client.sessionId] = { sx: 0, sy: 0, pickup: false, attack: false, dash: false, repair: false };

    // First player becomes host
    if (this.state.hostId === "") {
      this.state.hostId = client.sessionId;
    }

    console.log(`[GameRoom] + Player ${client.sessionId} joined (color ${player.color}, ${this.state.players.size} total)`);
  }

  onLeave(client, _consented) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      // Drop carried item
      if (player.carryingItemId) {
        this._dropItem(player, client.sessionId);
      }
      // If player was repairing a machine, reset that machine's repair state
      if (player.repairTarget) {
        this._cancelRepair(player, client.sessionId);
      }
      this.state.players.delete(client.sessionId);
    }
    delete this.inputs[client.sessionId];
    delete this.dashStates[client.sessionId];

    // If host left, assign new host
    if (this.state.hostId === client.sessionId) {
      const remaining = Array.from(this.state.players.keys());
      this.state.hostId = remaining.length > 0 ? remaining[0] : "";
    }

    console.log(`[GameRoom] - Player ${client.sessionId} left (${this.state.players.size} remaining)`);
  }

  onDispose() {
    if (this.disposeTimeout) clearTimeout(this.disposeTimeout);
    console.log("[GameRoom] Disposed");
  }

  // ===========================================================================
  //  Start Game
  // ===========================================================================

  _handleStartGame(client) {
    if (this.state.phase !== "waiting") return;
    if (client.sessionId !== this.state.hostId) return;
    if (this.state.players.size < 2) return;

    this.state.phase = "playing";
    this.state.timer = GAME_DURATION;
    this.state.stability = 100;

    // Start the simulation loop
    this.setSimulationInterval((dt) => this._tick(dt / 1000), 1000 / TICK_RATE);

    this.broadcast("game_started", {});
    console.log("[GameRoom] Game started!");
  }

  // ===========================================================================
  //  Main Tick (called at TICK_RATE Hz during "playing" phase)
  // ===========================================================================

  _tick(dt) {
    if (this.state.phase !== "playing") return;

    // 1. Timer countdown
    this.state.timer -= dt;
    if (this.state.timer <= 0) {
      this.state.timer = 0;
      this._endGame("timer_up");
      return;
    }

    // 2. Player systems
    this._updatePlayerStates(dt);
    this._applyInputs(dt);
    this._updateDashes(dt);
    this._movePlayers(dt);
    this._resolveWallCollisions();
    this._resolvePlayerCollisions();
    this._processPickups();
    this._processAttacks(dt);
    this._processDashInputs();
    this._processRepairs(dt);
    this._updateCarriedItems();

    // 3. Emergency system
    this._updateEmergencies(dt);
    this._tickEmergencySpawner(dt);

    // 4. Item respawns
    this._updateItemRespawns(dt);

    // 5. Cooldowns
    this._updateCooldowns(dt);
  }

  // ===========================================================================
  //  Player State Machine
  // ===========================================================================

  _updatePlayerStates(dt) {
    this.state.players.forEach((player, sid) => {
      if (player.state === "stunned" || player.state === "knocked") {
        player.stateTimer -= dt;
        if (player.stateTimer <= 0) {
          player.stateTimer = 0;
          player.state = "normal";
        }
      }
    });
  }

  // ===========================================================================
  //  Input Processing -> Velocity
  // ===========================================================================

  _applyInputs(_dt) {
    this.state.players.forEach((player, sid) => {
      // Only accept movement input in normal state
      if (player.state !== "normal") {
        // If stunned/knocked, zero velocity (frozen)
        if (player.state === "stunned" || player.state === "knocked") {
          player.vx = 0;
          player.vy = 0;
        }
        // If repairing, no movement
        if (player.state === "repairing") {
          player.vx = 0;
          player.vy = 0;
        }
        return;
      }

      const input = this.inputs[sid];
      if (!input) return;

      const { sx, sy } = input;

      // Iso conversion: screen direction -> world direction (2:1 ratio)
      // worldDx = screenDx + 2 * screenDy
      // worldDy = -screenDx + 2 * screenDy
      const wx = sx + 2 * sy;
      const wy = -sx + 2 * sy;
      const len = Math.sqrt(wx * wx + wy * wy);

      if (len > 0) {
        player.vx = (wx / len) * PLAYER_SPEED;
        player.vy = (wy / len) * PLAYER_SPEED;
      } else {
        player.vx = 0;
        player.vy = 0;
      }
    });
  }

  // ===========================================================================
  //  Movement
  // ===========================================================================

  _movePlayers(dt) {
    this.state.players.forEach((player, sid) => {
      if (player.state === "repairing") return;

      // Dashing players use dash velocity instead
      const dash = this.dashStates[sid];
      if (dash && dash.timer > 0) {
        player.x += dash.dx * DASH_SPEED * dt;
        player.y += dash.dy * DASH_SPEED * dt;
      } else {
        player.x += player.vx * dt;
        player.y += player.vy * dt;
      }
    });
  }

  _resolveWallCollisions() {
    this.state.players.forEach((player) => {
      // Clamp to walkable tiles. Check current position and push back if in a wall.
      if (!isWalkable(player.x, player.y)) {
        // Try to push back to last valid position by checking adjacent options
        // Simple approach: clamp to nearest walkable tile center
        const tileX = Math.floor(player.x);
        const tileY = Math.floor(player.y);

        // Check 4 adjacent tiles and push toward nearest walkable one
        const candidates = [
          { x: tileX + 0.5, y: tileY + 0.5 },
          { x: tileX + 1.5, y: tileY + 0.5 },
          { x: tileX - 0.5, y: tileY + 0.5 },
          { x: tileX + 0.5, y: tileY + 1.5 },
          { x: tileX + 0.5, y: tileY - 0.5 },
        ];

        let bestDist = Infinity;
        let bestPos = null;
        for (const c of candidates) {
          if (isWalkable(c.x, c.y)) {
            const d = Math.hypot(c.x - player.x, c.y - player.y);
            if (d < bestDist) {
              bestDist = d;
              bestPos = c;
            }
          }
        }
        if (bestPos) {
          player.x = bestPos.x;
          player.y = bestPos.y;
        }
        player.vx = 0;
        player.vy = 0;
      }

      // Also ensure player radius doesn't clip into adjacent void tiles
      this._pushOutOfWalls(player);
    });
  }

  /**
   * Push player out of walls if their radius overlaps a void tile.
   * Checks the 4 cardinal neighbors of the player's current tile.
   */
  _pushOutOfWalls(player) {
    const r = PLAYER_RADIUS;
    // Check each edge
    const tileX = Math.floor(player.x);
    const tileY = Math.floor(player.y);
    const fracX = player.x - tileX;
    const fracY = player.y - tileY;

    // Left wall
    if (fracX < r && !isWalkable(tileX - 1 + 0.5, tileY + 0.5)) {
      player.x = tileX + r;
    }
    // Right wall
    if (fracX > 1 - r && !isWalkable(tileX + 1 + 0.5, tileY + 0.5)) {
      player.x = tileX + 1 - r;
    }
    // Top wall
    if (fracY < r && !isWalkable(tileX + 0.5, tileY - 1 + 0.5)) {
      player.y = tileY + r;
    }
    // Bottom wall
    if (fracY > 1 - r && !isWalkable(tileX + 0.5, tileY + 1 + 0.5)) {
      player.y = tileY + 1 - r;
    }
  }

  _resolvePlayerCollisions() {
    const ids = Array.from(this.state.players.keys());
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const p1 = this.state.players.get(ids[i]);
        const p2 = this.state.players.get(ids[j]);

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = PLAYER_RADIUS * 2;

        if (dist < minDist && dist > 0.001) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;

          // Separate equally
          p1.x -= nx * overlap * 0.5;
          p1.y -= ny * overlap * 0.5;
          p2.x += nx * overlap * 0.5;
          p2.y += ny * overlap * 0.5;
        }
      }
    }
  }

  // ===========================================================================
  //  Pickup System
  // ===========================================================================

  _processPickups() {
    this.state.players.forEach((player, sid) => {
      if (player.state !== "normal") return;
      const input = this.inputs[sid];
      if (!input) return;

      // Toggle on rising edge of pickup
      if (input.pickup && !input._pickupHandled) {
        input._pickupHandled = true;

        if (player.carryingItemId) {
          // Drop the item
          this._dropItem(player, sid);
        } else {
          // Pick up nearest item within range
          let bestId = null;
          let bestDist = PICKUP_RANGE;

          this.state.items.forEach((item, itemId) => {
            if (item.carried) return;
            const d = Math.hypot(item.x - player.x, item.y - player.y);
            if (d < bestDist) {
              bestDist = d;
              bestId = itemId;
            }
          });

          if (bestId) {
            const item = this.state.items.get(bestId);
            item.carried = true;
            item.carrierId = sid;
            player.carryingItemId = bestId;
          }
        }
      } else if (!input.pickup) {
        input._pickupHandled = false;
      }
    });
  }

  _updateCarriedItems() {
    this.state.players.forEach((player) => {
      if (!player.carryingItemId) return;
      const item = this.state.items.get(player.carryingItemId);
      if (item) {
        item.x = player.x;
        item.y = player.y;
      }
    });
  }

  // ===========================================================================
  //  Combat: Wrench Attack (SPACE)
  // ===========================================================================

  _processAttacks(dt) {
    this.state.players.forEach((attacker, atkId) => {
      if (attacker.state !== "normal") return;
      if (attacker.attackCooldown > 0) return;

      const input = this.inputs[atkId];
      if (!input || !input.attack) return;
      if (input._attackHandled) return;
      input._attackHandled = true;

      // Put attack on cooldown immediately
      attacker.attackCooldown = ATTACK_COOLDOWN;

      // Find closest enemy in range
      let bestTarget = null;
      let bestTargetId = null;
      let bestDist = ATTACK_RANGE;

      this.state.players.forEach((target, targetId) => {
        if (targetId === atkId) return;
        const d = Math.hypot(target.x - attacker.x, target.y - attacker.y);
        if (d < bestDist) {
          bestDist = d;
          bestTarget = target;
          bestTargetId = targetId;
        }
      });

      if (bestTarget) {
        this._applyHit(attacker, atkId, bestTarget, bestTargetId, "stunned", STUN_DURATION, ATTACK_KNOCKBACK);
        attacker.score += SCORE_KO;
      }
    });

    // Reset attack handled flag on release
    this.state.players.forEach((_player, sid) => {
      const input = this.inputs[sid];
      if (input && !input.attack) {
        input._attackHandled = false;
      }
    });
  }

  // ===========================================================================
  //  Combat: Dash (SHIFT)
  // ===========================================================================

  _processDashInputs() {
    this.state.players.forEach((player, sid) => {
      if (player.state !== "normal") return;
      if (player.dashCooldown > 0) return;

      const input = this.inputs[sid];
      if (!input || !input.dash) return;
      if (input._dashHandled) return;
      input._dashHandled = true;

      // Determine dash direction from current velocity or last input
      let dx = player.vx;
      let dy = player.vy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 0.01) {
        // Default: dash in the direction of current input
        const wx = (input.sx || 0) + 2 * (input.sy || 0);
        const wy = -(input.sx || 0) + 2 * (input.sy || 0);
        const wlen = Math.sqrt(wx * wx + wy * wy);
        if (wlen > 0) {
          dx = wx / wlen;
          dy = wy / wlen;
        } else {
          // No direction: dash forward (arbitrary, use +x)
          dx = 1;
          dy = 0;
        }
      } else {
        dx /= len;
        dy /= len;
      }

      // Start dash
      player.dashCooldown = DASH_COOLDOWN;
      this.dashStates[sid] = { timer: DASH_DURATION, dx, dy, hitPlayers: new Set() };
    });

    // Reset dash handled flag on release
    this.state.players.forEach((_player, sid) => {
      const input = this.inputs[sid];
      if (input && !input.dash) {
        input._dashHandled = false;
      }
    });
  }

  _updateDashes(dt) {
    for (const sid in this.dashStates) {
      const dash = this.dashStates[sid];
      if (dash.timer <= 0) continue;

      dash.timer -= dt;
      const dasher = this.state.players.get(sid);
      if (!dasher) {
        delete this.dashStates[sid];
        continue;
      }

      // Check collision with other players during dash
      this.state.players.forEach((target, targetId) => {
        if (targetId === sid) return;
        if (dash.hitPlayers.has(targetId)) return; // already hit this dash
        const d = Math.hypot(target.x - dasher.x, target.y - dasher.y);
        if (d < DASH_RADIUS + PLAYER_RADIUS) {
          dash.hitPlayers.add(targetId);
          this._applyHit(dasher, sid, target, targetId, "knocked", KNOCKED_DURATION, ATTACK_KNOCKBACK);
          dasher.score += SCORE_KO;
        }
      });

      if (dash.timer <= 0) {
        delete this.dashStates[sid];
      }
    }
  }

  // ===========================================================================
  //  Hit Application (shared by wrench + dash)
  // ===========================================================================

  _applyHit(attacker, attackerId, target, targetId, stateType, stateDuration, knockback) {
    // Direction from attacker to target
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let nx = 0, ny = 0;
    if (dist > 0.001) {
      nx = dx / dist;
      ny = dy / dist;
    } else {
      nx = 1; ny = 0; // fallback direction
    }

    // Apply knockback (instant teleport in push direction)
    target.x += nx * knockback;
    target.y += ny * knockback;

    // Set target state
    target.state = stateType;
    target.stateTimer = stateDuration;
    target.vx = 0;
    target.vy = 0;

    // Target drops carried item
    if (target.carryingItemId) {
      this._dropItem(target, targetId);
    }

    // If target was repairing, cancel repair
    if (target.repairTarget) {
      this._cancelRepair(target, targetId);
    }
  }

  // ===========================================================================
  //  Repair System
  // ===========================================================================

  _processRepairs(dt) {
    this.state.players.forEach((player, sid) => {
      const input = this.inputs[sid];
      if (!input) return;

      // Start or continue repair
      if (input.repair && player.state === "normal") {
        if (!player.repairTarget) {
          // Try to start a repair: find nearest broken machine in range
          // that the player has the correct item for
          this._tryStartRepair(player, sid);
        }
      }

      // Continue active repair
      if (player.state === "repairing" && player.repairTarget) {
        const machine = this.state.machines.get(player.repairTarget);
        if (!machine || machine.status !== "broken") {
          // Machine no longer broken (repaired by someone else?)
          this._cancelRepair(player, sid);
          return;
        }

        // Check player still in range
        const d = Math.hypot(machine.x + 0.5 - player.x, machine.y + 0.5 - player.y);
        if (d > REPAIR_RANGE) {
          this._cancelRepair(player, sid);
          return;
        }

        // Check player still holding correct item
        if (!player.carryingItemId) {
          this._cancelRepair(player, sid);
          return;
        }
        const item = this.state.items.get(player.carryingItemId);
        if (!item || item.itemType !== machine.requiredItem) {
          this._cancelRepair(player, sid);
          return;
        }

        // If player released repair key, cancel
        if (!input.repair) {
          this._cancelRepair(player, sid);
          return;
        }

        // Progress the repair
        player.repairProgress += dt / REPAIR_DURATION;
        machine.repairProgress = player.repairProgress;

        if (player.repairProgress >= 1) {
          this._completeRepair(player, sid, machine, player.repairTarget);
        }
      }

      // If player is repairing but released the key
      if (player.state === "repairing" && !input.repair) {
        this._cancelRepair(player, sid);
      }
    });
  }

  _tryStartRepair(player, sid) {
    if (!player.carryingItemId) return;
    const item = this.state.items.get(player.carryingItemId);
    if (!item) return;

    let bestMachineId = null;
    let bestDist = REPAIR_RANGE;

    this.state.machines.forEach((machine, machineId) => {
      if (machine.status !== "broken") return;
      if (machine.requiredItem !== item.itemType) return;
      // Machine already being repaired by someone else? Allow steal.
      const d = Math.hypot(machine.x + 0.5 - player.x, machine.y + 0.5 - player.y);
      if (d < bestDist) {
        bestDist = d;
        bestMachineId = machineId;
      }
    });

    if (bestMachineId) {
      const machine = this.state.machines.get(bestMachineId);

      // If someone else is repairing this machine, kick them off
      if (machine.repairerId && machine.repairerId !== sid) {
        const prevRepairer = this.state.players.get(machine.repairerId);
        if (prevRepairer) {
          prevRepairer.state = "normal";
          prevRepairer.repairTarget = "";
          prevRepairer.repairProgress = 0;
        }
      }

      player.state = "repairing";
      player.repairTarget = bestMachineId;
      player.repairProgress = 0;
      machine.repairerId = sid;
      machine.repairProgress = 0;
    }
  }

  _completeRepair(player, sid, machine, machineId) {
    // Determine score: overheat is critical, others are minor
    const emergency = this._findEmergencyForMachine(machineId);
    let points = SCORE_MINOR_REPAIR;
    if (emergency) {
      // Critical if overheat OR if time remaining < 10s (urgent)
      if (emergency.emergencyType === "overheat" || emergency.timeRemaining < 10) {
        points = SCORE_CRITICAL_REPAIR;
      }
    }

    player.score += points;

    // Consume the item
    const itemId = player.carryingItemId;
    const item = this.state.items.get(itemId);
    const itemType = item ? item.itemType : "";
    const itemSpawnIndex = item ? item._spawnIndex : -1;

    // Remove item and queue respawn
    if (item) {
      this.state.items.delete(itemId);
      player.carryingItemId = "";

      // Queue respawn at the original spawn point
      if (typeof itemSpawnIndex === "number" && itemSpawnIndex >= 0) {
        this.itemRespawnQueue.push({
          spawnIndex: itemSpawnIndex,
          itemType: itemType,
          timer: ITEM_RESPAWN_DELAY,
        });
      }

      this.broadcast("item_used", { itemId });
    }

    // Fix the machine
    machine.status = "working";
    machine.repairProgress = 0;
    machine.repairerId = "";

    // Deactivate the emergency
    if (emergency) {
      emergency.active = false;
    }

    // Restore stability
    this.state.stability = Math.min(100, this.state.stability + STABILITY_REPAIR_BONUS);

    // Reset player state
    player.state = "normal";
    player.repairTarget = "";
    player.repairProgress = 0;

    this.broadcast("repair_complete", { playerId: sid, machineId, points });
    console.log(`[GameRoom] Repair complete: ${sid} fixed ${machineId} (+${points} pts)`);
  }

  _cancelRepair(player, sid) {
    if (player.repairTarget) {
      const machine = this.state.machines.get(player.repairTarget);
      if (machine && machine.repairerId === sid) {
        machine.repairProgress = 0;
        machine.repairerId = "";
      }
    }
    player.state = "normal";
    player.repairTarget = "";
    player.repairProgress = 0;
  }

  // ===========================================================================
  //  Emergency System
  // ===========================================================================

  _tickEmergencySpawner(dt) {
    this.nextEmergencyTimer -= dt;
    if (this.nextEmergencyTimer <= 0) {
      this._spawnEmergency();
      this._scheduleNextEmergency();
    }
  }

  _scheduleNextEmergency() {
    this.nextEmergencyTimer = EMERGENCY_INTERVAL_MIN +
      Math.random() * (EMERGENCY_INTERVAL_MAX - EMERGENCY_INTERVAL_MIN);
  }

  _spawnEmergency() {
    // Count active emergencies
    let activeCount = 0;
    this.state.emergencies.forEach((e) => { if (e.active) activeCount++; });
    if (activeCount >= MAX_ACTIVE_EMERGENCIES) return;

    // Find machines that are currently working (not already broken)
    const availableMachines = [];
    this.state.machines.forEach((machine, machineId) => {
      if (machine.status === "working") {
        availableMachines.push(machineId);
      }
    });
    if (availableMachines.length === 0) return;

    // Pick a random machine
    const machineId = availableMachines[Math.floor(Math.random() * availableMachines.length)];
    const machine = this.state.machines.get(machineId);

    // Break the machine
    machine.status = "broken";

    // Create the emergency
    const emergencyId = `emg_${++this.emergencyIdCounter}`;
    const emergency = new Emergency();
    emergency.machineId = machineId;
    emergency.emergencyType = machine.machineType;
    emergency.active = true;
    emergency.timeRemaining = (machine.machineType === "overheat") ? OVERHEAT_TIMEOUT : 999;

    this.state.emergencies.set(emergencyId, emergency);
    this.broadcast("emergency_spawn", {
      emergencyId,
      machineId,
      type: machine.machineType,
    });

    console.log(`[GameRoom] Emergency: ${machine.machineType} on ${machineId}`);
  }

  _updateEmergencies(dt) {
    let activeCount = 0;

    this.state.emergencies.forEach((emergency, emergencyId) => {
      if (!emergency.active) return;
      activeCount++;

      // Overheat countdown
      if (emergency.emergencyType === "overheat") {
        emergency.timeRemaining -= dt;
        if (emergency.timeRemaining <= 0) {
          this._endGame("overheat_explosion");
          return;
        }
      }
    });

    // Drain stability based on active emergency count
    if (activeCount > 0) {
      this.state.stability -= STABILITY_DRAIN * activeCount * dt;
      if (this.state.stability <= 0) {
        this.state.stability = 0;
        this._endGame("stability_zero");
      }
    }
  }

  _findEmergencyForMachine(machineId) {
    let found = null;
    this.state.emergencies.forEach((emergency) => {
      if (emergency.machineId === machineId && emergency.active) {
        found = emergency;
      }
    });
    return found;
  }

  // ===========================================================================
  //  Item Spawning & Respawning
  // ===========================================================================

  _spawnInitialItems() {
    for (let i = 0; i < ITEM_SPAWNS.length; i++) {
      const spawn = ITEM_SPAWNS[i];
      const itemType = ITEM_TYPES[i % ITEM_TYPES.length];
      this._spawnItem(spawn.x + 0.5, spawn.y + 0.5, itemType, i);
    }
  }

  _spawnItem(x, y, itemType, spawnIndex) {
    const id = `item_${++this.itemIdCounter}`;
    const item = new GameItem();
    item.x = x;
    item.y = y;
    item.itemType = itemType;
    item._spawnIndex = spawnIndex; // internal, not synced
    this.state.items.set(id, item);
    return id;
  }

  _updateItemRespawns(dt) {
    for (let i = this.itemRespawnQueue.length - 1; i >= 0; i--) {
      const entry = this.itemRespawnQueue[i];
      entry.timer -= dt;
      if (entry.timer <= 0) {
        const spawn = ITEM_SPAWNS[entry.spawnIndex];
        if (spawn) {
          this._spawnItem(spawn.x + 0.5, spawn.y + 0.5, entry.itemType, entry.spawnIndex);
        }
        this.itemRespawnQueue.splice(i, 1);
      }
    }
  }

  // ===========================================================================
  //  Cooldowns
  // ===========================================================================

  _updateCooldowns(dt) {
    this.state.players.forEach((player) => {
      if (player.attackCooldown > 0) {
        player.attackCooldown = Math.max(0, player.attackCooldown - dt);
      }
      if (player.dashCooldown > 0) {
        player.dashCooldown = Math.max(0, player.dashCooldown - dt);
      }
    });
  }

  // ===========================================================================
  //  Game End
  // ===========================================================================

  _endGame(reason) {
    if (this.state.phase === "ended") return;
    this.state.phase = "ended";

    // Determine winner: highest score. If stability_zero, no winner.
    const scores = {};
    let winner = null;
    let highScore = -1;

    this.state.players.forEach((player, sid) => {
      scores[sid] = {
        score: player.score,
        color: player.color,
        kos: player.kos || 0,
      };
      if (reason !== "stability_zero" && player.score > highScore) {
        highScore = player.score;
        winner = sid;
      }
    });

    this.broadcast("game_over", { reason, winner, scores });
    console.log(`[GameRoom] Game Over: ${reason}, winner: ${winner || "none"}`);

    // Stop simulation
    // setSimulationInterval with null interval effectively stops it
    this.setSimulationInterval(() => {}, 1000);

    // Auto-dispose after delay
    this.disposeTimeout = setTimeout(() => {
      this.disconnect();
    }, AUTO_DISPOSE_DELAY * 1000);
  }

  // ===========================================================================
  //  Initialization Helpers
  // ===========================================================================

  _initMachines() {
    for (const [machineId, def] of Object.entries(MACHINES)) {
      const machine = new Machine();
      machine.x = def.x;
      machine.y = def.y;
      machine.machineType = def.machineType;
      machine.status = "working";
      machine.requiredItem = def.requiredItem;
      this.state.machines.set(machineId, machine);
    }
  }

  _dropItem(player, sid) {
    const item = this.state.items.get(player.carryingItemId);
    if (item) {
      item.carried = false;
      item.carrierId = "";
      // Drop slightly in front of the player
      item.x = player.x + 0.5;
      item.y = player.y + 0.5;
    }
    player.carryingItemId = "";
  }
}

module.exports = { GameRoom };

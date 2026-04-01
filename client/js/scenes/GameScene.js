// ============================================================
//  Emergency Crew - GameScene (Full Gameplay)
//  Isometric 64x32 rendering with Kenney assets + Colyseus sync
// ============================================================

const TILE_W = 64;
const TILE_H = 32;
const MAP_W  = 16;
const MAP_H  = 14;

const ASSET_SCALE    = 0.25;     // Kenney 256px -> 64px
const ASSET_ORIGIN_Y = 0.875;   // Diamond base center in 256x512 image

const PLAYER_COLORS = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12];
const PLAYER_NAMES  = ['Bleu', 'Rouge', 'Vert', 'Orange'];

const ITEM_LABELS = {
  welding_kit: 'Kit Soudure',
  fuse:        'Fusible',
  coolant:     'Refrigerant',
};

const MACHINE_LABELS = {
  gas_valve:       'Vanne Gaz',
  circuit_breaker: 'Disjoncteur',
  cooling_unit:    'Refroidisseur',
};

const EMERGENCY_LABELS = {
  gas_leak:       'FUITE DE GAZ',
  short_circuit:  'COURT-CIRCUIT',
  overheat:       'SURCHAUFFE',
};

// 0=void, 1=dirt, 2=planks
const MAP_TILES = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0],
  [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0],
  [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0],
  [0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0],
  [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
  [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
  [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
  [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const TILE_KEYS = { 0: null, 1: 'tile_dirt', 2: 'tile_planks' };

// Room label positions (tile coords -> labels)
const ROOM_LABELS = [
  { text: 'STOCKAGE',        col: 2.5, row: 2,   color: '#ffd93d' },
  { text: 'REACTEUR',        col: 12.5, row: 2,  color: '#ff6b6b' },
  { text: 'HUB CENTRAL',     col: 7.5, row: 6.5, color: '#74b9ff' },
  { text: 'SALLE ELECTRIQUE', col: 7.5, row: 11,  color: '#a29bfe' },
];

// Static decorations
const DECORATIONS = [
  // Stockage area
  { key: 'deco_corn',   col: 1,  row: 1 },
  { key: 'deco_corn',   col: 2,  row: 1 },
  { key: 'deco_corn',   col: 1,  row: 3 },
  // Reactor area
  { key: 'deco_fence',  col: 11, row: 1 },
  { key: 'deco_fence',  col: 14, row: 1 },
  // Hub borders
  { key: 'deco_fence',  col: 5,  row: 5 },
  { key: 'deco_fence',  col: 10, row: 5 },
  // Electrical room
  { key: 'deco_ladder', col: 6,  row: 10 },
  { key: 'deco_wall',   col: 9,  row: 10 },
  // Misc
  { key: 'deco_hay',    col: 4,  row: 4 },
  { key: 'deco_hay',    col: 10, row: 4 },
];

// Machine texture mappings
const MACHINE_TEXTURES = {
  gas_valve:       'machine_gas_valve',
  circuit_breaker: 'machine_circuit_breaker',
  cooling_unit:    'machine_cooling_unit',
};

// Item texture mappings
const ITEM_TEXTURES = {
  welding_kit: 'item_welding_kit',
  fuse:        'item_fuse',
  coolant:     'item_coolant',
};

// ----------------------------------------------------------
//  Iso helpers
// ----------------------------------------------------------
function worldToScreen(wx, wy) {
  return {
    x: (wx - wy) * (TILE_W / 2),
    y: (wx + wy) * (TILE_H / 2),
  };
}

// ============================================================
export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.room = data.room || null;
    this.playerSprites  = {};
    this.machineSprites = {};
    this.itemSprites    = {};
    this.hudElements    = {};
    this.emergencyOverlays = {};
    this.localSessionId = this.room ? this.room.sessionId : null;
  }

  // ----------------------------------------------------------
  //  PRELOAD
  // ----------------------------------------------------------
  preload() {
    const base = '/assets/Isometric/';

    // Floor tiles
    this.load.image('tile_dirt',   base + 'dirt_S.png');
    this.load.image('tile_planks', base + 'planks_S.png');

    // Decorations
    this.load.image('deco_fence',     base + 'fenceHigh_S.png');
    this.load.image('deco_corn',      base + 'corn_S.png');
    this.load.image('deco_hay',       base + 'hayBales_S.png');
    this.load.image('deco_hayStack',  base + 'hayBalesStacked_S.png');
    this.load.image('deco_ladder',    base + 'ladderStand_S.png');
    this.load.image('deco_wall',      base + 'woodWall_S.png');

    // Machine assets
    this.load.image('machine_gas_valve',       base + 'woodWallWindow_S.png');
    this.load.image('machine_circuit_breaker',  base + 'woodWallDoorClosed_S.png');
    this.load.image('machine_cooling_unit',     base + 'chimneyBase_S.png');

    // Item assets
    this.load.image('item_welding_kit', base + 'sacksCrate_S.png');
    this.load.image('item_fuse',        base + 'sack_S.png');
    this.load.image('item_coolant',     base + 'hayBalesStacked_S.png');
  }

  // ----------------------------------------------------------
  //  CREATE
  // ----------------------------------------------------------
  create() {
    // Camera offset to center the map
    this.camOX = this.cameras.main.width / 2 - (MAP_W - MAP_H) * (TILE_W / 4);
    this.camOY = 60;

    // Generate player textures
    this._genPlayerTextures();

    // Draw world
    this._drawFloor();
    this._drawDecorations();
    this._drawRoomLabels();

    // Create HUD
    this._createHUD();

    // Setup input
    this._setupInput();

    // Create emergency effect layers
    this._createEffectLayers();

    // Setup Colyseus listeners
    if (this.room) {
      this._setupRoomListeners();
    }
  }

  // ----------------------------------------------------------
  //  Player Texture Generation
  // ----------------------------------------------------------
  _genPlayerTextures() {
    PLAYER_COLORS.forEach((color, i) => {
      const key = `player_${i}`;
      if (this.textures.exists(key)) return;

      const g = this.make.graphics({ add: false });
      const w = 32, h = 48;

      // Shadow
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(w / 2, h - 4, 26, 12);

      // Body (iso diamond)
      g.fillStyle(color);
      g.beginPath();
      g.moveTo(w / 2, 12);
      g.lineTo(w - 2, h * 0.45);
      g.lineTo(w / 2, h - 6);
      g.lineTo(2, h * 0.45);
      g.closePath();
      g.fillPath();

      // Body outline
      g.lineStyle(2, 0xffffff, 0.4);
      g.strokePath();

      // Head
      g.fillStyle(0xffeaa7);
      g.fillCircle(w / 2, 12, 7);

      // Eyes
      g.fillStyle(0x2d3436);
      g.fillCircle(w / 2 - 2, 11, 1.3);
      g.fillCircle(w / 2 + 2, 11, 1.3);

      g.generateTexture(key, w, h);
      g.destroy();
    });

    // Stunned star texture (small diamonds as stars)
    if (!this.textures.exists('fx_stars')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffd93d);
      for (let i = 0; i < 3; i++) {
        const cx = 8 + i * 12;
        g.beginPath();
        g.moveTo(cx, 0); g.lineTo(cx + 4, 6);
        g.lineTo(cx, 12); g.lineTo(cx - 4, 6);
        g.closePath(); g.fillPath();
      }
      g.generateTexture('fx_stars', 40, 12);
      g.destroy();
    }
  }

  // ----------------------------------------------------------
  //  World Drawing
  // ----------------------------------------------------------
  _placeAsset(key, col, row, depthVal) {
    const { x, y } = worldToScreen(col, row);
    const sx = x + this.camOX;
    const sy = y + this.camOY;
    const sprite = this.add.image(sx, sy, key);
    sprite.setScale(ASSET_SCALE);
    sprite.setOrigin(0.5, ASSET_ORIGIN_Y);
    sprite.setDepth(depthVal !== undefined ? depthVal : sy);
    return sprite;
  }

  _drawFloor() {
    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        const tileType = MAP_TILES[r][c];
        const key = TILE_KEYS[tileType];
        if (key) {
          this._placeAsset(key, c, r, -1); // Floor always at bottom depth
        }
      }
    }
  }

  _drawDecorations() {
    for (const deco of DECORATIONS) {
      const { x, y } = worldToScreen(deco.col, deco.row);
      const sy = y + this.camOY;
      this._placeAsset(deco.key, deco.col, deco.row, sy);
    }
  }

  _drawRoomLabels() {
    for (const label of ROOM_LABELS) {
      const { x, y } = worldToScreen(label.col, label.row);
      const sx = x + this.camOX;
      const sy = y + this.camOY;
      this.add.text(sx, sy - 10, label.text, {
        fontSize: '11px', fontFamily: 'Courier New', fontStyle: 'bold',
        color: label.color,
        stroke: '#000', strokeThickness: 3,
        align: 'center',
      }).setOrigin(0.5).setDepth(0).setAlpha(0.7);
    }
  }

  // ----------------------------------------------------------
  //  HUD (fixed camera overlay)
  // ----------------------------------------------------------
  _createHUD() {
    const hud = this.add.container(0, 0).setDepth(10000).setScrollFactor(0);

    // Semi-transparent top bar
    const topBar = this.add.graphics();
    topBar.fillStyle(0x000000, 0.5);
    topBar.fillRect(0, 0, 1280, 50);
    hud.add(topBar);

    // Timer (top-left)
    this.hudElements.timer = this.add.text(20, 14, '03:00', {
      fontSize: '24px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#fff', stroke: '#000', strokeThickness: 2,
    });
    hud.add(this.hudElements.timer);

    const timerLabel = this.add.text(20, 38, 'TEMPS', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#888',
    });
    hud.add(timerLabel);

    // Stability gauge (top-center)
    const gaugeX = 490;
    const gaugeLabel = this.add.text(640, 6, 'STABILITE', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#888',
    }).setOrigin(0.5, 0);
    hud.add(gaugeLabel);

    this.hudElements.stabilityBg = this.add.graphics();
    this.hudElements.stabilityBg.fillStyle(0x333333);
    this.hudElements.stabilityBg.fillRoundedRect(gaugeX, 20, 300, 18, 4);
    hud.add(this.hudElements.stabilityBg);

    this.hudElements.stabilityBar = this.add.graphics();
    hud.add(this.hudElements.stabilityBar);

    this.hudElements.stabilityText = this.add.text(640, 29, '100%', {
      fontSize: '12px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#fff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0.5);
    hud.add(this.hudElements.stabilityText);

    // Score (top-right)
    this.hudElements.score = this.add.text(1260, 14, '0', {
      fontSize: '24px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ffd93d', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0);
    hud.add(this.hudElements.score);

    const scoreLabel = this.add.text(1260, 38, 'SCORE', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#888',
    }).setOrigin(1, 0);
    hud.add(scoreLabel);

    // Bottom bar background
    const bottomBar = this.add.graphics();
    bottomBar.fillStyle(0x000000, 0.5);
    bottomBar.fillRect(0, 670, 1280, 50);
    hud.add(bottomBar);

    // Carried item (bottom-left)
    this.hudElements.carriedItem = this.add.text(20, 688, 'Objet: aucun', {
      fontSize: '14px', fontFamily: 'Courier New',
      color: '#ffd93d', stroke: '#000', strokeThickness: 2,
    });
    hud.add(this.hudElements.carriedItem);

    // Active emergencies (bottom-center)
    this.hudElements.emergencies = this.add.text(640, 688, '', {
      fontSize: '13px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ff6b6b', stroke: '#000', strokeThickness: 2,
      align: 'center',
    }).setOrigin(0.5, 0);
    hud.add(this.hudElements.emergencies);

    // Controls reminder (bottom-right)
    const controls = this.add.text(1260, 682, 'WASD:Bouger  E:Ramasser  ESPACE:Frapper  MAJ:Dash  R:Reparer', {
      fontSize: '10px', fontFamily: 'Courier New', color: '#666',
    }).setOrigin(1, 0);
    hud.add(controls);

    // Waiting overlay (shown during "waiting" phase)
    this.hudElements.waitOverlay = this.add.graphics();
    this.hudElements.waitOverlay.fillStyle(0x000000, 0.6);
    this.hudElements.waitOverlay.fillRect(0, 0, 1280, 720);
    hud.add(this.hudElements.waitOverlay);

    this.hudElements.waitText = this.add.text(640, 360, 'En attente du lancement...', {
      fontSize: '28px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ffd93d', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);
    hud.add(this.hudElements.waitText);

    this.hudElements.waitOverlay.setVisible(false);
    this.hudElements.waitText.setVisible(false);

    // Disconnect overlay
    this.hudElements.disconnectOverlay = this.add.graphics();
    this.hudElements.disconnectOverlay.fillStyle(0x000000, 0.8);
    this.hudElements.disconnectOverlay.fillRect(0, 0, 1280, 720);
    this.hudElements.disconnectOverlay.setVisible(false);
    hud.add(this.hudElements.disconnectOverlay);

    this.hudElements.disconnectText = this.add.text(640, 340, 'DECONNECTE', {
      fontSize: '32px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ff6b6b', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.hudElements.disconnectText.setVisible(false);
    hud.add(this.hudElements.disconnectText);

    this.hudElements.disconnectSub = this.add.text(640, 390, 'Retour au menu...', {
      fontSize: '16px', fontFamily: 'Courier New', color: '#aaa',
    }).setOrigin(0.5);
    this.hudElements.disconnectSub.setVisible(false);
    hud.add(this.hudElements.disconnectSub);
  }

  // ----------------------------------------------------------
  //  Emergency Effect Layers
  // ----------------------------------------------------------
  _createEffectLayers() {
    // Gas leak overlay (yellow-green tint)
    this.gasOverlay = this.add.graphics().setDepth(9000).setAlpha(0);
    this.gasOverlay.fillStyle(0x88cc00, 0.2);
    this.gasOverlay.fillRect(0, 0, 1280, 720);
    this.gasOverlay.setScrollFactor(0);

    // Short circuit overlay (dark fog)
    this.circuitOverlay = this.add.graphics().setDepth(9001).setAlpha(0);
    this.circuitOverlay.fillStyle(0x000000, 0.7);
    this.circuitOverlay.fillRect(0, 0, 1280, 720);
    // Cut a circle around the player (simulated in update)
    this.circuitOverlay.setScrollFactor(0);

    // Overheat border overlay
    this.overheatBorder = this.add.graphics().setDepth(9002).setAlpha(0);
    this.overheatBorder.lineStyle(8, 0xff0000, 0.8);
    this.overheatBorder.strokeRect(4, 4, 1272, 712);
    this.overheatBorder.setScrollFactor(0);

    this.overheatText = this.add.text(640, 80, '', {
      fontSize: '20px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ff0000', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(9003).setAlpha(0).setScrollFactor(0);
  }

  // ----------------------------------------------------------
  //  Input Setup
  // ----------------------------------------------------------
  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.pickupKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.dashKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.repairKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  // ----------------------------------------------------------
  //  Colyseus Listeners
  // ----------------------------------------------------------
  _setupRoomListeners() {
    const room = this.room;

    // Players
    room.state.players.onAdd((player, sessionId) => {
      this._addPlayer(player, sessionId);
    });
    room.state.players.onRemove((_player, sessionId) => {
      this._removePlayer(sessionId);
    });

    // Machines
    room.state.machines.onAdd((machine, machineId) => {
      this._addMachine(machine, machineId);
    });
    room.state.machines.onRemove((_machine, machineId) => {
      this._removeMachine(machineId);
    });

    // Items
    room.state.items.onAdd((item, itemId) => {
      this._addItem(item, itemId);
    });
    room.state.items.onRemove((_item, itemId) => {
      this._removeItem(itemId);
    });

    // Phase changes
    room.state.listen('phase', (value) => {
      if (value === 'waiting') {
        this.hudElements.waitOverlay.setVisible(true);
        this.hudElements.waitText.setVisible(true);
      } else {
        this.hudElements.waitOverlay.setVisible(false);
        this.hudElements.waitText.setVisible(false);
      }
    });

    // Game over message
    room.onMessage('game_over', (data) => {
      this.scene.start('EndScene', {
        room: this.room,
        reason: data.reason,
        winner: data.winner,
        scores: data.scores,
        stability: room.state.stability,
      });
    });

    // Emergency spawn notification
    room.onMessage('emergency_spawn', (data) => {
      this._flashEmergencyAlert(data.type);
    });

    // Repair complete notification
    room.onMessage('repair_complete', (data) => {
      this._showRepairCompleteEffect(data);
    });

    // Handle disconnection
    room.onLeave((code) => {
      console.warn('Disconnected, code:', code);
      this.hudElements.disconnectOverlay.setVisible(true);
      this.hudElements.disconnectText.setVisible(true);
      this.hudElements.disconnectSub.setVisible(true);
      this.room = null;
      this.time.delayedCall(2500, () => {
        this.scene.start('MenuScene');
      });
    });
  }

  // ----------------------------------------------------------
  //  Player Sprites
  // ----------------------------------------------------------
  _addPlayer(player, sessionId) {
    const isLocal = sessionId === this.localSessionId;
    const colorIdx = player.color !== undefined ? player.color : 0;

    const sprite = this.add.image(0, 0, `player_${colorIdx}`)
      .setOrigin(0.5, 0.9);

    const label = this.add.text(0, 0,
      isLocal ? 'VOUS' : PLAYER_NAMES[colorIdx] || '?',
      {
        fontSize: '11px', fontFamily: 'Courier New', fontStyle: 'bold',
        color: isLocal ? '#2ecc71' : '#ffffff',
        stroke: '#000', strokeThickness: 2,
      }
    ).setOrigin(0.5, 1);

    const carryIcon = this.add.text(0, 0, '', {
      fontSize: '10px', fontFamily: 'Courier New',
      color: '#f1c40f', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1);

    // Repair progress bar (hidden by default)
    const repairBarBg = this.add.graphics().setVisible(false);
    const repairBarFill = this.add.graphics().setVisible(false);

    // Stars effect for stunned state
    const stars = this.add.text(0, 0, '* * *', {
      fontSize: '12px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ffd93d', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1).setVisible(false);

    this.playerSprites[sessionId] = {
      sprite, label, carryIcon, player, stars,
      repairBarBg, repairBarFill,
      stateTimer: 0,
    };
  }

  _removePlayer(sessionId) {
    const d = this.playerSprites[sessionId];
    if (!d) return;
    d.sprite.destroy();
    d.label.destroy();
    d.carryIcon.destroy();
    d.stars.destroy();
    d.repairBarBg.destroy();
    d.repairBarFill.destroy();
    delete this.playerSprites[sessionId];
  }

  // ----------------------------------------------------------
  //  Machine Sprites
  // ----------------------------------------------------------
  _addMachine(machine, machineId) {
    const texKey = MACHINE_TEXTURES[machine.machineType] || 'machine_gas_valve';
    const { x, y } = worldToScreen(machine.x, machine.y);
    const sx = x + this.camOX;
    const sy = y + this.camOY;

    const sprite = this.add.image(sx, sy, texKey);
    sprite.setScale(ASSET_SCALE * 1.2); // Machines slightly larger
    sprite.setOrigin(0.5, ASSET_ORIGIN_Y);
    sprite.setDepth(sy);

    // Status glow
    const glow = this.add.graphics();
    glow.setDepth(sy - 0.5);

    // Label
    const nameLabel = this.add.text(sx, sy - 60, MACHINE_LABELS[machine.machineType] || '', {
      fontSize: '10px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#fff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(sy + 0.1);

    // Status text
    const statusText = this.add.text(sx, sy - 48, '', {
      fontSize: '9px', fontFamily: 'Courier New',
      color: '#2ecc71', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(sy + 0.2);

    // Repair progress bar
    const repairBarBg = this.add.graphics().setDepth(sy + 0.3).setVisible(false);
    const repairBarFill = this.add.graphics().setDepth(sy + 0.4).setVisible(false);

    this.machineSprites[machineId] = {
      sprite, glow, nameLabel, statusText, machine,
      repairBarBg, repairBarFill, sx, sy,
    };
  }

  _removeMachine(machineId) {
    const d = this.machineSprites[machineId];
    if (!d) return;
    d.sprite.destroy();
    d.glow.destroy();
    d.nameLabel.destroy();
    d.statusText.destroy();
    d.repairBarBg.destroy();
    d.repairBarFill.destroy();
    delete this.machineSprites[machineId];
  }

  // ----------------------------------------------------------
  //  Item Sprites
  // ----------------------------------------------------------
  _addItem(item, itemId) {
    const texKey = ITEM_TEXTURES[item.itemType] || 'item_welding_kit';
    const sprite = this.add.image(0, 0, texKey);
    sprite.setScale(ASSET_SCALE * 0.8);
    sprite.setOrigin(0.5, ASSET_ORIGIN_Y);

    const label = this.add.text(0, 0, ITEM_LABELS[item.itemType] || item.itemType, {
      fontSize: '9px', fontFamily: 'Courier New',
      color: '#ffd93d', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0);

    this.itemSprites[itemId] = { sprite, label, item };
  }

  _removeItem(itemId) {
    const d = this.itemSprites[itemId];
    if (!d) return;
    d.sprite.destroy();
    d.label.destroy();
    delete this.itemSprites[itemId];
  }

  // ----------------------------------------------------------
  //  Visual Effects
  // ----------------------------------------------------------
  _flashEmergencyAlert(type) {
    const label = EMERGENCY_LABELS[type] || type;
    const alert = this.add.text(640, 200, `! ${label} !`, {
      fontSize: '32px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ff0000', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(9999).setScrollFactor(0);

    this.tweens.add({
      targets: alert,
      alpha: { from: 1, to: 0 },
      y: 150,
      duration: 2500,
      ease: 'Cubic.easeOut',
      onComplete: () => alert.destroy(),
    });
  }

  _showRepairCompleteEffect(data) {
    const playerData = this.playerSprites[data.playerId];
    if (!playerData) return;

    const { x, y } = worldToScreen(playerData.player.x, playerData.player.y);
    const sx = x + this.camOX;
    const sy = y + this.camOY;

    const pointsText = this.add.text(sx, sy - 60, `+${data.points}`, {
      fontSize: '20px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#2ecc71', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(9998);

    this.tweens.add({
      targets: pointsText,
      y: sy - 100,
      alpha: 0,
      duration: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => pointsText.destroy(),
    });
  }

  // ----------------------------------------------------------
  //  UPDATE LOOP
  // ----------------------------------------------------------
  update(_time, _delta) {
    if (!this.room) return;

    // --- Send Input ---
    let sx = 0, sy = 0;
    if (this.cursors.right.isDown || this.wasd.right.isDown) sx += 1;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  sx -= 1;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  sy += 1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    sy -= 1;

    this.room.send('input', {
      sx, sy,
      pickup: Phaser.Input.Keyboard.JustDown(this.pickupKey),
      attack: Phaser.Input.Keyboard.JustDown(this.attackKey),
      dash:   Phaser.Input.Keyboard.JustDown(this.dashKey),
      repair: this.repairKey.isDown,
    });

    // --- Update HUD ---
    this._updateHUD();

    // --- Render Players ---
    this._renderPlayers();

    // --- Render Machines ---
    this._renderMachines();

    // --- Render Items ---
    this._renderItems();

    // --- Update Emergency Effects ---
    this._updateEmergencyEffects();
  }

  // ----------------------------------------------------------
  //  HUD Update
  // ----------------------------------------------------------
  _updateHUD() {
    const state = this.room.state;

    // Timer
    const totalSec = Math.max(0, Math.ceil(state.timer));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    this.hudElements.timer.setText(timeStr);
    this.hudElements.timer.setColor(totalSec <= 30 ? '#ff0000' : '#ffffff');

    // Stability bar
    const stability = state.stability || 0;
    const barW = 300;
    const barH = 18;
    const fillW = (stability / 100) * barW;
    const barX = 490;
    const barY = 20;

    let barColor = 0x2ecc71;
    if (stability < 30) barColor = 0xff0000;
    else if (stability < 60) barColor = 0xf39c12;

    this.hudElements.stabilityBar.clear();
    this.hudElements.stabilityBar.fillStyle(barColor);
    this.hudElements.stabilityBar.fillRoundedRect(barX, barY, fillW, barH, 4);
    this.hudElements.stabilityText.setText(`${Math.round(stability)}%`);

    // Score (local player)
    const localPlayer = state.players.get(this.localSessionId);
    if (localPlayer) {
      this.hudElements.score.setText(String(localPlayer.score || 0));

      // Carried item
      if (localPlayer.carryingItemId) {
        const item = state.items.get(localPlayer.carryingItemId);
        const itemName = item ? (ITEM_LABELS[item.itemType] || item.itemType) : '?';
        this.hudElements.carriedItem.setText(`Objet: ${itemName}`);
        this.hudElements.carriedItem.setColor('#ffd93d');
      } else {
        this.hudElements.carriedItem.setText('Objet: aucun');
        this.hudElements.carriedItem.setColor('#888');
      }
    }

    // Emergency list
    const emergencyLines = [];
    if (state.emergencies) {
      state.emergencies.forEach((emg) => {
        if (emg.active) {
          const label = EMERGENCY_LABELS[emg.emergencyType] || emg.emergencyType;
          const t = Math.ceil(emg.timeRemaining || 0);
          emergencyLines.push(`${label} (${t}s)`);
        }
      });
    }
    this.hudElements.emergencies.setText(emergencyLines.join('  |  '));
  }

  // ----------------------------------------------------------
  //  Player Rendering
  // ----------------------------------------------------------
  _renderPlayers() {
    for (const [sid, data] of Object.entries(this.playerSprites)) {
      const { sprite, label, carryIcon, player, stars, repairBarBg, repairBarFill } = data;
      const { x, y } = worldToScreen(player.x, player.y);
      const screenX = x + this.camOX;
      const screenY = y + this.camOY;

      sprite.setPosition(screenX, screenY);
      label.setPosition(screenX, screenY - 42);
      carryIcon.setPosition(screenX, screenY - 54);
      stars.setPosition(screenX, screenY - 54);

      // Y-SORTING
      const depth = screenY;
      sprite.setDepth(depth);
      label.setDepth(depth + 0.1);
      carryIcon.setDepth(depth + 0.2);
      stars.setDepth(depth + 0.3);

      // Carry indicator
      if (player.carryingItemId) {
        const item = this.room.state.items.get(player.carryingItemId);
        carryIcon.setText(item ? `[${ITEM_LABELS[item.itemType] || item.itemType}]` : '[OBJET]');
        carryIcon.setVisible(true);
      } else {
        carryIcon.setVisible(false);
      }

      // State effects
      const pState = player.state;

      // Stunned: shake + stars
      if (pState === 'stunned') {
        sprite.x += Math.sin(this.time.now * 0.05) * 3;
        stars.setVisible(true);
        sprite.setAlpha(1);
        sprite.setAngle(0);
      }
      // Knocked: flat on ground
      else if (pState === 'knocked') {
        sprite.setAngle(90);
        sprite.setAlpha(0.6);
        stars.setVisible(false);
      }
      // Repairing: subtle animation
      else if (pState === 'repairing') {
        sprite.setAngle(0);
        sprite.setAlpha(1);
        stars.setVisible(false);
        // Show wrench-like motion
        sprite.x += Math.sin(this.time.now * 0.01) * 2;
      }
      // Normal
      else {
        sprite.setAngle(0);
        sprite.setAlpha(1);
        stars.setVisible(false);
      }

      // Repair progress bar (for this player, shown near them)
      if (player.repairProgress > 0 && player.repairProgress < 100 && pState === 'repairing') {
        repairBarBg.clear().setVisible(true);
        repairBarBg.fillStyle(0x333333);
        repairBarBg.fillRoundedRect(screenX - 25, screenY - 65, 50, 6, 2);
        repairBarBg.setDepth(depth + 0.4);

        repairBarFill.clear().setVisible(true);
        repairBarFill.fillStyle(0x2ecc71);
        repairBarFill.fillRoundedRect(screenX - 25, screenY - 65, (player.repairProgress / 100) * 50, 6, 2);
        repairBarFill.setDepth(depth + 0.5);
      } else {
        repairBarBg.clear().setVisible(false);
        repairBarFill.clear().setVisible(false);
      }
    }
  }

  // ----------------------------------------------------------
  //  Machine Rendering
  // ----------------------------------------------------------
  _renderMachines() {
    for (const [_id, data] of Object.entries(this.machineSprites)) {
      const { sprite, glow, statusText, machine, repairBarBg, repairBarFill, sx, sy } = data;

      // Status glow
      glow.clear();
      if (machine.status === 'working') {
        glow.fillStyle(0x2ecc71, 0.15);
        glow.fillEllipse(sx, sy, 40, 20);
        statusText.setText('OK');
        statusText.setColor('#2ecc71');
      } else if (machine.status === 'broken') {
        // Pulsing red glow
        const pulse = 0.15 + Math.sin(this.time.now * 0.005) * 0.1;
        glow.fillStyle(0xff0000, pulse);
        glow.fillEllipse(sx, sy, 50, 25);
        statusText.setText('EN PANNE');
        statusText.setColor('#ff0000');

        // Needed item hint
        if (machine.requiredItem) {
          const itemName = ITEM_LABELS[machine.requiredItem] || machine.requiredItem;
          statusText.setText(`EN PANNE [${itemName}]`);
        }
      }

      // Repair progress bar
      if (machine.repairProgress > 0 && machine.repairProgress < 100 && machine.repairerId) {
        repairBarBg.clear().setVisible(true);
        repairBarBg.fillStyle(0x333333);
        repairBarBg.fillRoundedRect(sx - 30, sy - 75, 60, 8, 3);

        repairBarFill.clear().setVisible(true);
        repairBarFill.fillStyle(0x3498db);
        repairBarFill.fillRoundedRect(sx - 30, sy - 75, (machine.repairProgress / 100) * 60, 8, 3);
      } else {
        repairBarBg.clear().setVisible(false);
        repairBarFill.clear().setVisible(false);
      }

      // Y-SORTING for machines
      const depth = sy;
      sprite.setDepth(depth);
    }
  }

  // ----------------------------------------------------------
  //  Item Rendering
  // ----------------------------------------------------------
  _renderItems() {
    for (const [_id, data] of Object.entries(this.itemSprites)) {
      const { sprite, label, item } = data;

      if (item.carried) {
        sprite.setVisible(false);
        label.setVisible(false);
      } else {
        sprite.setVisible(true);
        label.setVisible(true);
        const { x, y } = worldToScreen(item.x, item.y);
        const screenX = x + this.camOX;
        const screenY = y + this.camOY;
        sprite.setPosition(screenX, screenY);
        label.setPosition(screenX, screenY + 4);

        // Subtle bobbing animation
        sprite.y += Math.sin(this.time.now * 0.003 + item.x * 100) * 2;

        // Y-SORTING
        sprite.setDepth(screenY);
        label.setDepth(screenY + 0.1);
      }
    }
  }

  // ----------------------------------------------------------
  //  Emergency Effect Updates
  // ----------------------------------------------------------
  _updateEmergencyEffects() {
    const state = this.room.state;
    let hasGas = false;
    let hasCircuit = false;
    let hasOverheat = false;
    let overheatTime = 0;

    if (state.emergencies) {
      state.emergencies.forEach((emg) => {
        if (!emg.active) return;
        if (emg.emergencyType === 'gas_leak') hasGas = true;
        if (emg.emergencyType === 'short_circuit') hasCircuit = true;
        if (emg.emergencyType === 'overheat') {
          hasOverheat = true;
          overheatTime = Math.ceil(emg.timeRemaining || 0);
        }
      });
    }

    // Gas leak: yellow-green tint
    const gasTarget = hasGas ? 1 : 0;
    this.gasOverlay.alpha += (gasTarget - this.gasOverlay.alpha) * 0.05;

    // Short circuit: darkness
    if (hasCircuit) {
      // Redraw dark overlay with a visibility hole around local player
      this.circuitOverlay.clear();
      this.circuitOverlay.fillStyle(0x000000, 0.75);
      this.circuitOverlay.fillRect(0, 0, 1280, 720);

      const localP = state.players.get(this.localSessionId);
      if (localP) {
        const { x, y } = worldToScreen(localP.x, localP.y);
        const px = x + this.camOX;
        const py = y + this.camOY;
        // Punch a bright circle (additive blend trick: just draw lighter area)
        this.circuitOverlay.fillStyle(0x000000, 0); // Transparent won't work, so use a gradient-like approach
        // Use a series of decreasing opacity circles for smooth falloff
        for (let r = 120; r > 0; r -= 10) {
          const a = 0.75 * (r / 120);
          this.circuitOverlay.fillStyle(0x0f0f23, a);
          this.circuitOverlay.fillCircle(px, py, r);
        }
      }
      this.circuitOverlay.alpha += (1 - this.circuitOverlay.alpha) * 0.05;
    } else {
      this.circuitOverlay.alpha += (0 - this.circuitOverlay.alpha) * 0.08;
    }

    // Overheat: red pulsing border
    if (hasOverheat) {
      const pulse = 0.5 + Math.sin(this.time.now * 0.008) * 0.5;
      this.overheatBorder.setAlpha(pulse);
      this.overheatText.setText(`SURCHAUFFE: ${overheatTime}s`);
      this.overheatText.setAlpha(1);
    } else {
      this.overheatBorder.alpha += (0 - this.overheatBorder.alpha) * 0.08;
      this.overheatText.alpha += (0 - this.overheatText.alpha) * 0.08;
    }
  }
}

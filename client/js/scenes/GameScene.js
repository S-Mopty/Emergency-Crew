// ============================================================
//  Emergency Crew - GameScene (Full Gameplay)
//  Isometric 64x32 rendering with procedural assets + Colyseus sync
// ============================================================

import { t, t_item, t_machine, t_emergency, t_room, t_color } from '../locale.js';

const TILE_W = 80;
const TILE_H = 40;
const MAP_W = 30;
const MAP_H = 24;

const PLAYER_COLORS     = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12];
const PLAYER_COLORS_HEX = ['#3498db','#e74c3c','#2ecc71','#f39c12'];

// 0=void, 1=metal floor, 2=hub grate, 3=corridor, 4=elevated, 5=hazard grate
const MAP_TILES = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0],
  [0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0],
  [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0],
  [0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Room label positions (tile coords -> locale key)
const ROOM_LABELS = [
  { key: 'storage',     col: 4,    row: 2.5,  color: '#ffd93d' },
  { key: 'command',     col: 14.5, row: 2.5,  color: '#00cec9' },
  { key: 'reactor',     col: 25.5, row: 2.5,  color: '#ff6b6b' },
  { key: 'medical',     col: 3.5,  row: 12,   color: '#a29bfe' },
  { key: 'hub',         col: 14.5, row: 11.5, color: '#74b9ff' },
  { key: 'electrical',  col: 25.5, row: 12,   color: '#fd79a8' },
  { key: 'armory',      col: 4,    row: 20,   color: '#e17055' },
  { key: 'engine',      col: 14.5, row: 20,   color: '#fdcb6e' },
  { key: 'lifesupport', col: 25,   row: 20,   color: '#55efc4' },
];

// Room background tint areas (for subtle room coloring)
const ROOM_ZONES = [
  { col: 1,  row: 1,  w: 7, h: 4, color: 0xffd93d, alpha: 0.03 },  // Storage
  { col: 12, row: 1,  w: 6, h: 4, color: 0x00cec9, alpha: 0.04 },  // Command
  { col: 23, row: 1,  w: 6, h: 4, color: 0xff6b6b, alpha: 0.04 },  // Reactor
  { col: 1,  row: 10, w: 6, h: 6, color: 0xa29bfe, alpha: 0.03 },  // Medical
  { col: 11, row: 8,  w: 8, h: 8, color: 0x74b9ff, alpha: 0.03 },  // Hub
  { col: 23, row: 10, w: 6, h: 6, color: 0xfd79a8, alpha: 0.03 },  // Electrical
  { col: 1,  row: 18, w: 7, h: 5, color: 0xe17055, alpha: 0.03 },  // Armory
  { col: 10, row: 18, w: 10,h: 5, color: 0xfdcb6e, alpha: 0.04 },  // Engine
  { col: 23, row: 18, w: 5, h: 5, color: 0x55efc4, alpha: 0.03 },  // Life Support
];

// Machine texture color/icon configs (keys match server machineType)
const MACHINE_STYLES = {
  gas_leak:       { color: 0xf39c12, icon: 'flame'    },
  short_circuit:  { color: 0xe74c3c, icon: 'bolt'     },
  overheat:       { color: 0x3498db, icon: 'snowflake' },
};

// Item color configs
const ITEM_STYLES = {
  welding_kit: { color: 0xf39c12, darkColor: 0xc27d0e },
  fuse:        { color: 0xe74c3c, darkColor: 0xb71c1c },
  coolant:     { color: 0x3498db, darkColor: 0x1a6ba0 },
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
  //  PRELOAD — No external assets needed anymore
  // ----------------------------------------------------------
  preload() {
    // All textures are generated procedurally in create()
  }

  // ----------------------------------------------------------
  //  CREATE
  // ----------------------------------------------------------
  create() {
    // Camera offset to center the isometric map in world space
    // camOX shifts x-origin, camOY shifts y-origin before iso transform
    this.camOX = this.cameras.main.width / 2;
    this.camOY = 40;

    // Generate all textures procedurally
    this._generateTextures();

    // Draw space background with stars
    this._drawBackground();

    // Draw world
    this._drawFloor();
    this._drawWalls();
    this._drawRoomZones();
    this._drawDecorations();
    this._drawRoomLabels();

    // Setup camera zoom — follow will be set when local player spawns
    this.cameras.main.setZoom(1.8);
    this.cameras.main.roundPixels = false;
    this._cameraFollowing = false;

    // Create HUD
    this._createHUD();

    // Setup input
    this._setupInput();

    // Create emergency effect layers
    this._createEffectLayers();

    // Interaction prompt (floating key hint)
    this._interactPrompt = this.add.text(0, 0, '', {
      fontSize: '13px', fontFamily: 'Orbitron, Courier New', fontStyle: 'bold',
      color: '#ffd93d',
      stroke: '#000', strokeThickness: 4,
      backgroundColor: 'rgba(8,8,22,0.85)',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(10000).setVisible(false);

    // Setup Colyseus listeners
    if (this.room) {
      this._setupRoomListeners();
    }
  }

  // ----------------------------------------------------------
  //  Procedural Texture Generation
  // ----------------------------------------------------------
  _generateTextures() {
    this._genFloorTiles();
    this._genPlayerTextures();
    this._genMachineTextures();
    this._genItemTextures();
    this._genDecoTextures();
  }

  _genFloorTiles() {
    const w = TILE_W, h = TILE_H;

    // Helper to draw an iso diamond tile
    const drawTile = (key, fillColor, lineColor, lineAlpha, details) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ add: false });
      // Base diamond
      g.fillStyle(fillColor);
      g.beginPath();
      g.moveTo(w/2, 0); g.lineTo(w, h/2); g.lineTo(w/2, h); g.lineTo(0, h/2);
      g.closePath();
      g.fillPath();
      // Border
      g.lineStyle(1, lineColor, lineAlpha);
      g.beginPath();
      g.moveTo(w/2, 0); g.lineTo(w, h/2); g.lineTo(w/2, h); g.lineTo(0, h/2);
      g.closePath();
      g.strokePath();
      // Details callback
      if (details) details(g, w, h);
      g.generateTexture(key, w, h);
      g.destroy();
    };

    // Standard metal floor — with subtle panel seams
    drawTile('tile_metal', 0x1e1e3e, 0x2e2e5e, 0.4, (g, w, h) => {
      // Panel seam lines
      g.lineStyle(1, 0x161630, 0.3);
      g.lineBetween(w*0.25, h*0.37, w*0.75, h*0.37);
      g.lineBetween(w*0.25, h*0.63, w*0.75, h*0.63);
      // Corner rivets
      g.fillStyle(0x2a2a55, 0.4);
      g.fillCircle(w*0.3, h*0.5, 1.5);
      g.fillCircle(w*0.7, h*0.5, 1.5);
      // Subtle highlight on top edge
      g.lineStyle(1, 0x2a2a58, 0.2);
      g.lineBetween(w*0.35, h*0.18, w*0.65, h*0.18);
    });

    // Hub grated floor (lighter, with cross-hatch pattern)
    drawTile('tile_grate', 0x1a1a38, 0x2e2e5a, 0.5, (g, w, h) => {
      g.lineStyle(1, 0x252550, 0.3);
      for (let i = 1; i < 5; i++) {
        const t = i / 5;
        const x1 = w/2 * (1 - t), y1 = h/2 * t;
        const x2 = w/2 + w/2 * t, y2 = h/2 * (1 - t);
        g.lineBetween(x1, y1, x2, y2);
        g.lineBetween(w/2 * t, h/2 + h/2 * t, w/2 + w/2 * (1-t), h/2 + h/2 * t);
      }
      // Center diamond accent
      g.lineStyle(1, 0x303060, 0.15);
      g.beginPath();
      g.moveTo(w/2, h*0.3); g.lineTo(w*0.65, h/2); g.lineTo(w/2, h*0.7); g.lineTo(w*0.35, h/2);
      g.closePath();
      g.strokePath();
    });

    // Corridor/catwalk — darker metal with tread chevrons
    drawTile('tile_corridor', 0x161630, 0x252548, 0.35, (g, w, h) => {
      // Tread lines (chevron pattern)
      g.lineStyle(1, 0x1e1e3a, 0.4);
      for (let i = 1; i <= 3; i++) {
        const t = i / 4;
        g.lineBetween(w * 0.3, h * t, w * 0.5, h * t - 3);
        g.lineBetween(w * 0.5, h * t - 3, w * 0.7, h * t);
      }
      // Edge rails
      g.lineStyle(1, 0x2a2a50, 0.3);
      g.lineBetween(w*0.15, h*0.35, w*0.15, h*0.65);
      g.lineBetween(w*0.85, h*0.35, w*0.85, h*0.65);
    });

    // Elevated platform (Command Bridge) — brighter with highlight edges
    drawTile('tile_elevated', 0x252550, 0x3a3a70, 0.6, (g, w, h) => {
      // Raised edge highlight
      g.lineStyle(1, 0x4a4a80, 0.4);
      g.lineBetween(w*0.2, h*0.2, w*0.8, h*0.2);
      g.lineBetween(w*0.2, h*0.8, w*0.8, h*0.8);
      // Central console grid pattern
      g.lineStyle(1, 0x3535668, 0.25);
      g.lineBetween(w*0.35, h*0.3, w*0.35, h*0.7);
      g.lineBetween(w*0.65, h*0.3, w*0.65, h*0.7);
      g.lineBetween(w*0.3, h*0.5, w*0.7, h*0.5);
      // Corner accents
      g.fillStyle(0x5555aa, 0.2);
      g.fillCircle(w*0.25, h*0.5, 2);
      g.fillCircle(w*0.75, h*0.5, 2);
    });

    // Hazard grating (Engine Room) — warning stripes
    drawTile('tile_hazard', 0x1a1a30, 0x2e2e4a, 0.45, (g, w, h) => {
      // Cross-hatch like hub grate
      g.lineStyle(1, 0x252540, 0.3);
      for (let i = 1; i < 4; i++) {
        const t = i / 4;
        g.lineBetween(w/2 * (1 - t), h/2 * t, w/2 + w/2 * t, h/2 * (1 - t));
        g.lineBetween(w/2 * t, h/2 + h/2 * t, w/2 + w/2 * (1-t), h/2 + h/2 * t);
      }
      // Yellow/orange warning diagonal stripes
      g.lineStyle(1, 0x8B7000, 0.18);
      g.lineBetween(w*0.2, h*0.3, w*0.4, h*0.15);
      g.lineBetween(w*0.4, h*0.6, w*0.6, h*0.4);
      g.lineBetween(w*0.6, h*0.85, w*0.8, h*0.7);
    });
  }

  _genPlayerTextures() {
    PLAYER_COLORS.forEach((color, i) => {
      const key = `player_${i}`;
      if (this.textures.exists(key)) return;

      const g = this.make.graphics({ add: false });
      const w = 88, h = 124;

      // Shadow
      g.fillStyle(0x000000, 0.35);
      g.fillEllipse(w / 2, h - 6, 56, 24);

      // Feet/boots
      g.fillStyle(0x1a1a3a);
      g.fillRoundedRect(w/2 - 16, h - 28, 12, 20, 4);
      g.fillRoundedRect(w/2 + 4, h - 28, 12, 20, 4);

      // Legs
      g.fillStyle(0x222244);
      g.fillRect(w/2 - 12, h - 40, 10, 20);
      g.fillRect(w/2 + 2, h - 40, 10, 20);

      // Body
      g.fillStyle(color);
      g.fillRoundedRect(w/2 - 26, 32, 52, 56, 10);

      // Body highlight
      const r = (color >> 16) & 0xFF;
      const gn = (color >> 8) & 0xFF;
      const b = color & 0xFF;
      const lighter = ((Math.min(255, r + 50)) << 16) | ((Math.min(255, gn + 50)) << 8) | Math.min(255, b + 50);
      g.fillStyle(lighter, 0.35);
      g.fillRoundedRect(w/2 - 20, 36, 14, 46, 6);

      // Belt
      g.fillStyle(0x444466);
      g.fillRect(w/2 - 26, 76, 52, 8);
      g.fillStyle(0x888899);
      g.fillRect(w/2 - 6, 76, 12, 8);

      // Arms
      g.fillStyle(color, 0.85);
      g.fillRoundedRect(w/2 - 32, 40, 10, 32, 4);
      g.fillRoundedRect(w/2 + 22, 40, 10, 32, 4);

      // Head
      g.fillStyle(0xffeaa7);
      g.fillCircle(w / 2, 24, 20);

      // Helmet
      g.fillStyle(color, 0.7);
      g.fillRoundedRect(w/2 - 20, 4, 40, 16, 8);

      // Visor highlight
      g.fillStyle(0xffffff, 0.15);
      g.fillRoundedRect(w/2 - 12, 8, 16, 8, 4);

      // Eyes
      g.fillStyle(0x2d3436);
      g.fillCircle(w / 2 - 6, 24, 4);
      g.fillCircle(w / 2 + 6, 24, 4);

      // Mouth
      g.fillStyle(0x2d3436, 0.3);
      g.fillRect(w/2 - 4, 32, 8, 3);

      // Body outline
      g.lineStyle(2, 0xffffff, 0.12);
      g.strokeRoundedRect(w/2 - 26, 32, 52, 56, 10);

      g.generateTexture(key, w, h);
      g.destroy();
    });

    // Stunned star texture
    if (!this.textures.exists('fx_stars')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffd93d);
      for (let i = 0; i < 3; i++) {
        const sx = 8 + i * 12;
        g.fillCircle(sx, 6, 3);
        // Star points
        g.fillStyle(0xffd93d);
        g.fillTriangle(sx, 1, sx - 3, 6, sx + 3, 6);
        g.fillTriangle(sx, 11, sx - 3, 6, sx + 3, 6);
      }
      g.generateTexture('fx_stars', 40, 12);
      g.destroy();
    }
  }

  _genMachineTextures() {
    for (const [type, style] of Object.entries(MACHINE_STYLES)) {
      const key = `machine_${type}`;
      if (this.textures.exists(key)) continue;

      const g = this.make.graphics({ add: false });
      const w = 64, h = 72;
      const cx = w / 2, cy = h / 2;

      // Shadow
      g.fillStyle(0x000000, 0.3);
      g.fillEllipse(cx, h - 3, 52, 14);

      // Main body
      g.fillStyle(0x222248);
      g.fillRoundedRect(6, 4, w - 12, h - 12, 8);

      // Colored border
      g.lineStyle(2.5, style.color, 0.9);
      g.strokeRoundedRect(6, 4, w - 12, h - 12, 8);

      // Top colored bar
      g.fillStyle(style.color, 0.6);
      g.fillRect(10, 7, w - 20, 10);

      // Green LED
      g.fillStyle(0x2ecc71);
      g.fillCircle(17, 12, 3);

      // Center icon circle
      g.fillStyle(style.color, 0.25);
      g.fillCircle(cx, cy + 4, 16);
      g.lineStyle(2, style.color, 0.6);
      g.strokeCircle(cx, cy + 4, 16);

      // Icon shapes
      g.fillStyle(style.color);
      if (style.icon === 'flame') {
        g.fillTriangle(cx, cy - 6, cx - 8, cy + 8, cx + 8, cy + 8);
        g.fillCircle(cx, cy + 7, 7);
        g.fillStyle(0xffdd57);
        g.fillTriangle(cx, cy - 2, cx - 4, cy + 6, cx + 4, cy + 6);
      } else if (style.icon === 'bolt') {
        g.fillTriangle(cx - 2, cy - 10, cx - 8, cy + 2, cx + 2, cy + 2);
        g.fillTriangle(cx + 2, cy + 14, cx + 8, cy + 2, cx - 2, cy + 2);
        g.fillStyle(0xffdd57);
        g.fillCircle(cx, cy + 2, 3);
      } else if (style.icon === 'snowflake') {
        g.fillRect(cx - 1.5, cy - 9, 3, 24);
        g.fillRect(cx - 11, cy + 2.5, 22, 3);
        g.lineStyle(3, style.color, 0.9);
        g.lineBetween(cx - 8, cy - 5, cx + 8, cy + 11);
        g.lineBetween(cx + 8, cy - 5, cx - 8, cy + 11);
        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(cx, cy + 4, 3);
      }

      // Bottom detail lines
      g.lineStyle(1, style.color, 0.3);
      g.lineBetween(12, h - 18, w - 12, h - 18);
      g.lineBetween(12, h - 14, w - 12, h - 14);

      g.generateTexture(key, w, h);
      g.destroy();

      // === Broken variant ===
      const keyBroken = `machine_${type}_broken`;
      if (this.textures.exists(keyBroken)) continue;

      const gb = this.make.graphics({ add: false });

      // Shadow
      gb.fillStyle(0x000000, 0.35);
      gb.fillEllipse(cx, h - 3, 52, 14);

      // Main body — dark red
      gb.fillStyle(0x2a0a0a);
      gb.fillRoundedRect(6, 4, w - 12, h - 12, 8);

      // Red danger border
      gb.lineStyle(3, 0xff0000, 0.9);
      gb.strokeRoundedRect(6, 4, w - 12, h - 12, 8);

      // Top red stripe
      gb.fillStyle(0xff0000, 0.5);
      gb.fillRect(10, 7, w - 20, 10);

      // Red LED
      gb.fillStyle(0xff0000);
      gb.fillCircle(17, 12, 4);

      // Danger X
      gb.lineStyle(5, 0xff0000, 0.8);
      gb.lineBetween(cx - 13, cy - 8, cx + 13, cy + 16);
      gb.lineBetween(cx + 13, cy - 8, cx - 13, cy + 16);

      // Warning circle
      gb.lineStyle(2, 0xff4444, 0.4);
      gb.strokeCircle(cx, cy + 4, 16);

      // Sparks
      gb.fillStyle(0xff6644, 0.7);
      gb.fillCircle(w - 14, 18, 3);
      gb.fillCircle(12, h - 20, 3);
      gb.fillCircle(w - 18, h - 22, 2);

      gb.generateTexture(keyBroken, w, h);
      gb.destroy();
    }
  }

  _genItemTextures() {
    for (const [type, style] of Object.entries(ITEM_STYLES)) {
      const key = `item_${type}`;
      if (this.textures.exists(key)) continue;

      const g = this.make.graphics({ add: false });
      const s = 32;
      const cx = s / 2, cy = s / 2;

      // Outer glow
      g.fillStyle(style.color, 0.1);
      g.fillCircle(cx, cy, s/2);

      // Background circle
      g.fillStyle(0x0f0f23, 0.8);
      g.fillCircle(cx, cy, s/2 - 2);

      // Colored ring
      g.lineStyle(2, style.color, 0.8);
      g.strokeCircle(cx, cy, s/2 - 2);

      // Inner icon
      g.fillStyle(style.color, 0.9);
      if (type === 'welding_kit') {
        // Wrench shape
        g.fillRoundedRect(cx - 10, cy - 2, 20, 5, 2);
        g.fillCircle(cx - 8, cy, 5);
        g.fillStyle(0x0f0f23);
        g.fillCircle(cx - 8, cy, 2.5);
        g.fillStyle(style.color, 0.9);
        g.fillRoundedRect(cx + 5, cy - 4, 6, 8, 2);
      } else if (type === 'fuse') {
        // Fuse cylinder
        g.fillRoundedRect(cx - 5, cy - 8, 10, 16, 3);
        g.fillStyle(style.darkColor);
        g.fillRect(cx - 2, cy - 11, 1.5, 5);
        g.fillRect(cx + 1, cy - 11, 1.5, 5);
        g.fillStyle(0xffffff, 0.3);
        g.fillRoundedRect(cx - 3, cy - 4, 6, 4, 1);
      } else if (type === 'coolant') {
        // Flask / bottle
        g.fillRoundedRect(cx - 6, cy - 2, 12, 10, 4);
        g.fillRect(cx - 3, cy - 8, 6, 7);
        g.fillStyle(style.darkColor, 0.6);
        g.fillRoundedRect(cx - 5, cy + 1, 10, 5, 3);
        g.fillStyle(0xffffff, 0.2);
        g.fillRoundedRect(cx - 4, cy - 1, 3, 6, 1);
      }

      g.generateTexture(key, s, s);
      g.destroy();
    }
  }

  _genDecoTextures() {
    // Wall panel — larger, more visible
    if (!this.textures.exists('deco_wall_panel')) {
      const g = this.make.graphics({ add: false });
      const w = 64, h = 44;
      // Base panel
      g.fillStyle(0x2a2a55, 0.85);
      g.fillRoundedRect(2, 2, w - 4, h - 4, 4);
      g.lineStyle(2, 0x4a4a88, 0.7);
      g.strokeRoundedRect(2, 2, w - 4, h - 4, 4);
      // Panel sections
      g.lineStyle(1, 0x1a1a40, 0.6);
      g.lineBetween(w/3, 4, w/3, h - 4);
      g.lineBetween(w*2/3, 4, w*2/3, h - 4);
      g.lineBetween(4, h/2, w - 4, h/2);
      // Indicator lights
      g.fillStyle(0x44ff88, 0.5);
      g.fillCircle(12, 12, 3);
      g.fillStyle(0xff4444, 0.4);
      g.fillCircle(w - 12, 12, 3);
      // Rivets
      g.fillStyle(0x555580, 0.6);
      g.fillCircle(8, h - 8, 2);
      g.fillCircle(w - 8, h - 8, 2);
      g.generateTexture('deco_wall_panel', w, h);
      g.destroy();
    }

    // Pipe segment — longer, thicker
    if (!this.textures.exists('deco_pipe')) {
      const g = this.make.graphics({ add: false });
      const w = 60, h = 18;
      // Main pipe body
      g.fillStyle(0x4a4a78);
      g.fillRoundedRect(0, 3, w, 12, 6);
      // Highlight stripe
      g.fillStyle(0x6666aa, 0.5);
      g.fillRoundedRect(2, 4, w - 4, 4, 3);
      // Joints
      g.fillStyle(0x5a5a90, 0.8);
      g.fillRoundedRect(8, 1, 8, 16, 3);
      g.fillRoundedRect(w - 16, 1, 8, 16, 3);
      // Valve
      g.fillStyle(0x888899, 0.6);
      g.fillCircle(w/2, 9, 5);
      g.fillStyle(0x4a4a78);
      g.fillCircle(w/2, 9, 2.5);
      g.generateTexture('deco_pipe', w, h);
      g.destroy();
    }

    // Crate — bigger isometric box
    if (!this.textures.exists('deco_crate')) {
      const g = this.make.graphics({ add: false });
      const s = 40;
      // Top face (iso diamond)
      g.fillStyle(0x6a5a3a);
      g.beginPath();
      g.moveTo(s/2, 4); g.lineTo(s - 2, s/3); g.lineTo(s/2, s/3 + 8); g.lineTo(2, s/3);
      g.closePath(); g.fillPath();
      // Right face
      g.fillStyle(0x5a4a2a);
      g.beginPath();
      g.moveTo(s/2, s/3 + 8); g.lineTo(s - 2, s/3); g.lineTo(s - 2, s - 4); g.lineTo(s/2, s - 2);
      g.closePath(); g.fillPath();
      // Left face
      g.fillStyle(0x4a3a22);
      g.beginPath();
      g.moveTo(s/2, s/3 + 8); g.lineTo(2, s/3); g.lineTo(2, s - 4); g.lineTo(s/2, s - 2);
      g.closePath(); g.fillPath();
      // Cross straps on top
      g.lineStyle(1, 0x7a6a52, 0.7);
      g.lineBetween(s*0.3, s/3 - 2, s*0.7, s/3 + 5);
      g.lineBetween(s*0.7, s/3 - 2, s*0.3, s/3 + 5);
      // Edge outlines
      g.lineStyle(1, 0x8a7a5a, 0.4);
      g.lineBetween(s/2, 4, s - 2, s/3);
      g.lineBetween(s - 2, s/3, s - 2, s - 4);
      g.lineBetween(s/2, s - 2, 2, s - 4);
      g.lineBetween(2, s/3, 2, s - 4);
      g.generateTexture('deco_crate', s, s);
      g.destroy();
    }

    // Console/terminal — bigger with visible screen
    if (!this.textures.exists('deco_console')) {
      const g = this.make.graphics({ add: false });
      const w = 48, h = 42;
      // Stand/base
      g.fillStyle(0x1a1a38, 0.9);
      g.fillRoundedRect(w/2 - 8, h - 10, 16, 10, 2);
      // Monitor body
      g.fillStyle(0x1e1e40);
      g.fillRoundedRect(2, 4, w - 4, h - 14, 4);
      g.lineStyle(2, 0x3a3a6a, 0.8);
      g.strokeRoundedRect(2, 4, w - 4, h - 14, 4);
      // Screen
      g.fillStyle(0x0a2a1a, 0.9);
      g.fillRoundedRect(6, 8, w - 12, h - 24, 3);
      // Screen content (green text lines)
      g.fillStyle(0x2ecc71, 0.6);
      g.fillRect(10, 12, 18, 2);
      g.fillRect(10, 17, 24, 2);
      g.fillRect(10, 22, 14, 2);
      // Blinking cursor
      g.fillStyle(0x2ecc71, 0.9);
      g.fillRect(12, 26, 4, 3);
      // Power LED
      g.fillStyle(0x2ecc71, 0.8);
      g.fillCircle(w - 10, h - 14, 2);
      g.generateTexture('deco_console', w, h);
      g.destroy();
    }

    // Barrel / tank — new deco type
    if (!this.textures.exists('deco_barrel')) {
      const g = this.make.graphics({ add: false });
      const w = 30, h = 38;
      // Body
      g.fillStyle(0x3a5a4a);
      g.fillRoundedRect(3, 6, w - 6, h - 8, 6);
      // Highlight
      g.fillStyle(0x4a7a5a, 0.4);
      g.fillRoundedRect(5, 8, 8, h - 14, 3);
      // Bands
      g.lineStyle(2, 0x5a8a6a, 0.6);
      g.lineBetween(3, 12, w - 3, 12);
      g.lineBetween(3, h - 10, w - 3, h - 10);
      // Hazard symbol
      g.fillStyle(0xffaa00, 0.5);
      g.beginPath();
      g.moveTo(w/2, 18); g.lineTo(w/2 + 6, 28); g.lineTo(w/2 - 6, 28);
      g.closePath(); g.fillPath();
      g.fillStyle(0x3a5a4a);
      g.fillRect(w/2 - 1, 21, 2, 4);
      g.fillCircle(w/2, 26, 1.5);
      g.generateTexture('deco_barrel', w, h);
      g.destroy();
    }

    // Antenna / sensor — new deco type
    if (!this.textures.exists('deco_antenna')) {
      const g = this.make.graphics({ add: false });
      const w = 20, h = 48;
      // Pole
      g.fillStyle(0x555580);
      g.fillRect(w/2 - 2, 12, 4, h - 12);
      // Base
      g.fillStyle(0x3a3a60);
      g.fillRoundedRect(w/2 - 8, h - 8, 16, 8, 3);
      // Top dish
      g.fillStyle(0x4a4a80);
      g.fillRoundedRect(2, 4, w - 4, 12, 4);
      // Signal indicator
      g.fillStyle(0x44aaff, 0.7);
      g.fillCircle(w/2, 3, 3);
      g.fillStyle(0x44aaff, 0.2);
      g.fillCircle(w/2, 3, 6);
      g.generateTexture('deco_antenna', w, h);
      g.destroy();
    }
  }

  // ----------------------------------------------------------
  //  World Drawing
  // ----------------------------------------------------------
  _drawBackground() {
    // Single dark background covering the world
    const bg = this.add.graphics().setDepth(-10);
    bg.fillStyle(0x060612);
    bg.fillRect(-2000, -2000, 6000, 6000);

    // Subtle nebula blobs for visual depth (static, painted once)
    const nebula = this.add.graphics().setDepth(-9.5);
    const nebulaColors = [
      { x: -300, y: 100,  r: 280, color: 0x3a1a5e, a: 0.04 },
      { x: 800,  y: -200, r: 320, color: 0x1a2a5e, a: 0.03 },
      { x: 1600, y: 800,  r: 250, color: 0x5e1a2a, a: 0.03 },
      { x: 300,  y: 1200, r: 280, color: 0x1a4a3e, a: 0.03 },
      { x: 1200, y: 200,  r: 200, color: 0x2a1a5e, a: 0.025 },
      { x: -100, y: 700,  r: 220, color: 0x1a3a4e, a: 0.025 },
    ];
    for (const n of nebulaColors) {
      nebula.fillStyle(n.color, n.a);
      nebula.fillCircle(n.x, n.y, n.r);
      nebula.fillStyle(n.color, n.a * 0.5);
      nebula.fillCircle(n.x + 30, n.y - 20, n.r * 0.6);
    }

    // Starfield — single Graphics object
    const stars = this.add.graphics().setDepth(-9);
    const rng = (seed) => {
      let s = seed;
      return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
    };
    const rand = rng(42);
    for (let i = 0; i < 150; i++) {
      const sx = -1000 + rand() * 4000;
      const sy = -1000 + rand() * 3000;
      const alpha = rand() * 0.35 + 0.1;
      const size = rand() * 1.4 + 0.3;
      stars.fillStyle(0xffffff, alpha);
      stars.fillCircle(sx, sy, size);
      // Some stars get a tiny colored halo
      if (i % 5 === 0) {
        const haloColor = [0x6688ff, 0xff8866, 0x88ff66][i % 3];
        stars.fillStyle(haloColor, alpha * 0.15);
        stars.fillCircle(sx, sy, size + 2);
      }
    }
  }

  _drawFloor() {
    const TILE_KEYS = { 0: null, 1: 'tile_metal', 2: 'tile_grate', 3: 'tile_corridor', 4: 'tile_elevated', 5: 'tile_hazard' };
    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        const tileType = MAP_TILES[r][c];
        const key = TILE_KEYS[tileType];
        if (key) {
          const { x, y } = worldToScreen(c, r);
          const sx = x + this.camOX;
          const sy = y + this.camOY;
          const sprite = this.add.image(sx, sy, key);
          sprite.setOrigin(0.5, 0.5);
          sprite.setDepth(-1);
        }
      }
    }
  }

  _drawWalls() {
    const wallGfx = this.add.graphics().setDepth(0.5);
    const wallHeight = 12; // 3D wall height in pixels

    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        if (MAP_TILES[r][c] === 0) continue;

        const neighbors = [
          { dr: -1, dc: 0, side: 'top' },
          { dr: 1,  dc: 0, side: 'bottom' },
          { dr: 0,  dc: -1, side: 'left' },
          { dr: 0,  dc: 1, side: 'right' },
        ];

        for (const n of neighbors) {
          const nr = r + n.dr;
          const nc = c + n.dc;
          const isVoid = nr < 0 || nr >= MAP_H || nc < 0 || nc >= MAP_W || MAP_TILES[nr][nc] === 0;
          if (!isVoid) continue;

          const { x, y } = worldToScreen(c, r);
          const sx = x + this.camOX;
          const sy = y + this.camOY;

          // 3D wall face (extruded downward)
          if (n.side === 'bottom') {
            // Right-facing wall face
            wallGfx.fillStyle(0x1a1a40, 0.9);
            wallGfx.beginPath();
            wallGfx.moveTo(sx + TILE_W/2, sy);
            wallGfx.lineTo(sx, sy + TILE_H/2);
            wallGfx.lineTo(sx, sy + TILE_H/2 + wallHeight);
            wallGfx.lineTo(sx + TILE_W/2, sy + wallHeight);
            wallGfx.closePath();
            wallGfx.fillPath();
          } else if (n.side === 'left') {
            // Left-facing wall face
            wallGfx.fillStyle(0x151535, 0.9);
            wallGfx.beginPath();
            wallGfx.moveTo(sx, sy + TILE_H/2);
            wallGfx.lineTo(sx - TILE_W/2, sy);
            wallGfx.lineTo(sx - TILE_W/2, sy + wallHeight);
            wallGfx.lineTo(sx, sy + TILE_H/2 + wallHeight);
            wallGfx.closePath();
            wallGfx.fillPath();
          }

          // Edge line on top
          wallGfx.lineStyle(2, 0x4a4a8e, 0.7);
          if (n.side === 'top') {
            wallGfx.lineBetween(sx - TILE_W/2, sy, sx, sy - TILE_H/2);
          } else if (n.side === 'right') {
            wallGfx.lineBetween(sx, sy - TILE_H/2, sx + TILE_W/2, sy);
          } else if (n.side === 'bottom') {
            wallGfx.lineBetween(sx + TILE_W/2, sy, sx, sy + TILE_H/2);
          } else if (n.side === 'left') {
            wallGfx.lineBetween(sx, sy + TILE_H/2, sx - TILE_W/2, sy);
          }
        }
      }
    }

    // Edge glow on border tiles
    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        if (MAP_TILES[r][c] === 0) continue;
        const allNeighborsWalkable = [[-1,0],[1,0],[0,-1],[0,1]].every(([dr,dc]) => {
          const nr = r+dr, nc = c+dc;
          return nr >= 0 && nr < MAP_H && nc >= 0 && nc < MAP_W && MAP_TILES[nr][nc] > 0;
        });
        if (allNeighborsWalkable) continue;

        const { x, y } = worldToScreen(c, r);
        const sx = x + this.camOX;
        const sy = y + this.camOY;
        wallGfx.fillStyle(0x3a3a7e, 0.06);
        wallGfx.beginPath();
        wallGfx.moveTo(sx, sy - TILE_H/2);
        wallGfx.lineTo(sx + TILE_W/2, sy);
        wallGfx.lineTo(sx, sy + TILE_H/2);
        wallGfx.lineTo(sx - TILE_W/2, sy);
        wallGfx.closePath();
        wallGfx.fillPath();
      }
    }
  }

  _drawRoomZones() {
    // Subtle colored overlays for each room
    const g = this.add.graphics().setDepth(-0.5);
    for (const zone of ROOM_ZONES) {
      g.fillStyle(zone.color, zone.alpha);
      for (let r = zone.row; r < zone.row + zone.h; r++) {
        for (let c = zone.col; c < zone.col + zone.w; c++) {
          const { x, y } = worldToScreen(c, r);
          const sx = x + this.camOX;
          const sy = y + this.camOY;
          // Diamond fill
          g.beginPath();
          g.moveTo(sx, sy - TILE_H/2);
          g.lineTo(sx + TILE_W/2, sy);
          g.lineTo(sx, sy + TILE_H/2);
          g.lineTo(sx - TILE_W/2, sy);
          g.closePath();
          g.fillPath();
        }
      }
    }
  }

  _drawDecorations() {
    const decos = [
      // === Storage (top-left) ===
      { key: 'deco_crate',   col: 1,  row: 1,  a: 0.85 },
      { key: 'deco_crate',   col: 7,  row: 1,  a: 0.8  },
      { key: 'deco_crate',   col: 1,  row: 2,  a: 0.75 },
      { key: 'deco_crate',   col: 7,  row: 2,  a: 0.7  },
      { key: 'deco_barrel',  col: 3,  row: 4,  a: 0.75 },
      { key: 'deco_barrel',  col: 5,  row: 4,  a: 0.7  },
      { key: 'deco_pipe',    col: 3,  row: 1,  a: 0.6  },
      { key: 'deco_pipe',    col: 5,  row: 1,  a: 0.55 },
      { key: 'deco_crate',   col: 1,  row: 4,  a: 0.7  },
      { key: 'deco_wall_panel', col: 5, row: 3, a: 0.7 },
      // === Command Bridge (top-center) ===
      { key: 'deco_console', col: 12, row: 1,  a: 0.9  },
      { key: 'deco_console', col: 17, row: 1,  a: 0.9  },
      { key: 'deco_console', col: 14, row: 1,  a: 0.85 },
      { key: 'deco_wall_panel', col: 12, row: 3, a: 0.75 },
      { key: 'deco_wall_panel', col: 17, row: 3, a: 0.75 },
      { key: 'deco_console', col: 15, row: 4,  a: 0.8  },
      { key: 'deco_antenna', col: 13, row: 4,  a: 0.7  },
      // === Reactor (top-right) ===
      { key: 'deco_console', col: 23, row: 1,  a: 0.85 },
      { key: 'deco_console', col: 28, row: 1,  a: 0.8  },
      { key: 'deco_pipe',    col: 28, row: 3,  a: 0.65 },
      { key: 'deco_pipe',    col: 23, row: 4,  a: 0.6  },
      { key: 'deco_barrel',  col: 23, row: 3,  a: 0.7  },
      { key: 'deco_wall_panel', col: 26, row: 4, a: 0.7 },
      { key: 'deco_barrel',  col: 27, row: 2,  a: 0.65 },
      // === Corridors (top section) ===
      { key: 'deco_pipe', col: 4,  row: 6,  a: 0.55 },
      { key: 'deco_pipe', col: 4,  row: 7,  a: 0.5  },
      { key: 'deco_pipe', col: 25, row: 6,  a: 0.55 },
      { key: 'deco_pipe', col: 25, row: 7,  a: 0.5  },
      { key: 'deco_pipe', col: 13, row: 5,  a: 0.5  },
      { key: 'deco_pipe', col: 16, row: 5,  a: 0.5  },
      // === Hub Central ===
      { key: 'deco_wall_panel', col: 11, row: 8,  a: 0.75 },
      { key: 'deco_wall_panel', col: 18, row: 8,  a: 0.75 },
      { key: 'deco_wall_panel', col: 11, row: 15, a: 0.7  },
      { key: 'deco_wall_panel', col: 18, row: 15, a: 0.7  },
      { key: 'deco_console',    col: 11, row: 10, a: 0.8  },
      { key: 'deco_console',    col: 18, row: 10, a: 0.8  },
      { key: 'deco_console',    col: 11, row: 13, a: 0.75 },
      { key: 'deco_console',    col: 18, row: 13, a: 0.75 },
      { key: 'deco_pipe',       col: 11, row: 12, a: 0.55 },
      { key: 'deco_pipe',       col: 18, row: 12, a: 0.55 },
      { key: 'deco_antenna',    col: 14, row: 8,  a: 0.6  },
      { key: 'deco_antenna',    col: 15, row: 15, a: 0.6  },
      // === Medical (left) ===
      { key: 'deco_console',    col: 1,  row: 10, a: 0.85 },
      { key: 'deco_console',    col: 1,  row: 12, a: 0.8  },
      { key: 'deco_wall_panel', col: 6,  row: 11, a: 0.75 },
      { key: 'deco_wall_panel', col: 6,  row: 13, a: 0.7  },
      { key: 'deco_barrel',     col: 1,  row: 14, a: 0.7  },
      { key: 'deco_pipe',       col: 3,  row: 10, a: 0.6  },
      { key: 'deco_crate',      col: 5,  row: 14, a: 0.65 },
      // === Electrical (right) ===
      { key: 'deco_console',    col: 23, row: 10, a: 0.85 },
      { key: 'deco_console',    col: 28, row: 10, a: 0.8  },
      { key: 'deco_wall_panel', col: 28, row: 12, a: 0.75 },
      { key: 'deco_wall_panel', col: 23, row: 14, a: 0.7  },
      { key: 'deco_console',    col: 28, row: 14, a: 0.75 },
      { key: 'deco_pipe',       col: 23, row: 13, a: 0.6  },
      { key: 'deco_barrel',     col: 27, row: 14, a: 0.65 },
      // === Corridors (mid section) ===
      { key: 'deco_pipe', col: 7,  row: 11, a: 0.5  },
      { key: 'deco_pipe', col: 7,  row: 12, a: 0.5  },
      { key: 'deco_pipe', col: 22, row: 11, a: 0.5  },
      { key: 'deco_pipe', col: 22, row: 12, a: 0.5  },
      // === Corridors (bottom section) ===
      { key: 'deco_pipe', col: 3,  row: 16, a: 0.55 },
      { key: 'deco_pipe', col: 3,  row: 17, a: 0.5  },
      { key: 'deco_pipe', col: 13, row: 16, a: 0.5  },
      { key: 'deco_pipe', col: 16, row: 16, a: 0.5  },
      { key: 'deco_pipe', col: 25, row: 16, a: 0.55 },
      { key: 'deco_pipe', col: 25, row: 17, a: 0.5  },
      // === Armory (bottom-left) ===
      { key: 'deco_crate',      col: 1,  row: 18, a: 0.85 },
      { key: 'deco_crate',      col: 7,  row: 18, a: 0.8  },
      { key: 'deco_crate',      col: 1,  row: 20, a: 0.75 },
      { key: 'deco_crate',      col: 5,  row: 22, a: 0.7  },
      { key: 'deco_wall_panel', col: 5,  row: 18, a: 0.75 },
      { key: 'deco_wall_panel', col: 5,  row: 21, a: 0.7  },
      { key: 'deco_console',    col: 1,  row: 22, a: 0.75 },
      { key: 'deco_barrel',     col: 3,  row: 19, a: 0.7  },
      { key: 'deco_pipe',       col: 3,  row: 18, a: 0.55 },
      // === Engine Room (bottom-center) ===
      { key: 'deco_console', col: 10, row: 18, a: 0.85 },
      { key: 'deco_console', col: 19, row: 18, a: 0.85 },
      { key: 'deco_console', col: 10, row: 22, a: 0.8  },
      { key: 'deco_console', col: 19, row: 22, a: 0.8  },
      { key: 'deco_pipe',    col: 12, row: 18, a: 0.65 },
      { key: 'deco_pipe',    col: 17, row: 18, a: 0.65 },
      { key: 'deco_pipe',    col: 12, row: 22, a: 0.6  },
      { key: 'deco_pipe',    col: 17, row: 22, a: 0.6  },
      { key: 'deco_wall_panel', col: 10, row: 20, a: 0.75 },
      { key: 'deco_wall_panel', col: 19, row: 20, a: 0.75 },
      { key: 'deco_barrel',  col: 14, row: 18, a: 0.7  },
      { key: 'deco_barrel',  col: 15, row: 22, a: 0.65 },
      { key: 'deco_barrel',  col: 11, row: 20, a: 0.6  },
      { key: 'deco_barrel',  col: 18, row: 20, a: 0.6  },
      // === Life Support (bottom-right) ===
      { key: 'deco_console',    col: 23, row: 18, a: 0.85 },
      { key: 'deco_console',    col: 23, row: 22, a: 0.75 },
      { key: 'deco_wall_panel', col: 26, row: 18, a: 0.75 },
      { key: 'deco_wall_panel', col: 26, row: 21, a: 0.7  },
      { key: 'deco_barrel',     col: 23, row: 20, a: 0.7  },
      { key: 'deco_pipe',       col: 25, row: 19, a: 0.6  },
      { key: 'deco_antenna',    col: 25, row: 22, a: 0.65 },
    ];

    for (const deco of decos) {
      const { x, y } = worldToScreen(deco.col, deco.row);
      const sx = x + this.camOX;
      const sy = y + this.camOY;
      const sprite = this.add.image(sx, sy, deco.key);
      sprite.setOrigin(0.5, 0.75);
      sprite.setDepth(sy - 1);
      sprite.setAlpha(deco.a || 0.5);
    }
  }

  _drawRoomLabels() {
    for (const label of ROOM_LABELS) {
      const { x, y } = worldToScreen(label.col, label.row);
      const sx = x + this.camOX;
      const sy = y + this.camOY;

      const text = this.add.text(sx, sy - 3, t_room(label.key), {
        fontSize: '11px', fontFamily: 'Courier New', fontStyle: 'bold',
        color: label.color,
        stroke: '#080816', strokeThickness: 3,
        align: 'center',
      }).setOrigin(0.5).setDepth(0.1).setAlpha(0.55);

      // Dynamic-width background pill
      const tw = text.width + 20;
      const th = text.height + 8;
      const bg = this.add.graphics().setDepth(0);
      bg.fillStyle(0x080816, 0.65);
      bg.fillRoundedRect(sx - tw/2, sy - 3 - th/2, tw, th, 6);
      const colorInt = parseInt(label.color.replace('#', ''), 16);
      bg.lineStyle(1, colorInt, 0.15);
      bg.strokeRoundedRect(sx - tw/2, sy - 3 - th/2, tw, th, 6);
    }
  }

  // ----------------------------------------------------------
  //  HUD (DOM-based overlay — not affected by camera zoom)
  // ----------------------------------------------------------
  _createHUD() {
    const $ = (id) => document.getElementById(id);

    // Show DOM HUD
    $('game-hud').classList.add('active');

    // Apply locale to HUD labels
    $('hud-timer-label').textContent = t('hud_time_label');
    $('hud-stability-label').textContent = t('hud_stability_label');
    $('hud-score-label').textContent = t('hud_score_label');
    $('hud-item').textContent = t('hud_item_none');
    $('hud-controls').textContent = t('hud_controls');

    // Store DOM refs for fast updates
    this.hudDOM = {
      timer: $('hud-timer'),
      stabilityFill: $('hud-stability-fill'),
      stabilityText: $('hud-stability-text'),
      score: $('hud-score'),
      item: $('hud-item'),
      emergencies: $('hud-emergencies'),
      alert: $('hud-alert'),
      disconnect: $('hud-disconnect'),
    };

    // Minimap setup
    this._minimapCanvas = $('hud-minimap');
    this._minimapCtx = this._minimapCanvas?.getContext('2d');
    this._drawMinimapBase();
  }

  _drawMinimapBase() {
    if (!this._minimapCtx) return;
    const ctx = this._minimapCtx;
    const cw = this._minimapCanvas.width;
    const ch = this._minimapCanvas.height;
    const tileW = cw / MAP_W;
    const tileH = ch / MAP_H;

    // Draw static base once to an offscreen canvas
    this._minimapBaseCanvas = document.createElement('canvas');
    this._minimapBaseCanvas.width = cw;
    this._minimapBaseCanvas.height = ch;
    const bctx = this._minimapBaseCanvas.getContext('2d');

    const TILE_COLORS = {
      0: null,
      1: '#1e1e3e',
      2: '#1a1a38',
      3: '#161630',
      4: '#252550',
      5: '#1a1a30',
    };

    const ZONE_COLORS = {
      storage: 'rgba(255,217,61,0.15)',
      command: 'rgba(0,206,201,0.18)',
      reactor: 'rgba(255,107,107,0.18)',
      medical: 'rgba(162,155,254,0.15)',
      hub: 'rgba(116,185,255,0.15)',
      electrical: 'rgba(253,121,168,0.15)',
      armory: 'rgba(225,112,85,0.15)',
      engine: 'rgba(253,203,110,0.18)',
      lifesupport: 'rgba(85,239,196,0.15)',
    };

    bctx.clearRect(0, 0, cw, ch);
    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        const color = TILE_COLORS[MAP_TILES[r][c]];
        if (color) {
          bctx.fillStyle = color;
          bctx.fillRect(c * tileW, r * tileH, tileW + 0.5, tileH + 0.5);
        }
      }
    }

    // Room zone tints
    for (const zone of ROOM_ZONES) {
      const label = ROOM_LABELS.find(l =>
        l.col >= zone.col && l.col <= zone.col + zone.w &&
        l.row >= zone.row && l.row <= zone.row + zone.h
      );
      const zoneKey = label?.key;
      bctx.fillStyle = ZONE_COLORS[zoneKey] || 'rgba(100,100,200,0.1)';
      bctx.fillRect(zone.col * tileW, zone.row * tileH, zone.w * tileW, zone.h * tileH);
    }
  }

  _updateMinimap() {
    if (!this._minimapCtx || !this.room) return;
    const ctx = this._minimapCtx;
    const cw = this._minimapCanvas.width;
    const ch = this._minimapCanvas.height;
    const tileW = cw / MAP_W;
    const tileH = ch / MAP_H;

    // Draw base
    ctx.clearRect(0, 0, cw, ch);
    if (this._minimapBaseCanvas) {
      ctx.drawImage(this._minimapBaseCanvas, 0, 0);
    }

    // Draw machines (red = broken, green = ok)
    this.room.state.machines.forEach((machine) => {
      const mx = machine.x * tileW;
      const my = machine.y * tileH;
      ctx.fillStyle = machine.broken ? '#ff4444' : '#2a6e3a';
      ctx.fillRect(mx - 2, my - 2, 4, 4);
    });

    // Draw items
    ctx.fillStyle = '#ffd93d';
    this.room.state.items.forEach((item) => {
      if (!item.carriedBy) {
        ctx.beginPath();
        ctx.arc(item.x * tileW, item.y * tileH, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw players
    const MINI_COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
    this.room.state.players.forEach((player, sid) => {
      const px = player.x * tileW;
      const py = player.y * tileH;
      const isLocal = sid === this.localSessionId;
      const color = MINI_COLORS[player.colorIndex] || '#fff';

      // Player dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, isLocal ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();

      // Local player gets a pulsing ring
      if (isLocal) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  _hideHUD() {
    document.getElementById('game-hud').classList.remove('active');
  }

  _showDisconnect() {
    this.hudDOM.disconnect.classList.add('active');
  }

  _flashEmergencyAlertDOM(type) {
    const label = t_emergency(type);
    this.hudDOM.alert.textContent = `⚠ ${label} ⚠`;
    this.hudDOM.alert.classList.add('show');
    // Camera shake
    this.cameras.main.shake(300, 0.005);
    setTimeout(() => {
      this.hudDOM.alert.classList.remove('show');
    }, 2500);
  }

  // ----------------------------------------------------------
  //  Emergency Effect Layers
  // ----------------------------------------------------------
  _createEffectLayers() {
    // Scale overlays to cover full viewport despite zoom
    const z = this.cameras.main.zoom;
    const ow = 1280 * z, oh = 720 * z;
    const invZ = 1 / z;

    // Gas leak overlay (yellow-green tint — stronger for visibility)
    this.gasOverlay = this.add.graphics().setDepth(9000).setAlpha(0);
    this.gasOverlay.fillStyle(0x88cc00, 0.22);
    this.gasOverlay.fillRect(0, 0, ow, oh);
    this.gasOverlay.setScrollFactor(0).setScale(invZ);

    // Short circuit overlay (dark fog) — redrawn each frame
    this.circuitOverlay = this.add.graphics().setDepth(9001).setAlpha(0);
    this.circuitOverlay.setScrollFactor(0).setScale(invZ);

    // Overheat border overlay — use ow/oh so it covers the full viewport after invZ scale
    this.overheatBorder = this.add.graphics().setDepth(9002).setAlpha(0);
    this.overheatBorder.lineStyle(6, 0xff0000, 0.8);
    this.overheatBorder.strokeRect(2, 2, ow - 4, oh - 4);
    this.overheatBorder.lineStyle(2, 0xff4444, 0.4);
    this.overheatBorder.strokeRect(8, 8, ow - 16, oh - 16);
    this.overheatBorder.setScrollFactor(0).setScale(invZ);

    this.overheatText = this.add.text(ow / 2, oh * 0.1, '', {
      fontSize: '18px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ff0000', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(9003).setAlpha(0).setScrollFactor(0).setScale(invZ);

    // Vignette overlay — darkens edges for cinematic feel
    const vig = this.add.graphics().setDepth(8999).setScrollFactor(0).setScale(invZ);
    const vw = ow, vh = oh;
    // Top edge
    vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.5, 0.5, 0, 0);
    vig.fillRect(0, 0, vw, vh * 0.12);
    // Bottom edge
    vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.5, 0.5);
    vig.fillRect(0, vh * 0.88, vw, vh * 0.12);
    // Left edge
    vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.4, 0, 0.4, 0);
    vig.fillRect(0, 0, vw * 0.08, vh);
    // Right edge
    vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.4, 0, 0.4);
    vig.fillRect(vw * 0.92, 0, vw * 0.08, vh);
  }

  // ----------------------------------------------------------
  //  Input Setup
  // ----------------------------------------------------------
  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    const isZQSD = t('controls_layout') === 'zqsd';
    this.wasd = this.input.keyboard.addKeys({
      up:    isZQSD ? Phaser.Input.Keyboard.KeyCodes.Z : Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  isZQSD ? Phaser.Input.Keyboard.KeyCodes.Q : Phaser.Input.Keyboard.KeyCodes.A,
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

    // Phase changes (no waiting overlay needed with DOM HUD)
    room.state.listen('phase', (_value) => {});

    // Game over message
    room.onMessage('game_over', (data) => {
      // Server now sends enriched scores: { score, color, kos }
      const enrichedScores = {};
      for (const [sid, scoreData] of Object.entries(data.scores)) {
        const score = typeof scoreData === 'number' ? scoreData : (scoreData?.score || 0);
        const color = typeof scoreData === 'object' ? scoreData.color : undefined;
        const kos = typeof scoreData === 'object' ? (scoreData.kos || 0) : 0;
        // Fallback to room.state.players if server didn't send enriched data
        const player = room.state.players.get(sid);
        const colorIdx = color !== undefined ? color : (player ? player.color : 0);
        enrichedScores[sid] = {
          score,
          color: colorIdx,
          name: t_color(colorIdx),
          kos: kos || (player ? (player.kos || 0) : 0),
        };
      }

      this._hideHUD();
      this.scene.start('EndScene', {
        room: this.room,
        reason: data.reason,
        winner: data.winner,
        scores: enrichedScores,
        stability: room.state.stability,
      });
    });

    // Emergency spawn notification
    room.onMessage('emergency_spawn', (data) => {
      this._flashEmergencyAlertDOM(data.type);
    });

    // Repair complete notification
    room.onMessage('repair_complete', (data) => {
      this._showRepairCompleteEffect(data);
    });

    // Handle disconnection — code 4000 is a normal/intentional leave, ignore it
    room.onLeave((code) => {
      if (code === 4000) return; // Normal leave (scene switch, game over, etc.)
      console.warn('Disconnected, code:', code);
      this._showDisconnect();
      this.room = null;
      this.time.delayedCall(2500, () => {
        this._hideHUD();
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

    // Ground ring indicator for local player
    const groundRing = isLocal ? this.add.graphics() : null;
    if (groundRing) {
      groundRing.lineStyle(2, PLAYER_COLORS[colorIdx], 0.5);
      groundRing.strokeEllipse(0, 0, 36, 16);
      groundRing.fillStyle(PLAYER_COLORS[colorIdx], 0.08);
      groundRing.fillEllipse(0, 0, 36, 16);
    }

    const sprite = this.add.image(0, 0, `player_${colorIdx}`)
      .setOrigin(0.5, 0.9)
      .setScale(0.55);

    // Name label — compact pill style
    const label = this.add.text(0, 0,
      isLocal ? t('lobby_you') : t_color(colorIdx),
      {
        fontSize: '10px', fontFamily: 'Courier New', fontStyle: 'bold',
        color: isLocal ? '#2ecc71' : '#ffffff',
        stroke: '#000', strokeThickness: 3,
        backgroundColor: isLocal ? '#0a2e14' : '#0a0a1e',
        padding: { x: 5, y: 2 },
      }
    ).setOrigin(0.5, 1);

    const carryIcon = this.add.text(0, 0, '', {
      fontSize: '9px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ffd93d', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1);

    // Repair progress bar (hidden by default)
    const repairBarBg = this.add.graphics().setVisible(false);
    const repairBarFill = this.add.graphics().setVisible(false);

    // Stars effect for stunned state
    const stars = this.add.text(0, 0, '★ ★ ★', {
      fontSize: '10px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ffd93d', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 1).setVisible(false);

    this.playerSprites[sessionId] = {
      sprite, label, carryIcon, player, stars,
      repairBarBg, repairBarFill, groundRing,
      stateTimer: 0,
      _lastX: 0, _lastY: 0,
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
    if (d.groundRing) d.groundRing.destroy();
    delete this.playerSprites[sessionId];
  }

  // ----------------------------------------------------------
  //  Machine Sprites
  // ----------------------------------------------------------
  _addMachine(machine, machineId) {
    const type = machine.machineType;
    const texKey = `machine_${type}`;
    const { x, y } = worldToScreen(machine.x, machine.y);
    const sx = x + this.camOX;
    const sy = y + this.camOY;

    const sprite = this.add.image(sx, sy, texKey);
    sprite.setOrigin(0.5, 0.9);
    sprite.setDepth(sy);
    sprite.setScale(0.85);

    // Status glow (ground indicator) — drawn once, alpha animated
    const glow = this.add.graphics();
    glow.setDepth(sy - 0.5);

    // Name label — hidden by default, only shown when broken
    const nameLabel = this.add.text(sx, sy - 44, t_machine(type), {
      fontSize: '10px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ddd', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(sy + 0.1).setAlpha(0);

    // Status text — hidden when OK, prominent when broken
    const statusText = this.add.text(sx, sy - 32, '', {
      fontSize: '9px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ff4444', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(sy + 0.2).setVisible(false);

    this.machineSprites[machineId] = {
      sprite, glow, nameLabel, statusText, machine,
      sx, sy, type, _prevStatus: null,
    };
  }

  _removeMachine(machineId) {
    const d = this.machineSprites[machineId];
    if (!d) return;
    d.sprite.destroy();
    d.glow.destroy();
    d.nameLabel.destroy();
    d.statusText.destroy();
    delete this.machineSprites[machineId];
  }

  // ----------------------------------------------------------
  //  Item Sprites
  // ----------------------------------------------------------
  _addItem(item, itemId) {
    const type = item.itemType;
    const texKey = `item_${type}`;
    const sprite = this.add.image(0, 0, texKey);
    sprite.setOrigin(0.5, 0.5).setScale(1.2);

    // Item label
    const itemColor = ITEM_STYLES[type] ? PLAYER_COLORS_HEX[Object.keys(ITEM_STYLES).indexOf(type)] || '#ffd93d' : '#ffd93d';
    const label = this.add.text(0, 0, t_item(type), {
      fontSize: '9px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: itemColor,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setAlpha(0.8);

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
  // _flashEmergencyAlert is now DOM-based (_flashEmergencyAlertDOM in _createHUD)

  _showRepairCompleteEffect(data) {
    const playerData = this.playerSprites[data.playerId];
    if (!playerData) return;

    const { x, y } = worldToScreen(playerData.player.x, playerData.player.y);
    const sx = x + this.camOX;
    const sy = y + this.camOY;

    // Green checkmark + points
    const pointsText = this.add.text(sx, sy - 50, `✓ +${data.points}`, {
      fontSize: '18px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#2ecc71', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(9998);

    this.tweens.add({
      targets: pointsText,
      y: sy - 90,
      alpha: 0,
      duration: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => pointsText.destroy(),
    });
  }

  // ----------------------------------------------------------
  //  UPDATE LOOP
  // ----------------------------------------------------------
  update(_time, delta) {
    if (!this.room) return;
    this._delta = delta;

    // --- Ensure roundPixels stays off (Phaser may override after create) ---
    if (this.cameras.main.roundPixels) {
      this.cameras.main.roundPixels = false;
    }

    // --- Camera Follow (Phaser built-in) ---
    if (!this._cameraFollowing) {
      const localData = this.playerSprites[this.localSessionId];
      if (localData && localData.sprite.x !== 0) {
        const cam = this.cameras.main;
        // Center camera on player immediately, then enable smooth follow
        cam.centerOn(localData.sprite.x, localData.sprite.y);
        cam.startFollow(localData.sprite, true, 0.6, 0.6);
        cam.setFollowOffset(0, -10);
        this._cameraFollowing = true;
      }
    }

    // --- Send Input ---
    let sx = 0, sy = 0;
    if (this.cursors.right.isDown || this.wasd.right.isDown) sx += 1;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  sx -= 1;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  sy += 1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    sy -= 1;

    // Sticky action flags — hold true for 60ms so the 20Hz server tick sees them
    const now = this.time.now;
    if (Phaser.Input.Keyboard.JustDown(this.pickupKey)) this._pickupUntil = now + 60;
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) this._attackUntil = now + 60;
    if (Phaser.Input.Keyboard.JustDown(this.dashKey))   this._dashUntil   = now + 60;

    this.room.send('input', {
      sx, sy,
      pickup: now < (this._pickupUntil || 0),
      attack: now < (this._attackUntil || 0),
      dash:   now < (this._dashUntil   || 0),
      repair: this.repairKey.isDown,
    });

    // --- Client-side prediction for local player ---
    this._localInput = { sx, sy };

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

    // --- Update Interaction Prompts ---
    this._updateInteractPrompt();

    // --- Update Minimap ---
    this._updateMinimap();
  }

  // ----------------------------------------------------------
  //  HUD Update
  // ----------------------------------------------------------
  _updateHUD() {
    if (!this.hudDOM) return;
    const state = this.room.state;
    const h = this.hudDOM;

    // Timer
    const totalSec = Math.max(0, Math.ceil(state.timer));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    h.timer.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    h.timer.classList.toggle('warning', totalSec <= 30);

    // Stability bar
    const stability = state.stability || 0;
    h.stabilityFill.style.width = `${Math.max(0, stability)}%`;
    h.stabilityText.textContent = `${Math.round(stability)}%`;
    h.stabilityFill.className = 'stability-bar-fill' +
      (stability < 30 ? ' low' : stability < 60 ? ' medium' : '');

    // Score (local player)
    const localPlayer = state.players.get(this.localSessionId);
    if (localPlayer) {
      h.score.textContent = String(localPlayer.score || 0);

      // Carried item
      if (localPlayer.carryingItemId) {
        const item = state.items.get(localPlayer.carryingItemId);
        const itemName = item ? t_item(item.itemType) : '?';
        h.item.textContent = `${t('hud_item_prefix')} ${itemName}`;
        h.item.classList.add('has-item');
      } else {
        h.item.textContent = t('hud_item_none');
        h.item.classList.remove('has-item');
      }
    }

    // Emergency list
    const emergencyLines = [];
    if (state.emergencies) {
      state.emergencies.forEach((emg) => {
        if (emg.active) {
          const label = t_emergency(emg.emergencyType);
          const secs = Math.ceil(emg.timeRemaining || 0);
          emergencyLines.push(`⚠ ${label} (${secs}s)`);
        }
      });
    }
    h.emergencies.textContent = emergencyLines.join('  │  ');
  }

  // ----------------------------------------------------------
  //  Player Rendering
  // ----------------------------------------------------------
  _renderPlayers() {
    const PRED_SPEED = 3.5; // Must match server PLAYER_SPEED
    const dt = Math.min(this._delta || 16, 50);
    const dtSec = dt / 1000;

    for (const [sid, data] of Object.entries(this.playerSprites)) {
      const { sprite, label, carryIcon, player, stars, repairBarBg, repairBarFill, groundRing } = data;
      const isLocal = (sid === this.localSessionId);

      let screenX, screenY;

      if (isLocal && this._localInput && player.state !== 'stunned' && player.state !== 'repairing') {
        // --- Client-side prediction for local player ---
        // Initialize predicted world pos from server on first frame
        if (!this._predX) {
          this._predX = player.x;
          this._predY = player.y;
        }

        // Apply same movement as server: convert screen input to world velocity
        const { sx, sy } = this._localInput;
        const wx = sx + 2 * sy;
        const wy = -sx + 2 * sy;
        const len = Math.sqrt(wx * wx + wy * wy);

        if (len > 0) {
          const vx = (wx / len) * PRED_SPEED;
          const vy = (wy / len) * PRED_SPEED;
          this._predX += vx * dtSec;
          this._predY += vy * dtSec;
        }

        // Wall collision: replicate server _pushOutOfWalls (PLAYER_RADIUS = 0.35)
        const PR = 0.35;
        const _isWalk = (wx, wy) => {
          const tx = Math.floor(wx), ty = Math.floor(wy);
          if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return false;
          return MAP_TILES[ty]?.[tx] > 0;
        };
        const tileX = Math.floor(this._predX);
        const tileY = Math.floor(this._predY);
        // If completely outside walkable area, snap back
        if (!_isWalk(this._predX, this._predY)) {
          this._predX = player.x;
          this._predY = player.y;
        } else {
          // Push out per-axis like server
          const fracX = this._predX - tileX;
          const fracY = this._predY - tileY;
          if (fracX < PR && !_isWalk(tileX - 1 + 0.5, tileY + 0.5)) {
            this._predX = tileX + PR;
          }
          if (fracX > 1 - PR && !_isWalk(tileX + 1 + 0.5, tileY + 0.5)) {
            this._predX = tileX + 1 - PR;
          }
          if (fracY < PR && !_isWalk(tileX + 0.5, tileY - 1 + 0.5)) {
            this._predY = tileY + PR;
          }
          if (fracY > 1 - PR && !_isWalk(tileX + 0.5, tileY + 1 + 0.5)) {
            this._predY = tileY + 1 - PR;
          }
        }

        // Gently reconcile with server authoritative position (drift correction)
        const drift = Math.hypot(this._predX - player.x, this._predY - player.y);
        if (drift > 1.5) {
          // Snap if too far off
          this._predX = player.x;
          this._predY = player.y;
        } else if (drift > 0.05) {
          // Gentle correction toward server
          const corrF = 1 - Math.exp(-3 * dtSec);
          this._predX += (player.x - this._predX) * corrF;
          this._predY += (player.y - this._predY) * corrF;
        }

        const pos = worldToScreen(this._predX, this._predY);
        screenX = pos.x + this.camOX;
        screenY = pos.y + this.camOY;
      } else {
        // --- Remote players (or stunned/repairing local): lerp toward server ---
        const { x, y } = worldToScreen(player.x, player.y);
        const targetX = x + this.camOX;
        const targetY = y + this.camOY;

        // Frame-rate independent lerp: converges ~95% within one server tick
        const lerpF = 1 - Math.exp(-60 * dt / 1000);
        screenX = sprite.x === 0 ? targetX : sprite.x + (targetX - sprite.x) * lerpF;
        screenY = sprite.y === 0 ? targetY : sprite.y + (targetY - sprite.y) * lerpF;

        // Reset prediction when local player is in special state
        if (isLocal) {
          this._predX = player.x;
          this._predY = player.y;
        }
      }

      sprite.setPosition(screenX, screenY);
      label.setPosition(screenX, screenY - 58);
      carryIcon.setPosition(screenX, screenY - 70);
      stars.setPosition(screenX, screenY - 70);
      if (groundRing) {
        groundRing.setPosition(screenX, screenY - 3);
        groundRing.setDepth(screenY - 0.5);
      }

      // Flip sprite based on movement direction
      const dx = player.x - (data._lastX || player.x);
      const dy = player.y - (data._lastY || player.y);
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        // In isometric: moving right (dx>0) or up (dy<0) = face right
        const faceRight = (dx - dy) > 0;
        sprite.setFlipX(!faceRight);
      }
      data._lastX = player.x;
      data._lastY = player.y;

      // Y-SORTING
      const depth = screenY;
      sprite.setDepth(depth);
      label.setDepth(depth + 0.1);
      carryIcon.setDepth(depth + 0.2);
      stars.setDepth(depth + 0.3);

      // Walking bob animation
      const isMoving = Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01;
      if (isMoving && player.state === 'idle') {
        const bob = Math.sin(this.time.now * 0.012) * 2;
        sprite.y += bob;
      }

      // Carry indicator
      if (player.carryingItemId) {
        const item = this.room.state.items.get(player.carryingItemId);
        carryIcon.setText(item ? `[${t_item(item.itemType)}]` : `[?]`);
        carryIcon.setVisible(true);
      } else {
        carryIcon.setVisible(false);
      }

      // State effects
      const pState = player.state;

      if (pState === 'stunned') {
        sprite.x += Math.sin(this.time.now * 0.05) * 3;
        stars.setVisible(true);
        sprite.setAlpha(1);
        sprite.setAngle(0);
      }
      else if (pState === 'knocked') {
        sprite.setAngle(90);
        sprite.setAlpha(0.5);
        stars.setVisible(false);
      }
      else if (pState === 'repairing') {
        sprite.setAngle(0);
        sprite.setAlpha(1);
        stars.setVisible(false);
        sprite.x += Math.sin(this.time.now * 0.01) * 2;
      }
      else {
        sprite.setAngle(0);
        sprite.setAlpha(1);
        stars.setVisible(false);
      }

      // Repair progress bar — bigger, more visible, redrawn each frame to follow player
      const repairing = player.repairProgress > 0 && player.repairProgress < 1 && pState === 'repairing';
      if (repairing) {
        const prog = player.repairProgress;
        const barW = 60, barH = 8;
        const barX = screenX - barW / 2;
        const barY = screenY - 80;

        repairBarBg.clear().setVisible(true);
        repairBarBg.fillStyle(0x000000, 0.7);
        repairBarBg.fillRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 4);
        repairBarBg.lineStyle(1, 0x4488ff, 0.6);
        repairBarBg.strokeRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 4);
        repairBarBg.setDepth(depth + 0.4);

        repairBarFill.clear().setVisible(true);
        repairBarFill.fillStyle(0x2ecc71);
        const fillW = Math.max(2, prog * barW);
        repairBarFill.fillRoundedRect(barX, barY, fillW, barH, 3);
        // Glow effect on the fill
        repairBarFill.fillStyle(0x5dff9e, 0.3);
        repairBarFill.fillRoundedRect(barX, barY, fillW, barH / 2, { tl: 3, tr: 3, bl: 0, br: 0 });
        repairBarFill.setDepth(depth + 0.5);
      } else {
        if (repairBarBg.visible) {
          repairBarBg.clear().setVisible(false);
          repairBarFill.clear().setVisible(false);
        }
      }
    }
  }

  // ----------------------------------------------------------
  //  Machine Rendering
  // ----------------------------------------------------------
  _renderMachines() {
    for (const [_id, data] of Object.entries(this.machineSprites)) {
      const { sprite, glow, nameLabel, statusText, machine, sx, sy, type } = data;
      const prevStatus = data._prevStatus;
      const status = machine.status;

      // Only update glow/texture when status CHANGES (not every frame)
      if (status !== prevStatus) {
        data._prevStatus = status;
        glow.clear();

        if (status === 'working') {
          glow.fillStyle(0x2ecc71, 0.06);
          glow.fillEllipse(sx, sy + 2, 30, 12);
          statusText.setVisible(false);
          nameLabel.setAlpha(0);
          const texKey = `machine_${type}`;
          if (this.textures.exists(texKey)) sprite.setTexture(texKey);
        } else if (status === 'broken') {
          glow.fillStyle(0xff0000, 0.2);
          glow.fillEllipse(sx, sy + 2, 50, 22);
          const texKeyBroken = `machine_${type}_broken`;
          if (this.textures.exists(texKeyBroken)) sprite.setTexture(texKeyBroken);
          nameLabel.setAlpha(0.8);
          statusText.setVisible(true);
          if (machine.requiredItem) {
            statusText.setText(`${t('machine_required')} ${t_item(machine.requiredItem)}`);
          } else {
            statusText.setText(t('machine_broken'));
          }
        }
      }

      // Pulse broken glow alpha (cheap — no redraw)
      if (status === 'broken') {
        glow.setAlpha(0.5 + Math.sin(this.time.now * 0.006) * 0.5);
      }

      sprite.setDepth(sy);
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
        label.setPosition(screenX, screenY + 14);

        // Gentle float animation
        sprite.y += Math.sin(this.time.now * 0.003 + item.x * 100) * 2;

        // Subtle glow pulse
        sprite.setAlpha(0.8 + Math.sin(this.time.now * 0.004) * 0.15);

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

    // Short circuit: darkness with visibility hole — redraw only every 5 frames
    if (hasCircuit) {
      this._circuitFrame = (this._circuitFrame || 0) + 1;
      if (this._circuitFrame % 5 === 1) {
        const cam = this.cameras.main;
        const z = cam.zoom;
        const ow = 1280 * z, oh = 720 * z;

        this.circuitOverlay.clear();
        this.circuitOverlay.fillStyle(0x000000, 0.8);
        this.circuitOverlay.fillRect(0, 0, ow, oh);

        const localP = state.players.get(this.localSessionId);
        if (localP) {
          const { x, y } = worldToScreen(localP.x, localP.y);
          const worldX = x + this.camOX;
          const worldY = y + this.camOY;
          const px = (worldX - cam.scrollX) * z * z;
          const py = (worldY - cam.scrollY) * z * z;
          // Just 3 gradient steps instead of many
          const holeR = 140 * z;
          this.circuitOverlay.fillStyle(0x080816, 0.9);
          this.circuitOverlay.fillCircle(px, py, holeR);
          this.circuitOverlay.fillStyle(0x080816, 0.6);
          this.circuitOverlay.fillCircle(px, py, holeR * 0.7);
          this.circuitOverlay.fillStyle(0x080816, 0.3);
          this.circuitOverlay.fillCircle(px, py, holeR * 0.4);
        }
      }
      this.circuitOverlay.alpha += (1 - this.circuitOverlay.alpha) * 0.05;
    } else {
      if (this.circuitOverlay.alpha > 0.01) {
        this.circuitOverlay.alpha += (0 - this.circuitOverlay.alpha) * 0.08;
      } else {
        this.circuitOverlay.alpha = 0;
      }
    }

    // Overheat: red pulsing border
    if (hasOverheat) {
      const pulse = 0.5 + Math.sin(this.time.now * 0.008) * 0.5;
      this.overheatBorder.setAlpha(pulse);
      this.overheatText.setText(`${t_emergency('overheat')}: ${overheatTime}s`);
      this.overheatText.setAlpha(1);
    } else {
      this.overheatBorder.alpha += (0 - this.overheatBorder.alpha) * 0.08;
      this.overheatText.alpha += (0 - this.overheatText.alpha) * 0.08;
    }
  }

  // ----------------------------------------------------------
  //  Interaction Prompt (floating key hint near items/machines)
  // ----------------------------------------------------------
  _updateInteractPrompt() {
    const prompt = this._interactPrompt;
    if (!prompt || !this.room) { return; }

    const localPlayer = this.room.state.players.get(this.localSessionId);
    if (!localPlayer) { prompt.setVisible(false); return; }

    const px = localPlayer.x;
    const py = localPlayer.y;
    const INTERACT_RANGE = 1.8;
    let closest = null;
    let closestDist = INTERACT_RANGE;
    let promptText = '';

    // Check machines (repair with R) — always check, even when carrying
    this.room.state.machines.forEach((machine) => {
      if (machine.status !== 'broken') return;
      const dx = machine.x + 0.5 - px, dy = machine.y + 0.5 - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = { x: machine.x + 0.5, y: machine.y + 0.5 };
        promptText = `[${t('hud_hold_r')}] ${t('hud_repair')}`;
      }
    });

    // Check items (pickup with E) — only when not carrying
    if (!localPlayer.carryingItemId) {
      this.room.state.items.forEach((item) => {
        if (item.carried) return;
        const dx = item.x - px, dy = item.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = { x: item.x, y: item.y };
          promptText = `[E] ${t_item(item.itemType)}`;
        }
      });
    }

    // If carrying and no machine nearby, show drop hint using predicted position
    if (localPlayer.carryingItemId && !closest) {
      const predX = this._predX || px;
      const predY = this._predY || py;
      const pos = worldToScreen(predX, predY);
      const screenX = pos.x + this.camOX;
      const screenY = pos.y + this.camOY - 70;
      prompt.setPosition(screenX, screenY);
      prompt.setText(`[E] ${t('hud_drop')}`);
      prompt.setVisible(true);
      prompt.y += Math.sin(this.time.now * 0.005) * 3;
      return;
    }

    if (closest) {
      const { x, y } = worldToScreen(closest.x, closest.y);
      const sx = x + this.camOX;
      const sy = y + this.camOY - 55;
      prompt.setPosition(sx, sy);
      prompt.setText(promptText);
      prompt.setVisible(true);
      prompt.y += Math.sin(this.time.now * 0.005) * 3;
    } else {
      prompt.setVisible(false);
    }
  }
}

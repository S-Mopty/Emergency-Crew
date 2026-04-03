// ============================================================
//  Emergency Crew - GameScene
//  Isometric rendering + camera follow + minimap
//  Merged: map 30x24 from version_Arthur + local UI/flow
// ============================================================

const TILE_W = 64;
const TILE_H = 32;
const MAP_W  = 30;
const MAP_H  = 24;

const ASSET_SCALE    = 0.3;
const ASSET_ORIGIN_Y = 0.875;
const CAMERA_ZOOM    = 1.6;

const PLAYER_COLORS     = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12];
const PLAYER_COLORS_HEX = ['#3498db','#e74c3c','#2ecc71','#f39c12'];
const PLAYER_NAMES      = ['Bleu', 'Rouge', 'Vert', 'Orange'];

const ITEM_LABELS    = { welding_kit:'Kit Soudure', fuse:'Fusible', coolant:'Refrigerant' };
const MACHINE_LABELS = { gas_leak:'Vanne Gaz', short_circuit:'Disjoncteur', overheat:'Refroidisseur' };
const MACHINE_NEEDS  = { gas_leak:'Kit Soudure', short_circuit:'Fusible', overheat:'Refrigerant' };
const EMERGENCY_LABELS = { gas_leak:'FUITE DE GAZ', short_circuit:'COURT-CIRCUIT', overheat:'SURCHAUFFE' };

// 30x24 map from version_Arthur
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

// Tile rendering: map tile type → asset key
const TILE_KEYS = { 0:null, 1:'tile_dirt', 2:'tile_planks', 3:'tile_dirt', 4:'tile_planks', 5:'tile_planks' };
// Tint per tile type for visual variety
const TILE_TINTS = { 1:0xffffff, 2:0xffffff, 3:0xddddee, 4:0xeeeeff, 5:0xffdddd };

// 9 room labels
const ROOM_LABELS = [
  { text:'STOCKAGE',     col:4,    row:2.5, color:'#ffd93d' },
  { text:'COMMANDEMENT', col:14.5, row:2.5, color:'#74b9ff' },
  { text:'REACTEUR',     col:26,   row:2.5, color:'#ff6b6b' },
  { text:'HUB CENTRAL',  col:14.5, row:12,  color:'#74b9ff' },
  { text:'INFIRMERIE',   col:3.5,  row:12,  color:'#a29bfe' },
  { text:'ELECTRIQUE',   col:26,   row:12,  color:'#fdcb6e' },
  { text:'ARMURERIE',    col:3.5,  row:20,  color:'#e17055' },
  { text:'MACHINES',     col:14.5, row:20,  color:'#ff7675' },
  { text:'SURVIE',       col:25.5, row:20,  color:'#00cec9' },
];

const DECORATIONS = [
  { key:'deco_corn',  col:1,  row:1 },  { key:'deco_corn',  col:7,  row:1 },
  { key:'deco_fence', col:12, row:1 },  { key:'deco_fence', col:17, row:1 },
  { key:'deco_fence', col:23, row:1 },  { key:'deco_fence', col:28, row:1 },
  { key:'deco_hay',   col:1,  row:4 },  { key:'deco_hay',   col:28, row:4 },
  { key:'deco_fence', col:4,  row:8 },  { key:'deco_fence', col:25, row:8 },
  { key:'deco_ladder',col:7,  row:11 }, { key:'deco_wall',  col:22, row:11 },
  { key:'deco_hay',   col:1,  row:14 }, { key:'deco_hay',   col:28, row:14 },
  { key:'deco_fence', col:4,  row:16 }, { key:'deco_fence', col:25, row:16 },
  { key:'deco_corn',  col:1,  row:18 }, { key:'deco_corn',  col:7,  row:18 },
  { key:'deco_ladder',col:10, row:18 }, { key:'deco_wall',  col:19, row:18 },
  { key:'deco_hay',   col:23, row:18 }, { key:'deco_hay',   col:28, row:22 },
];

const MACHINE_TEXTURES = { gas_leak:'machine_gas_valve', short_circuit:'machine_circuit_breaker', overheat:'machine_cooling_unit' };
const ITEM_TEXTURES    = { welding_kit:'item_welding_kit', fuse:'item_fuse', coolant:'item_coolant' };

function worldToScreen(wx, wy) {
  return { x: (wx - wy) * (TILE_W / 2), y: (wx + wy) * (TILE_H / 2) };
}

// Minimap colors per tile type
const MM_COLORS = { 0:'#0f0f23', 1:'#2a2a4a', 2:'#3a3a6a', 3:'#252545', 4:'#35355a', 5:'#4a2a2a' };

// ============================================================
export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.room = data.room || null;
    this.playerSprites = {}; this.machineSprites = {}; this.itemSprites = {};
    this.powerUpSprites = {};
    this.localSessionId = this.room ? this.room.sessionId : null;
    this._minimapDrawn = false;
  }

  preload() {
    const base = '/assets/Isometric/';
    this.load.image('tile_dirt',   base+'dirt_S.png');
    this.load.image('tile_planks', base+'planks_S.png');
    this.load.image('deco_fence',  base+'fenceHigh_S.png');
    this.load.image('deco_corn',   base+'corn_S.png');
    this.load.image('deco_hay',    base+'hayBales_S.png');
    this.load.image('deco_ladder', base+'ladderStand_S.png');
    this.load.image('deco_wall',   base+'woodWall_S.png');
    this.load.image('machine_gas_valve',      base+'woodWallWindow_S.png');
    this.load.image('machine_circuit_breaker', base+'woodWallDoorClosed_S.png');
    this.load.image('machine_cooling_unit',    base+'chimneyBase_S.png');
    this.load.image('item_welding_kit', base+'sacksCrate_S.png');
    this.load.image('item_fuse',        base+'sack_S.png');
    this.load.image('item_coolant',     base+'hayBalesStacked_S.png');
  }

  create() {
    // World offset
    this.camOX = (MAP_W + MAP_H) * (TILE_W / 4);
    this.camOY = 80;

    this._genPlayerTextures();
    this._drawFloor();
    this._drawDecorations();
    this._drawRoomLabels();
    this._setupInput();
    this._setupEmoteInput();
    this._createEffectLayers();
    this._drawMinimapBase();

    // Camera follow setup
    this._cameraTarget = this.add.rectangle(0, 0, 1, 1, 0x000000, 0);
    this.cameras.main.startFollow(this._cameraTarget, true, 0.08, 0.08);
    this.cameras.main.setZoom(CAMERA_ZOOM);

    if (this.room) this._setupRoomListeners();
  }

  // ----------------------------------------------------------
  //  Player Textures (4 types × 4 colors = 16 textures)
  //  Type 0: Ouvrier  - casque jaune, combinaison, cle a molette
  //  Type 1: Ingenieur - lunettes, blouse longue, clipboard
  //  Type 2: Technicien - casque lourd, gilet, ceinture outils
  //  Type 3: Chef - cravate, cheveux, dossier
  // ----------------------------------------------------------
  _genPlayerTextures() {
    const w = 48, h = 72;

    for (let t = 0; t < 5; t++) {
      PLAYER_COLORS.forEach((color, ci) => {
        const key = `player_${ci}_${t}`;
        if (this.textures.exists(key)) return;
        const g = this.make.graphics({ add: false });

        // Shadow
        g.fillStyle(0x000000, 0.3); g.fillEllipse(w/2, h-4, 32, 14);

        if (t === 0) this._drawWorker(g, w, h, color);
        else if (t === 1) this._drawEngineer(g, w, h, color);
        else if (t === 2) this._drawTechnician(g, w, h, color);
        else if (t === 3) this._drawBoss(g, w, h, color);
        else this._drawSecret(g, w, h, color);

        g.generateTexture(key, w, h); g.destroy();
      });
    }

  }

  // Type 0: Ouvrier - hard hat, overalls, wrench
  _drawWorker(g, w, h, color) {
    // Boots
    g.fillStyle(0x2d3436);
    g.fillRoundedRect(w/2-10, h-16, 8, 12, 2); g.fillRoundedRect(w/2+2, h-16, 8, 12, 2);
    // Legs
    g.fillStyle(0x636e72); g.fillRect(w/2-8, h-28, 6, 14); g.fillRect(w/2+2, h-28, 6, 14);
    // Body (diamond)
    g.fillStyle(color);
    g.beginPath(); g.moveTo(w/2,18); g.lineTo(w-6,h*0.42); g.lineTo(w/2,h-26); g.lineTo(6,h*0.42); g.closePath(); g.fillPath();
    g.lineStyle(2, 0xffffff, 0.3); g.strokePath();
    // Belt
    g.fillStyle(0x2d3436); g.fillRect(w/2-14, h-30, 28, 4);
    // Head
    g.fillStyle(0xffeaa7); g.fillCircle(w/2, 16, 9);
    // Hard hat (yellow)
    g.fillStyle(0xf1c40f); g.fillRoundedRect(w/2-11, 5, 22, 10, 3); g.fillRect(w/2-13, 12, 26, 3);
    // Eyes
    g.fillStyle(0x2d3436); g.fillCircle(w/2-3, 16, 1.5); g.fillCircle(w/2+3, 16, 1.5);
    // Wrench on belt
    g.fillStyle(0x95a5a6); g.fillRect(w-10, h*0.42, 3, 12);
  }

  // Type 1: Ingenieur - glasses, long coat, clipboard
  _drawEngineer(g, w, h, color) {
    // Shoes (brown)
    g.fillStyle(0x795548);
    g.fillRoundedRect(w/2-9, h-14, 7, 10, 2); g.fillRoundedRect(w/2+2, h-14, 7, 10, 2);
    // Legs (dark pants)
    g.fillStyle(0x2d3436); g.fillRect(w/2-7, h-26, 5, 14); g.fillRect(w/2+2, h-26, 5, 14);
    // Long coat body (wider, goes lower)
    g.fillStyle(0xecf0f1);
    g.beginPath(); g.moveTo(w/2,20); g.lineTo(w-4,h*0.40); g.lineTo(w-6,h-22); g.lineTo(6,h-22); g.lineTo(4,h*0.40); g.closePath(); g.fillPath();
    // Color accent stripe
    g.fillStyle(color); g.fillRect(w/2-2, 22, 4, h*0.42-22);
    // Coat border
    g.lineStyle(1, 0xbdc3c7, 0.5);
    g.beginPath(); g.moveTo(w/2,20); g.lineTo(w-4,h*0.40); g.lineTo(w-6,h-22); g.lineTo(6,h-22); g.lineTo(4,h*0.40); g.closePath(); g.strokePath();
    // Head
    g.fillStyle(0xffeaa7); g.fillCircle(w/2, 16, 9);
    // Hair (brown, side part)
    g.fillStyle(0x6d4c41); g.fillRoundedRect(w/2-10, 5, 20, 8, 4);
    // Glasses
    g.lineStyle(2, 0x2d3436, 0.8);
    g.strokeCircle(w/2-4, 15, 4); g.strokeCircle(w/2+4, 15, 4);
    g.lineBetween(w/2-0.5, 15, w/2+0.5, 15);
    // Eyes behind glasses
    g.fillStyle(0x2d3436); g.fillCircle(w/2-4, 15, 1); g.fillCircle(w/2+4, 15, 1);
    // Clipboard
    g.fillStyle(0x795548); g.fillRect(2, h*0.38, 8, 12);
    g.fillStyle(0xecf0f1); g.fillRect(3, h*0.38+1, 6, 10);
  }

  // Type 2: Technicien - heavy helmet, vest, tool belt
  _drawTechnician(g, w, h, color) {
    // Heavy boots
    g.fillStyle(0x1a1a2e);
    g.fillRoundedRect(w/2-11, h-18, 9, 14, 2); g.fillRoundedRect(w/2+2, h-18, 9, 14, 2);
    // Legs (cargo pants)
    g.fillStyle(0x4a4a5a); g.fillRect(w/2-9, h-30, 7, 14); g.fillRect(w/2+2, h-30, 7, 14);
    // Cargo pockets
    g.fillStyle(0x3a3a4a); g.fillRect(w/2-9, h-24, 4, 5); g.fillRect(w/2+5, h-24, 4, 5);
    // Bulky vest body
    g.fillStyle(color);
    g.beginPath(); g.moveTo(w/2,16); g.lineTo(w-3,h*0.40); g.lineTo(w-5,h-28); g.lineTo(5,h-28); g.lineTo(3,h*0.40); g.closePath(); g.fillPath();
    // Vest outline
    g.lineStyle(2, 0xffffff, 0.2); g.strokePath();
    // Reflective strips
    g.fillStyle(0xf1c40f); g.fillRect(6, h*0.36, w-12, 3); g.fillRect(6, h*0.36+8, w-12, 3);
    // Heavy tool belt
    g.fillStyle(0x2d3436); g.fillRect(w/2-16, h-32, 32, 5);
    // Tool pouches
    g.fillStyle(0x636e72); g.fillRect(w/2-16, h-32, 6, 8); g.fillRect(w/2+10, h-32, 6, 8);
    // Head
    g.fillStyle(0xffeaa7); g.fillCircle(w/2, 14, 9);
    // Heavy helmet (orange)
    g.fillStyle(0xe67e22); g.fillRoundedRect(w/2-12, 2, 24, 12, 4);
    g.fillRect(w/2-14, 10, 28, 4);
    // Visor
    g.fillStyle(0x2980b9); g.fillRoundedRect(w/2-8, 6, 16, 5, 2);
    // Eyes
    g.fillStyle(0x2d3436); g.fillCircle(w/2-3, 15, 1.5); g.fillCircle(w/2+3, 15, 1.5);
  }

  // Type 4: AGENT SECRET - dark armor, glowing visor, energy aura
  _drawSecret(g, w, h, color) {
    // Shadow (larger, glowing)
    g.fillStyle(color, 0.15); g.fillEllipse(w/2, h-3, 36, 16);
    // Armored boots
    g.fillStyle(0x1a1a2e);
    g.fillRoundedRect(w/2-11, h-18, 9, 14, 3); g.fillRoundedRect(w/2+2, h-18, 9, 14, 3);
    // Energy lines on boots
    g.fillStyle(color); g.fillRect(w/2-8, h-10, 3, 6); g.fillRect(w/2+5, h-10, 3, 6);
    // Armored legs
    g.fillStyle(0x1a1a2e); g.fillRect(w/2-9, h-30, 7, 14); g.fillRect(w/2+2, h-30, 7, 14);
    // Body armor (angular, aggressive)
    g.fillStyle(0x0d0d1a);
    g.beginPath(); g.moveTo(w/2,14); g.lineTo(w-2,h*0.38); g.lineTo(w-4,h-28); g.lineTo(4,h-28); g.lineTo(2,h*0.38); g.closePath(); g.fillPath();
    // Armor plates
    g.lineStyle(1, color, 0.6);
    g.lineBetween(w/2, 16, w/2, h-30);
    g.lineBetween(6, h*0.38, w-6, h*0.38);
    // Shoulder pads
    g.fillStyle(0x1a1a2e);
    g.fillRoundedRect(1, h*0.32, 10, 8, 3); g.fillRoundedRect(w-11, h*0.32, 10, 8, 3);
    g.fillStyle(color);
    g.fillRect(3, h*0.32+2, 6, 2); g.fillRect(w-9, h*0.32+2, 6, 2);
    // Energy core on chest
    g.fillStyle(color); g.fillCircle(w/2, h*0.38-2, 4);
    g.fillStyle(0xffffff, 0.5); g.fillCircle(w/2, h*0.38-2, 2);
    // Helmet
    g.fillStyle(0x0d0d1a);
    g.fillRoundedRect(w/2-12, 3, 24, 18, 6);
    // Visor (glowing)
    g.fillStyle(color);
    g.fillRoundedRect(w/2-9, 10, 18, 6, 3);
    g.fillStyle(0xffffff, 0.4);
    g.fillRoundedRect(w/2-7, 11, 14, 3, 2);
    // Antenna
    g.fillStyle(color); g.fillRect(w/2+8, 2, 2, 8);
    g.fillCircle(w/2+9, 2, 2);
    // Arm weapon
    g.fillStyle(0x2d2d4e); g.fillRect(w-8, h*0.38, 6, 16);
    g.fillStyle(color); g.fillRect(w-7, h*0.38+14, 4, 4);
  }

  // Type 3: Chef - tie, hair, folder
  _drawBoss(g, w, h, color) {
    // Dress shoes
    g.fillStyle(0x1a1a1a);
    g.fillRoundedRect(w/2-9, h-14, 7, 10, 2); g.fillRoundedRect(w/2+2, h-14, 7, 10, 2);
    // Suit pants
    g.fillStyle(0x2c3e50); g.fillRect(w/2-7, h-26, 5, 14); g.fillRect(w/2+2, h-26, 5, 14);
    // Suit jacket body
    g.fillStyle(0x2c3e50);
    g.beginPath(); g.moveTo(w/2,20); g.lineTo(w-5,h*0.40); g.lineTo(w-6,h-24); g.lineTo(6,h-24); g.lineTo(5,h*0.40); g.closePath(); g.fillPath();
    // Jacket lapels
    g.fillStyle(color);
    g.beginPath(); g.moveTo(w/2,20); g.lineTo(w/2+6,h*0.35); g.lineTo(w/2+2,h*0.42); g.lineTo(w/2-2,h*0.42); g.lineTo(w/2-6,h*0.35); g.closePath(); g.fillPath();
    // Shirt & tie
    g.fillStyle(0xecf0f1); g.fillRect(w/2-3, 20, 6, h*0.42-20);
    g.fillStyle(0xe74c3c); g.fillRect(w/2-1.5, 22, 3, h*0.42-24);
    // Jacket outline
    g.lineStyle(1, 0x1a252f, 0.5);
    g.beginPath(); g.moveTo(w/2,20); g.lineTo(w-5,h*0.40); g.lineTo(w-6,h-24); g.lineTo(6,h-24); g.lineTo(5,h*0.40); g.closePath(); g.strokePath();
    // Head
    g.fillStyle(0xffeaa7); g.fillCircle(w/2, 16, 9);
    // Styled hair
    g.fillStyle(0x2d3436);
    g.beginPath(); g.moveTo(w/2-9, 14); g.lineTo(w/2-7, 5); g.lineTo(w/2+8, 5); g.lineTo(w/2+10, 10); g.lineTo(w/2+7, 8); g.closePath(); g.fillPath();
    // Eyes
    g.fillStyle(0x2d3436); g.fillCircle(w/2-3, 16, 1.5); g.fillCircle(w/2+3, 16, 1.5);
    // Confident smile
    g.lineStyle(1, 0x2d3436, 0.6);
    g.beginPath(); g.arc(w/2, 19, 3, 0.2, Math.PI-0.2); g.strokePath();
    // Folder/clipboard
    g.fillStyle(color); g.fillRoundedRect(w-12, h*0.36, 10, 14, 2);
    g.fillStyle(0xecf0f1); g.fillRect(w-11, h*0.36+2, 8, 2);
    g.fillRect(w-11, h*0.36+5, 6, 1); g.fillRect(w-11, h*0.36+7, 7, 1);
  }

  // ----------------------------------------------------------
  //  World Drawing
  // ----------------------------------------------------------
  _placeAsset(key, col, row, depthVal) {
    const { x, y } = worldToScreen(col, row);
    const sx = x + this.camOX, sy = y + this.camOY;
    const sprite = this.add.image(sx, sy, key);
    sprite.setScale(ASSET_SCALE).setOrigin(0.5, ASSET_ORIGIN_Y).setDepth(depthVal ?? sy);
    return sprite;
  }

  _drawFloor() {
    for (let r = 0; r < MAP_H; r++)
      for (let c = 0; c < MAP_W; c++) {
        const t = MAP_TILES[r][c]; if (!t) continue;
        const key = TILE_KEYS[t]; if (!key) continue;
        const s = this._placeAsset(key, c, r, -1);
        const tint = TILE_TINTS[t]; if (tint && tint !== 0xffffff) s.setTint(tint);
      }
  }

  _drawDecorations() {
    for (const d of DECORATIONS) {
      const sy = worldToScreen(d.col, d.row).y + this.camOY;
      this._placeAsset(d.key, d.col, d.row, sy);
    }
  }

  _drawRoomLabels() {
    for (const l of ROOM_LABELS) {
      const { x, y } = worldToScreen(l.col, l.row);
      this.add.text(x + this.camOX, y + this.camOY - 10, l.text, {
        fontSize: '13px', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
        color: l.color, stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(0).setAlpha(0.7);
    }
  }

  // ----------------------------------------------------------
  //  Effects
  // ----------------------------------------------------------
  _createEffectLayers() {
    const W = 3000, H = 2000; // large enough for scrolled view
    this.gasOverlay = this.add.graphics().setDepth(9000).setAlpha(0);
    this.gasOverlay.fillStyle(0x88cc00, 0.2); this.gasOverlay.fillRect(-W/2,-H/2,W*2,H*2);

    this.circuitOverlay = this.add.graphics().setDepth(9001).setAlpha(0);
    this.circuitOverlay.fillStyle(0x000000, 0.75); this.circuitOverlay.fillRect(-W/2,-H/2,W*2,H*2);

    this.overheatBorder = this.add.graphics().setDepth(9002).setAlpha(0).setScrollFactor(0);
    this.overheatBorder.lineStyle(10, 0xff0000, 0.8); this.overheatBorder.strokeRect(5,5,1910,1070);

    this.overheatText = this.add.text(960, 100, '', {
      fontSize:'28px', fontFamily:'Inter, sans-serif', fontStyle:'bold',
      color:'#ff0000', stroke:'#000', strokeThickness:4,
    }).setOrigin(0.5).setDepth(9003).setAlpha(0).setScrollFactor(0);
  }

  // ----------------------------------------------------------
  //  Input (ZQSD + Arrows, F=dash, Shift=sprint)
  // ----------------------------------------------------------
  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.moveKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.moveKeysAlt = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.Z, left: Phaser.Input.Keyboard.KeyCodes.Q,
    });
    this.dashKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.sprintKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.pickupKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.repairKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.laserKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.nukeKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.freezeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);
    this.teleportKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
  }

  // ----------------------------------------------------------
  //  Colyseus Listeners
  // ----------------------------------------------------------
  _setupRoomListeners() {
    const room = this.room;
    room.state.players.onAdd((p, sid) => this._addPlayer(p, sid));
    room.state.players.onRemove((_, sid) => this._removePlayer(sid));
    room.state.machines.onAdd((m, mid) => this._addMachine(m, mid));
    room.state.machines.onRemove((_, mid) => this._removeMachine(mid));
    room.state.items.onAdd((it, iid) => this._addItem(it, iid));
    room.state.items.onRemove((_, iid) => this._removeItem(iid));

    room.onMessage('game_over', (data) => {
      if (window.screenManager) window.screenManager.showEndScreen({
        reason:data.reason, winner:data.winner, scores:data.scores, stability:room.state.stability,
      });
    });
    room.onMessage('emergency_spawn', (data) => {
      if (window.screenManager) window.screenManager.showEmergencyToast(data.type);
    });
    room.onMessage('repair_complete', (data) => this._showRepairEffect(data));
    room.onMessage('laser_fired', (data) => this._showLaserBeam(data));
    room.onMessage('game_event', (data) => {
      if (window.screenManager) window.screenManager.addKillFeedEntry(data);
    });
    room.onMessage('shockwave', (data) => this._showShockwave(data));
    room.onMessage('nuke_explode', (data) => this._showNuke(data));
    room.onMessage('freeze_blast', (data) => this._showFreeze(data));

    // Power-ups
    room.state.powerUps.onAdd((pu, id) => this._addPowerUp(pu, id));
    room.state.powerUps.onRemove((_, id) => this._removePowerUp(id));

    room.onLeave(() => { this.room = null; if (window.screenManager) window.screenManager.showDisconnect(); });
  }

  // ----------------------------------------------------------
  //  Players
  // ----------------------------------------------------------
  _addPlayer(player, sid) {
    const isLocal = sid === this.localSessionId;
    const ci = player.color ?? 0;
    const ct = player.characterType ?? 0;
    const sprite = this.add.image(0, 0, `player_${ci}_${ct}`).setOrigin(0.5, 0.9);
    // Update sprite on characterType change
    player.listen('characterType', (val) => {
      const texKey = `player_${player.color ?? 0}_${val ?? 0}`;
      if (this.textures.exists(texKey)) sprite.setTexture(texKey);
    });
    const name = isLocal ? 'VOUS' : (player.nickname || PLAYER_NAMES[ci]);
    const label = this.add.text(0, 0, name, {
      fontSize:'14px', fontFamily:'Inter, sans-serif', fontStyle:'bold',
      color: isLocal ? '#2ecc71' : '#fff', stroke:'#000', strokeThickness:3,
    }).setOrigin(0.5, 1);
    if (!isLocal) player.listen('nickname', v => label.setText(v || PLAYER_NAMES[ci]));

    const HAT_I = ['','\u26D1\uFE0F','\uD83D\uDC51','\uD83C\uDF89'];
    const ACC_I = ['','\uD83D\uDD27','\uD83D\uDC53','\uD83E\uDDE3'];
    const hatIcon = this.add.text(0,0, HAT_I[player.hat]||'', {fontSize:'16px'}).setOrigin(0.5,1);
    const accIcon = this.add.text(0,0, ACC_I[player.accessory]||'', {fontSize:'14px'}).setOrigin(0.5,1);
    player.listen('hat', v => hatIcon.setText(HAT_I[v]||''));
    player.listen('accessory', v => accIcon.setText(ACC_I[v]||''));

    const carryIcon = this.add.text(0,0,'', {
      fontSize:'13px', fontFamily:'Inter, sans-serif', fontStyle:'bold',
      color:'#ffd93d', stroke:'#000', strokeThickness:3,
      backgroundColor:'#000000aa', padding:{x:6,y:3},
    }).setOrigin(0.5,1);
    const repairBarBg = this.add.graphics().setVisible(false);
    const repairBarFill = this.add.graphics().setVisible(false);
    const stars = this.add.text(0,0,'* * *', {
      fontSize:'14px', fontFamily:'Courier New', fontStyle:'bold',
      color:'#ffd93d', stroke:'#000', strokeThickness:3,
    }).setOrigin(0.5,1).setVisible(false);

    this.playerSprites[sid] = {
      sprite, label, carryIcon, player, stars, hatIcon, accIcon,
      repairBarBg, repairBarFill,
      lerpX: player.x, lerpY: player.y, // for smooth rendering
    };
  }

  _removePlayer(sid) {
    const d = this.playerSprites[sid]; if (!d) return;
    d.sprite.destroy(); d.label.destroy(); d.carryIcon.destroy();
    d.stars.destroy(); d.repairBarBg.destroy(); d.repairBarFill.destroy();
    if (d.hatIcon) d.hatIcon.destroy();
    if (d.accIcon) d.accIcon.destroy();
    delete this.playerSprites[sid];
  }

  // ----------------------------------------------------------
  //  Machines
  // ----------------------------------------------------------
  _addMachine(machine, mid) {
    const texKey = MACHINE_TEXTURES[machine.machineType] || 'machine_gas_valve';
    const { x, y } = worldToScreen(machine.x, machine.y);
    const sx = x + this.camOX, sy = y + this.camOY;
    const sprite = this.add.image(sx, sy, texKey).setScale(ASSET_SCALE*1.3).setOrigin(0.5,ASSET_ORIGIN_Y).setDepth(sy);
    const glow = this.add.graphics().setDepth(sy-0.5);
    const nameLabel = this.add.text(sx, sy-75, MACHINE_LABELS[machine.machineType]||'', {
      fontSize:'13px', fontFamily:'Inter, sans-serif', fontStyle:'bold', color:'#fff', stroke:'#000', strokeThickness:3,
    }).setOrigin(0.5).setDepth(sy+0.1);
    const statusText = this.add.text(sx, sy-58, '', {
      fontSize:'12px', fontFamily:'Inter, sans-serif', fontStyle:'bold', color:'#2ecc71', stroke:'#000', strokeThickness:3,
    }).setOrigin(0.5).setDepth(sy+0.2);
    const needText = this.add.text(sx, sy-42, '', {
      fontSize:'12px', fontFamily:'Inter, sans-serif', fontStyle:'bold', color:'#ffd93d', stroke:'#000', strokeThickness:3,
      backgroundColor:'#000000aa', padding:{x:6,y:3},
    }).setOrigin(0.5).setDepth(sy+0.25).setVisible(false);
    const repairBarBg = this.add.graphics().setDepth(sy+0.3).setVisible(false);
    const repairBarFill = this.add.graphics().setDepth(sy+0.4).setVisible(false);
    this.machineSprites[mid] = { sprite, glow, nameLabel, statusText, needText, machine, repairBarBg, repairBarFill, sx, sy };
  }

  _removeMachine(mid) {
    const d = this.machineSprites[mid]; if (!d) return;
    d.sprite.destroy(); d.glow.destroy(); d.nameLabel.destroy();
    d.statusText.destroy(); d.needText.destroy(); d.repairBarBg.destroy(); d.repairBarFill.destroy();
    delete this.machineSprites[mid];
  }

  // ----------------------------------------------------------
  //  Items
  // ----------------------------------------------------------
  _addItem(item, iid) {
    const texKey = ITEM_TEXTURES[item.itemType]||'item_welding_kit';
    const sprite = this.add.image(0,0,texKey).setScale(ASSET_SCALE*0.9).setOrigin(0.5,ASSET_ORIGIN_Y);
    const label = this.add.text(0,0,ITEM_LABELS[item.itemType]||item.itemType, {
      fontSize:'12px', fontFamily:'Inter, sans-serif', fontStyle:'bold',
      color:'#ffd93d', stroke:'#000', strokeThickness:3,
      backgroundColor:'#000000aa', padding:{x:4,y:2},
    }).setOrigin(0.5,0);
    this.itemSprites[iid] = { sprite, label, item };
  }

  _removeItem(iid) {
    const d = this.itemSprites[iid]; if (!d) return;
    d.sprite.destroy(); d.label.destroy(); delete this.itemSprites[iid];
  }

  // ----------------------------------------------------------
  //  Effects
  // ----------------------------------------------------------
  _showRepairEffect(data) {
    const pd = this.playerSprites[data.playerId]; if (!pd) return;
    const { x, y } = worldToScreen(pd.player.x, pd.player.y);
    const sx = x + this.camOX, sy = y + this.camOY;
    const txt = this.add.text(sx, sy-70, `+${data.points}`, {
      fontSize:'28px', fontFamily:'Inter, sans-serif', fontStyle:'900',
      color:'#2ecc71', stroke:'#000', strokeThickness:4,
    }).setOrigin(0.5).setDepth(9998);
    this.tweens.add({ targets:txt, y:sy-130, alpha:0, duration:1500, ease:'Cubic.easeOut', onComplete:()=>txt.destroy() });
  }

  _showDashEffect(sx, sy, dx, dy) {
    for (let i = 0; i < 5; i++) {
      const line = this.add.graphics().setDepth(9500);
      const ox = -dx*(15+i*8)+(Math.random()-0.5)*12;
      const oy = -dy*(8+i*4)+(Math.random()-0.5)*8;
      line.lineStyle(2,0xffffff,0.6); line.lineBetween(sx+ox,sy+oy-20,sx+ox-dx*20,sy+oy-dy*10-20);
      this.tweens.add({ targets:line, alpha:0, duration:300, delay:i*30, onComplete:()=>line.destroy() });
    }
  }

  _showLaserBeam(data) {
    const { fromX, fromY, dx, dy, range } = data;
    const start = worldToScreen(fromX, fromY);
    const endX = fromX + dx * range, endY = fromY + dy * range;
    const end = worldToScreen(endX, endY);
    const sx = start.x + this.camOX, sy = start.y + this.camOY - 25;
    const ex = end.x + this.camOX, ey = end.y + this.camOY - 25;

    const pd = this.playerSprites[data.playerId];
    const color = pd ? PLAYER_COLORS[pd.player.color ?? 0] : 0xff0000;

    // === SCREEN FLASH (white then colored) ===
    const screenFlash = this.add.graphics().setDepth(9999).setScrollFactor(0);
    screenFlash.fillStyle(0xffffff, 0.4); screenFlash.fillRect(0, 0, 1920, 1080);
    this.tweens.add({ targets: screenFlash, alpha: 0, duration: 300, onComplete: () => screenFlash.destroy() });

    // === MASSIVE SCREEN SHAKE ===
    this.cameras.main.shake(400, 0.012);

    // === OUTER GLOW (huge, soft) ===
    const glow = this.add.graphics().setDepth(9598);
    glow.lineStyle(40, color, 0.15); glow.lineBetween(sx, sy, ex, ey);
    glow.lineStyle(28, color, 0.25); glow.lineBetween(sx, sy, ex, ey);

    // === MAIN BEAM (thick colored) ===
    const beam = this.add.graphics().setDepth(9600);
    beam.lineStyle(14, color, 0.9); beam.lineBetween(sx, sy, ex, ey);
    // Inner bright core
    beam.lineStyle(6, 0xffffff, 0.9); beam.lineBetween(sx, sy, ex, ey);
    // Extra thin white center
    beam.lineStyle(2, 0xffffff, 1); beam.lineBetween(sx, sy, ex, ey);

    // === MUZZLE FLASH (big burst at shooter) ===
    const muzzle = this.add.graphics().setDepth(9601);
    muzzle.fillStyle(0xffffff, 0.9); muzzle.fillCircle(sx, sy, 24);
    muzzle.fillStyle(color, 0.6); muzzle.fillCircle(sx, sy, 36);
    // Muzzle rays
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 / 8) * i;
      const rx = Math.cos(a) * 30, ry = Math.sin(a) * 30;
      muzzle.lineStyle(3, 0xffffff, 0.7); muzzle.lineBetween(sx, sy, sx + rx, sy + ry);
    }

    // === IMPACT EXPLOSION (big burst at end) ===
    const impact = this.add.graphics().setDepth(9601);
    impact.fillStyle(color, 0.7); impact.fillCircle(ex, ey, 30);
    impact.fillStyle(0xffffff, 0.5); impact.fillCircle(ex, ey, 16);
    // Impact ring
    impact.lineStyle(4, 0xffffff, 0.6); impact.strokeCircle(ex, ey, 40);

    // === SPARKS along beam (lots of particles) ===
    for (let i = 0; i < 20; i++) {
      const t = Math.random();
      const px = sx + (ex - sx) * t + (Math.random() - 0.5) * 20;
      const py = sy + (ey - sy) * t + (Math.random() - 0.5) * 20;
      const spark = this.add.graphics().setDepth(9602);
      const sparkColor = Math.random() > 0.5 ? color : 0xffffff;
      const size = 2 + Math.random() * 4;
      spark.fillStyle(sparkColor, 0.9); spark.fillCircle(px, py, size);
      this.tweens.add({
        targets: spark,
        x: (Math.random() - 0.5) * 60,
        y: -30 - Math.random() * 40,
        alpha: 0, duration: 500 + Math.random() * 400,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy(),
      });
    }

    // === IMPACT SPARKS at end point ===
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 / 12) * i + Math.random() * 0.3;
      const dist = 20 + Math.random() * 30;
      const impSpark = this.add.graphics().setDepth(9603);
      impSpark.fillStyle(color); impSpark.fillCircle(ex, ey, 3);
      this.tweens.add({
        targets: impSpark,
        x: Math.cos(a) * dist, y: Math.sin(a) * dist,
        alpha: 0, duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => impSpark.destroy(),
      });
    }

    // === BEAM TEXT "LASER" floating ===
    const laserText = this.add.text((sx + ex) / 2, (sy + ey) / 2 - 30, 'LASER', {
      fontSize: '22px', fontFamily: 'Inter, sans-serif', fontStyle: '900',
      color: '#ffffff', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(9605);
    this.tweens.add({ targets: laserText, y: laserText.y - 40, alpha: 0, duration: 800, onComplete: () => laserText.destroy() });

    // === FADE OUT all beam elements (longer = more visible) ===
    this.tweens.add({
      targets: [beam, glow], alpha: 0, duration: 600, delay: 200,
      onComplete: () => { beam.destroy(); glow.destroy(); },
    });
    this.tweens.add({
      targets: [muzzle, impact], alpha: 0, duration: 500, delay: 300,
      onComplete: () => { muzzle.destroy(); impact.destroy(); },
    });
  }

  _showHitEffect(sx, sy) {
    const flash = this.add.graphics().setDepth(9500);
    flash.fillStyle(0xffffff,0.6); flash.fillCircle(sx,sy-25,20);
    this.tweens.add({ targets:flash, alpha:0, duration:200, onComplete:()=>flash.destroy() });
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI*2/6)*i;
      const spark = this.add.graphics().setDepth(9501);
      spark.fillStyle(0xffd93d); spark.fillCircle(sx,sy-25,3);
      this.tweens.add({ targets:spark, x:Math.cos(a)*25, y:Math.sin(a)*25-25, alpha:0, duration:400, ease:'Cubic.easeOut', onComplete:()=>spark.destroy() });
    }
  }

  // ----------------------------------------------------------
  //  Power-Up Sprites
  // ----------------------------------------------------------
  _addPowerUp(pu, id) {
    const { x, y } = worldToScreen(pu.x, pu.y);
    const sx = x + this.camOX, sy = y + this.camOY;
    const PU_ICONS = { speed:'⚡', shield:'🛡️', turbo_repair:'🔧', invisible:'👻', shockwave:'💥' };
    const PU_COLORS = { speed:0xffd93d, shield:0x3498db, turbo_repair:0x2ecc71, invisible:0xa29bfe, shockwave:0xff6b6b };
    const color = PU_COLORS[pu.powerType] || 0xffffff;

    // Glow circle
    const glow = this.add.graphics().setDepth(sy - 1);
    glow.fillStyle(color, 0.2); glow.fillCircle(sx, sy, 20);

    // Icon
    const icon = this.add.text(sx, sy - 15, PU_ICONS[pu.powerType] || '⭐', {
      fontSize: '24px',
    }).setOrigin(0.5).setDepth(sy + 1);

    // Label
    const label = this.add.text(sx, sy + 8, (pu.powerType || '').toUpperCase(), {
      fontSize: '9px', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      color: '#fff', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(sy + 1);

    // Float animation
    this.tweens.add({ targets: icon, y: icon.y - 6, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Pulse glow
    this.tweens.add({ targets: glow, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    this.powerUpSprites[id] = { glow, icon, label };
  }

  _removePowerUp(id) {
    const d = this.powerUpSprites[id]; if (!d) return;
    // Pickup flash
    if (d.icon) {
      const sx = d.icon.x, sy = d.icon.y;
      const flash = this.add.graphics().setDepth(9500);
      flash.fillStyle(0xffffff, 0.5); flash.fillCircle(sx, sy, 30);
      this.tweens.add({ targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 300, onComplete: () => flash.destroy() });
    }
    d.glow.destroy(); d.icon.destroy(); d.label.destroy();
    delete this.powerUpSprites[id];
  }

  // ----------------------------------------------------------
  //  Shockwave Effect
  // ----------------------------------------------------------
  _showShockwave(data) {
    const { x, y } = worldToScreen(data.x, data.y);
    const sx = x + this.camOX, sy = y + this.camOY;

    // Expanding ring
    for (let i = 0; i < 3; i++) {
      const ring = this.add.graphics().setDepth(9500);
      ring.lineStyle(4 - i, 0xff6b6b, 0.7); ring.strokeCircle(sx, sy - 15, 10);
      this.tweens.add({
        targets: ring, scaleX: 8 + i * 2, scaleY: 4 + i, alpha: 0,
        duration: 600, delay: i * 100, ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy(),
      });
    }

    // Screen shake
    this.cameras.main.shake(300, 0.01);

    // Ground crack effect
    const crack = this.add.graphics().setDepth(9499);
    crack.fillStyle(0xff6b6b, 0.3); crack.fillCircle(sx, sy, 60);
    this.tweens.add({ targets: crack, alpha: 0, duration: 800, onComplete: () => crack.destroy() });
  }

  // ----------------------------------------------------------
  //  NUKE Effect (mushroom cloud)
  // ----------------------------------------------------------
  _showNuke(data) {
    // 1. Screen goes WHITE
    const white = this.add.graphics().setDepth(9999).setScrollFactor(0);
    white.fillStyle(0xffffff, 1); white.fillRect(0,0,1920,1080);
    this.tweens.add({ targets: white, alpha: 0, duration: 2000, delay: 500, onComplete: () => white.destroy() });

    // 2. Massive screen shake
    this.cameras.main.shake(2000, 0.025);

    // 3. Mushroom cloud at center of screen
    const cx = 960, cy = 400;
    // Stem
    const stem = this.add.graphics().setDepth(9998).setScrollFactor(0);
    stem.fillStyle(0xff6600, 0.8); stem.fillRect(cx-30, cy, 60, 300);
    stem.fillStyle(0xff9900, 0.5); stem.fillRect(cx-15, cy+50, 30, 250);
    // Mushroom top
    const cloud = this.add.graphics().setDepth(9998).setScrollFactor(0);
    cloud.fillStyle(0xff4400, 0.8); cloud.fillCircle(cx, cy, 120);
    cloud.fillStyle(0xff6600, 0.6); cloud.fillCircle(cx, cy-20, 90);
    cloud.fillStyle(0xffaa00, 0.5); cloud.fillCircle(cx, cy-30, 60);
    cloud.fillStyle(0xffdd00, 0.4); cloud.fillCircle(cx, cy-35, 35);
    // Ring
    const ring = this.add.graphics().setDepth(9997).setScrollFactor(0);
    ring.lineStyle(8, 0xff6600, 0.7); ring.strokeCircle(cx, cy+100, 50);

    // Expand ring
    this.tweens.add({ targets: ring, scaleX: 6, scaleY: 3, alpha: 0, duration: 1500, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });

    // Fade everything
    this.tweens.add({ targets: [stem, cloud], alpha: 0, duration: 1500, delay: 1500, onComplete: () => { stem.destroy(); cloud.destroy(); } });

    // Red tint after
    const red = this.add.graphics().setDepth(9996).setScrollFactor(0);
    red.fillStyle(0xff0000, 0.2); red.fillRect(0,0,1920,1080);
    this.tweens.add({ targets: red, alpha: 0, duration: 3000, delay: 1000, onComplete: () => red.destroy() });

    // Debris particles
    for (let i = 0; i < 40; i++) {
      const p = this.add.graphics().setDepth(9998).setScrollFactor(0);
      const c = [0xff4400, 0xff6600, 0xffaa00, 0x333333][Math.floor(Math.random()*4)];
      p.fillStyle(c, 0.8); p.fillCircle(cx + (Math.random()-0.5)*100, cy + Math.random()*50, 3+Math.random()*5);
      this.tweens.add({
        targets: p, x: (Math.random()-0.5)*800, y: -200-Math.random()*400,
        alpha: 0, duration: 1500+Math.random()*1000, ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }

    // Text
    const txt = this.add.text(960, 200, '☢️ NUKE ☢️', {
      fontSize: '64px', fontFamily: 'Inter, sans-serif', fontStyle: '900',
      color: '#ff4400', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(9999).setScrollFactor(0);
    this.tweens.add({ targets: txt, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 2000, delay: 500, onComplete: () => txt.destroy() });
  }

  // ----------------------------------------------------------
  //  FREEZE Effect
  // ----------------------------------------------------------
  _showFreeze(data) {
    // Blue flash
    const blue = this.add.graphics().setDepth(9999).setScrollFactor(0);
    blue.fillStyle(0x00aaff, 0.4); blue.fillRect(0,0,1920,1080);
    this.tweens.add({ targets: blue, alpha: 0, duration: 1000, onComplete: () => blue.destroy() });

    // Ice crystals expanding
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1920, y = Math.random() * 1080;
      const ice = this.add.text(x, y, '❄️', { fontSize: (20+Math.random()*30)+'px' })
        .setOrigin(0.5).setDepth(9998).setScrollFactor(0).setAlpha(0);
      this.tweens.add({ targets: ice, alpha: 0.8, scaleX: 1.5, scaleY: 1.5, duration: 500, delay: i*50, yoyo: true, hold: 2000, onComplete: () => ice.destroy() });
    }

    // Text
    const txt = this.add.text(960, 540, '🥶 FREEZE 🥶', {
      fontSize: '48px', fontFamily: 'Inter, sans-serif', fontStyle: '900',
      color: '#00ddff', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(9999).setScrollFactor(0);
    this.tweens.add({ targets: txt, alpha: 0, duration: 1000, delay: 2000, onComplete: () => txt.destroy() });

    this.cameras.main.shake(300, 0.008);
  }

  // ----------------------------------------------------------
  //  Emote Input (T key)
  // ----------------------------------------------------------
  _setupEmoteInput() {
    this.emoteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
    this.emoteKeys = {
      1: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      2: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      3: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      4: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    };
  }

  _processEmoteInput() {
    if (!this.room) return;
    const emotes = { 1: 'hello', 2: 'help', 3: 'follow', 4: 'ok' };
    for (const [key, type] of Object.entries(emotes)) {
      if (Phaser.Input.Keyboard.JustDown(this.emoteKeys[key])) {
        this.room.send('emote', { type });
      }
    }
  }

  // ----------------------------------------------------------
  //  Minimap
  // ----------------------------------------------------------
  _drawMinimapBase() {
    const canvas = document.getElementById('minimap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = 7; // pixels per tile
    canvas.width = MAP_W * s;
    canvas.height = MAP_H * s;
    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        ctx.fillStyle = MM_COLORS[MAP_TILES[r][c]] || MM_COLORS[0];
        ctx.fillRect(c*s, r*s, s, s);
      }
    }
    this._minimapDrawn = true;
  }

  _updateMinimap() {
    if (!this._minimapDrawn || !this.room) return;
    const canvas = document.getElementById('minimap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = 7;

    // Redraw base
    this._drawMinimapBase();

    // Draw machines
    this.room.state.machines.forEach((m) => {
      ctx.fillStyle = m.status === 'broken' ? '#ff4444' : '#44ff44';
      ctx.fillRect(Math.floor(m.x)*s+1, Math.floor(m.y)*s+1, s-2, s-2);
    });

    // Draw items
    this.room.state.items.forEach((it) => {
      if (!it.carried) {
        ctx.fillStyle = '#ffd93d';
        ctx.fillRect(Math.floor(it.x)*s+2, Math.floor(it.y)*s+2, s-4, s-4);
      }
    });

    // Draw players
    this.room.state.players.forEach((p, sid) => {
      const isLocal = sid === this.localSessionId;
      ctx.fillStyle = isLocal ? '#2ecc71' : PLAYER_COLORS_HEX[p.color] || '#fff';
      const px = Math.floor(p.x)*s, py = Math.floor(p.y)*s;
      ctx.beginPath(); ctx.arc(px+s/2, py+s/2, isLocal?4:3, 0, Math.PI*2); ctx.fill();
      if (isLocal) {
        ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(px+s/2, py+s/2, 6, 0, Math.PI*2); ctx.stroke();
      }
    });
  }

  // ----------------------------------------------------------
  //  UPDATE LOOP
  // ----------------------------------------------------------
  update(_time, delta) {
    if (!this.room) return;

    // Input
    let sx=0, sy=0;
    if (this.cursors.right.isDown||this.moveKeys.right.isDown) sx+=1;
    if (this.cursors.left.isDown||this.moveKeys.left.isDown||this.moveKeysAlt.left.isDown) sx-=1;
    if (this.cursors.down.isDown||this.moveKeys.down.isDown) sy+=1;
    if (this.cursors.up.isDown||this.moveKeys.up.isDown||this.moveKeysAlt.up.isDown) sy-=1;

    this.room.send('input', {
      sx, sy,
      pickup: Phaser.Input.Keyboard.JustDown(this.pickupKey),
      attack: Phaser.Input.Keyboard.JustDown(this.attackKey),
      dash:   Phaser.Input.Keyboard.JustDown(this.dashKey),
      sprint: this.sprintKey.isDown,
      repair: this.repairKey.isDown,
      laser:  Phaser.Input.Keyboard.JustDown(this.laserKey),
      nuke:   Phaser.Input.Keyboard.JustDown(this.nukeKey),
      freeze: Phaser.Input.Keyboard.JustDown(this.freezeKey),
      teleport: Phaser.Input.Keyboard.JustDown(this.teleportKey),
      laserTargetX: this._laserTargetX || 0,
      laserTargetY: this._laserTargetY || 0,
    });

    // Track mouse position in world coords for laser aiming
    if (this.input.activePointer) {
      const cam = this.cameras.main;
      const worldX = this.input.activePointer.worldX;
      const worldY = this.input.activePointer.worldY;
      // Convert screen coords back to tile coords (inverse of worldToScreen)
      const isoX = worldX - this.camOX;
      const isoY = worldY - this.camOY;
      this._laserTargetX = (isoX / (TILE_W/2) + isoY / (TILE_H/2)) / 2;
      this._laserTargetY = (isoY / (TILE_H/2) - isoX / (TILE_W/2)) / 2;
    }

    this._pushHUDData();
    this._renderPlayers(delta);
    this._renderMachines();
    this._renderItems();
    this._updateEmergencyEffects();
    this._updateCamera();
    this._updateMinimap();
    this._processEmoteInput();
    this._updatePowerUpHUD();
    this._updateStabilityEffects();
  }

  // Camera follow local player
  _updateCamera() {
    const lp = this.room.state.players.get(this.localSessionId);
    if (!lp) return;
    const { x, y } = worldToScreen(lp.x, lp.y);
    this._cameraTarget.setPosition(x + this.camOX, y + this.camOY - 10);
  }

  _pushHUDData() {
    if (!window.screenManager) return;
    const state = this.room.state;
    const lp = state.players.get(this.localSessionId);
    let carriedItem = null;
    if (lp && lp.carryingItemId) {
      const item = state.items.get(lp.carryingItemId);
      carriedItem = item ? (ITEM_LABELS[item.itemType]||item.itemType) : '?';
    }
    const emergencies = [];
    if (state.emergencies) state.emergencies.forEach((emg) => {
      if (!emg.active) return;
      const label = EMERGENCY_LABELS[emg.emergencyType]||emg.emergencyType;
      emergencies.push(emg.emergencyType==='overheat' ? `${label} (${Math.ceil(emg.timeRemaining||0)}s)` : label);
    });
    window.screenManager.updateHUD({
      timer:state.timer, stability:state.stability||0,
      score:lp?(lp.score||0):0, carriedItem, emergencies,
    });
  }

  // ----------------------------------------------------------
  //  Player Rendering (with lerping)
  // ----------------------------------------------------------
  _renderPlayers(delta) {
    for (const [sid, d] of Object.entries(this.playerSprites)) {
      const { sprite, label, carryIcon, player, stars, hatIcon, accIcon, repairBarBg, repairBarFill } = d;
      const isLocal = sid === this.localSessionId;

      // Smooth lerping for remote players
      const lerpF = 1 - Math.exp(-12 * (delta||16) / 1000);
      if (isLocal) {
        d.lerpX = player.x; d.lerpY = player.y;
      } else {
        d.lerpX += (player.x - d.lerpX) * lerpF;
        d.lerpY += (player.y - d.lerpY) * lerpF;
      }

      const { x, y } = worldToScreen(d.lerpX, d.lerpY);
      const screenX = x + this.camOX, screenY = y + this.camOY;

      sprite.setPosition(screenX, screenY);
      label.setPosition(screenX, screenY-55);
      carryIcon.setPosition(screenX, screenY-70);
      stars.setPosition(screenX, screenY-70);
      if (hatIcon) hatIcon.setPosition(screenX, screenY-62);
      if (accIcon) accIcon.setPosition(screenX+18, screenY-30);

      const depth = screenY;
      sprite.setDepth(depth); label.setDepth(depth+0.1);
      carryIcon.setDepth(depth+0.2); stars.setDepth(depth+0.3);
      if (hatIcon) hatIcon.setDepth(depth+0.15);
      if (accIcon) accIcon.setDepth(depth+0.15);

      // Carry indicator
      if (player.carryingItemId) {
        const item = this.room.state.items.get(player.carryingItemId);
        carryIcon.setText(item ? (ITEM_LABELS[item.itemType]||item.itemType) : 'OBJET');
        carryIcon.setVisible(true);
      } else carryIcon.setVisible(false);

      // Detect dash
      const dx = player.x-(d.prevX||player.x), dy = player.y-(d.prevY||player.y);
      const moved = Math.sqrt(dx*dx+dy*dy);
      if (moved>0.3) this._showDashEffect(screenX, screenY, dx/moved, dy/moved);
      d.prevX = player.x; d.prevY = player.y;

      // State effects
      const ps = player.state;
      if (ps==='stunned') {
        sprite.x += Math.sin(this.time.now*0.05)*4;
        stars.setVisible(true); sprite.setAlpha(1); sprite.setAngle(0);
        if (!d._wasStunned) { this._showHitEffect(screenX, screenY); d._wasStunned=true; }
      } else {
        d._wasStunned=false;
        if (ps==='knocked') {
          sprite.setAngle(90); sprite.setAlpha(0.6); stars.setVisible(false);
          if (!d._wasKnocked) { this._showHitEffect(screenX, screenY); d._wasKnocked=true; }
        } else {
          d._wasKnocked=false;
          sprite.setAngle(0); sprite.setAlpha(1); stars.setVisible(false);
          if (ps==='repairing') sprite.x += Math.sin(this.time.now*0.01)*2;
        }
      }

      // Repair bar (0-1)
      if (player.repairProgress>0 && player.repairProgress<1 && ps==='repairing') {
        repairBarBg.clear().setVisible(true).fillStyle(0x333333).fillRoundedRect(screenX-30,screenY-82,60,8,3).setDepth(depth+0.4);
        repairBarFill.clear().setVisible(true).fillStyle(0x2ecc71).fillRoundedRect(screenX-30,screenY-82,player.repairProgress*60,8,3).setDepth(depth+0.5);
      } else { repairBarBg.clear().setVisible(false); repairBarFill.clear().setVisible(false); }

      // Emote bubble
      if (player.emote && player.emoteTimer > 0) {
        const EMOTE_ICONS = { hello:'👋', help:'🆘', follow:'➡️', ok:'👍' };
        if (!d._emoteText) {
          d._emoteText = this.add.text(0, 0, '', { fontSize:'28px', backgroundColor:'#000000cc', padding:{x:8,y:4} }).setOrigin(0.5).setDepth(10000);
        }
        d._emoteText.setText(EMOTE_ICONS[player.emote] || '❓');
        d._emoteText.setPosition(screenX, screenY - 90);
        d._emoteText.setVisible(true);
      } else if (d._emoteText) {
        d._emoteText.setVisible(false);
      }

      // Power-up particle aura
      if (player.powerUpType && player.powerUpTimer > 0) {
        const PU_COLORS_MAP = { speed:0xffd93d, shield:0x3498db, turbo_repair:0x2ecc71, invisible:0xa29bfe };
        const puColor = PU_COLORS_MAP[player.powerUpType] || 0xffffff;
        if (Math.random() < 0.3) {
          const p = this.add.graphics().setDepth(depth - 0.5);
          const angle = Math.random() * Math.PI * 2;
          const dist = 12 + Math.random() * 8;
          p.fillStyle(puColor, 0.7); p.fillCircle(screenX + Math.cos(angle) * dist, screenY - 20 + Math.sin(angle) * dist, 2);
          this.tweens.add({ targets: p, y: -15, alpha: 0, duration: 500, onComplete: () => p.destroy() });
        }
        // Invisibility: make other players' view of this player transparent
        if (player.powerUpType === 'invisible' && sid !== this.localSessionId) {
          sprite.setAlpha(0.15);
          label.setAlpha(0.15);
        }
      }
    }
  }

  // ----------------------------------------------------------
  //  Machine / Item Rendering
  // ----------------------------------------------------------
  _renderMachines() {
    for (const [_, d] of Object.entries(this.machineSprites)) {
      const { glow, statusText, needText, machine, repairBarBg, repairBarFill, sx, sy, sprite } = d;
      glow.clear();
      if (machine.status==='working') {
        glow.fillStyle(0x2ecc71,0.15); glow.fillEllipse(sx,sy,45,22);
        statusText.setText('OK').setColor('#2ecc71'); needText.setVisible(false);
      } else {
        const p = 0.2+Math.sin(this.time.now*0.005)*0.15;
        glow.fillStyle(0xff0000,p); glow.fillEllipse(sx,sy,55,28);
        statusText.setText('EN PANNE').setColor('#ff0000');
        const need = MACHINE_NEEDS[machine.machineType];
        if (need) { needText.setText(`Besoin: ${need}`).setVisible(true); }
      }
      if (machine.repairProgress>0 && machine.repairProgress<1 && machine.repairerId) {
        repairBarBg.clear().setVisible(true).fillStyle(0x333333).fillRoundedRect(sx-35,sy-90,70,10,4);
        repairBarFill.clear().setVisible(true).fillStyle(0x3498db).fillRoundedRect(sx-35,sy-90,machine.repairProgress*70,10,4);
      } else { repairBarBg.clear().setVisible(false); repairBarFill.clear().setVisible(false); }
      sprite.setDepth(sy);
    }
  }

  _renderItems() {
    for (const [_, d] of Object.entries(this.itemSprites)) {
      const { sprite, label, item } = d;
      if (item.carried) { sprite.setVisible(false); label.setVisible(false); }
      else {
        sprite.setVisible(true); label.setVisible(true);
        const { x, y } = worldToScreen(item.x, item.y);
        const sx = x+this.camOX, sy = y+this.camOY;
        sprite.setPosition(sx,sy); label.setPosition(sx,sy+6);
        sprite.y += Math.sin(this.time.now*0.003+item.x*100)*3;
        sprite.setDepth(sy); label.setDepth(sy+0.1);
      }
    }
  }

  // ----------------------------------------------------------
  //  Power-Up HUD + Stability Effects
  // ----------------------------------------------------------
  _updatePowerUpHUD() {
    if (!window.screenManager || !this.room) return;
    const lp = this.room.state.players.get(this.localSessionId);
    if (lp) window.screenManager.updatePowerUpHUD(lp.powerUpType, lp.powerUpTimer);
  }

  _updateStabilityEffects() {
    if (!this.room) return;
    const stability = this.room.state.stability;
    // Low stability: periodic red pulse + shake
    if (stability < 15) {
      // Heartbeat effect
      const beat = Math.sin(this.time.now * 0.008) > 0.7;
      if (beat && !this._lastBeat) {
        this.cameras.main.shake(100, 0.003);
      }
      this._lastBeat = beat;
    }
    // Music volume scales with danger
    if (window._musicStarted) {
      const game = document.getElementById('music-game');
      if (game) game.volume = 0.3 + (1 - stability / 100) * 0.3;
    }
  }

  // ----------------------------------------------------------
  //  Emergency Effects
  // ----------------------------------------------------------
  _updateEmergencyEffects() {
    const state = this.room.state;
    let hasGas=false, hasCircuit=false, hasOverheat=false, overheatTime=0;
    if (state.emergencies) state.emergencies.forEach((e) => {
      if (!e.active) return;
      if (e.emergencyType==='gas_leak') hasGas=true;
      if (e.emergencyType==='short_circuit') hasCircuit=true;
      if (e.emergencyType==='overheat') { hasOverheat=true; overheatTime=Math.ceil(e.timeRemaining||0); }
    });

    this.gasOverlay.alpha += ((hasGas?1:0)-this.gasOverlay.alpha)*0.05;

    if (hasCircuit) {
      // Among Us style: use a separate canvas mask for clean vision hole
      if (!this._visionCanvas) {
        this._visionCanvas = document.createElement('canvas');
        this._visionCanvas.width = 1920;
        this._visionCanvas.height = 1080;
        this._visionTex = this.textures.createCanvas('_vision', 1920, 1080);
        this._visionImg = this.add.image(960, 540, '_vision').setDepth(9001).setScrollFactor(0).setAlpha(0);
      }

      const lp = state.players.get(this.localSessionId);
      const cam = this.cameras.main;
      const ctx = this._visionTex.getContext();

      // Full black
      ctx.fillStyle = 'rgba(0,0,0,0.95)';
      ctx.fillRect(0, 0, 1920, 1080);

      if (lp) {
        // Player position on screen (accounting for camera)
        const { x, y } = worldToScreen(lp.x, lp.y);
        const worldX = x + this.camOX;
        const worldY = y + this.camOY - 15;
        const screenX = (worldX - cam.scrollX) * cam.zoom + 960 * (1 - cam.zoom);
        const screenY = (worldY - cam.scrollY) * cam.zoom + 540 * (1 - cam.zoom);

        // Clear a radial gradient circle (vision zone)
        const radius = 160;
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');       // fully clear center
        gradient.addColorStop(0.5, 'rgba(0,0,0,0.9)');
        gradient.addColorStop(0.8, 'rgba(0,0,0,0.3)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');       // fully dark edge

        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = gradient;
        ctx.fillRect(screenX - radius, screenY - radius, radius * 2, radius * 2);
        ctx.globalCompositeOperation = 'source-over';
      }

      this._visionTex.refresh();
      this._visionImg.alpha += (1 - this._visionImg.alpha) * 0.08;
    } else {
      if (this._visionImg) this._visionImg.alpha += -this._visionImg.alpha * 0.08;
    }

    if (hasOverheat) {
      this.overheatBorder.setAlpha(0.5+Math.sin(this.time.now*0.008)*0.5);
      this.overheatText.setText(`SURCHAUFFE: ${overheatTime}s`).setAlpha(1);
    } else {
      this.overheatBorder.alpha += -this.overheatBorder.alpha*0.08;
      this.overheatText.alpha += -this.overheatText.alpha*0.08;
    }
  }
}

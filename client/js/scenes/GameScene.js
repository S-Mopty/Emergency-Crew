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
    this._createEffectLayers();
    this._drawMinimapBase();

    // Camera follow setup
    this._cameraTarget = this.add.rectangle(0, 0, 1, 1, 0x000000, 0);
    this.cameras.main.startFollow(this._cameraTarget, true, 0.08, 0.08);
    this.cameras.main.setZoom(CAMERA_ZOOM);

    if (this.room) this._setupRoomListeners();
  }

  // ----------------------------------------------------------
  //  Player Textures (detailed worker sprites)
  // ----------------------------------------------------------
  _genPlayerTextures() {
    PLAYER_COLORS.forEach((color, i) => {
      const key = `player_${i}`;
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ add: false });
      const w = 48, h = 72;
      // Shadow
      g.fillStyle(0x000000, 0.3); g.fillEllipse(w/2, h-4, 32, 14);
      // Boots
      g.fillStyle(0x2d3436);
      g.fillRoundedRect(w/2-10, h-16, 8, 12, 2); g.fillRoundedRect(w/2+2, h-16, 8, 12, 2);
      // Legs
      g.fillStyle(0x636e72); g.fillRect(w/2-8, h-28, 6, 14); g.fillRect(w/2+2, h-28, 6, 14);
      // Body
      g.fillStyle(color);
      g.beginPath(); g.moveTo(w/2,18); g.lineTo(w-6,h*0.42); g.lineTo(w/2,h-26); g.lineTo(6,h*0.42); g.closePath(); g.fillPath();
      g.lineStyle(2, 0xffffff, 0.3); g.strokePath();
      // Belt + Head + Hat + Eyes + Tool
      g.fillStyle(0x2d3436); g.fillRect(w/2-14, h-30, 28, 4);
      g.fillStyle(0xffeaa7); g.fillCircle(w/2, 16, 9);
      g.fillStyle(0xf1c40f); g.fillRoundedRect(w/2-11, 5, 22, 10, 3); g.fillRect(w/2-13, 12, 26, 3);
      g.fillStyle(0x2d3436); g.fillCircle(w/2-3, 16, 1.5); g.fillCircle(w/2+3, 16, 1.5);
      g.fillStyle(0x95a5a6); g.fillRect(w-10, h*0.42, 3, 12);
      g.generateTexture(key, w, h); g.destroy();
    });
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
    room.onLeave(() => { this.room = null; if (window.screenManager) window.screenManager.showDisconnect(); });
  }

  // ----------------------------------------------------------
  //  Players
  // ----------------------------------------------------------
  _addPlayer(player, sid) {
    const isLocal = sid === this.localSessionId;
    const ci = player.color ?? 0;
    const sprite = this.add.image(0, 0, `player_${ci}`).setOrigin(0.5, 0.9);
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
    });

    this._pushHUDData();
    this._renderPlayers(delta);
    this._renderMachines();
    this._renderItems();
    this._updateEmergencyEffects();
    this._updateCamera();
    this._updateMinimap();
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
      this.circuitOverlay.clear();
      this.circuitOverlay.fillStyle(0x000000,0.75);
      this.circuitOverlay.fillRect(-2000,-2000,6000,6000);
      const lp = state.players.get(this.localSessionId);
      if (lp) {
        const { x, y } = worldToScreen(lp.x, lp.y);
        const px = x+this.camOX, py = y+this.camOY;
        for (let r=200; r>0; r-=12) {
          this.circuitOverlay.fillStyle(0x0f0f23, 0.75*(r/200));
          this.circuitOverlay.fillCircle(px,py,r);
        }
      }
      this.circuitOverlay.alpha += (1-this.circuitOverlay.alpha)*0.05;
    } else this.circuitOverlay.alpha += -this.circuitOverlay.alpha*0.08;

    if (hasOverheat) {
      this.overheatBorder.setAlpha(0.5+Math.sin(this.time.now*0.008)*0.5);
      this.overheatText.setText(`SURCHAUFFE: ${overheatTime}s`).setAlpha(1);
    } else {
      this.overheatBorder.alpha += -this.overheatBorder.alpha*0.08;
      this.overheatText.alpha += -this.overheatText.alpha*0.08;
    }
  }
}

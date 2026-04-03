// ============================================================
//  Emergency Crew - TutorialScene
//  Automated "mini-video" tutorial: a bot plays the game
//  with speech bubbles to teach mechanics by watching.
// ============================================================

const T_TILE_W = 64;
const T_TILE_H = 32;
const T_ASSET_SCALE = 0.3;

// Mini-map for the tutorial (small subset: storage + hub + one machine)
const TUTO_TILES = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,0,0,0,0,0,0,0],
  [0,1,1,1,1,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,2,2,2,2,2,0,0,0],
  [0,0,0,0,2,2,2,2,2,0,0,0],
  [0,0,0,0,2,2,2,2,2,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
];
const T_MAP_W = 12, T_MAP_H = 9;
const T_TILE_KEYS = { 0: null, 1: 'tile_dirt', 2: 'tile_planks' };

function tWorldToScreen(wx, wy) {
  return {
    x: (wx - wy) * (T_TILE_W / 2),
    y: (wx + wy) * (T_TILE_H / 2),
  };
}

export class TutorialScene extends Phaser.Scene {
  constructor() { super('TutorialScene'); }

  init(data) {
    this.room = data.room || null;
    this.onComplete = data.onComplete || null;
  }

  preload() {
    const base = '/assets/Isometric/';
    if (!this.textures.exists('tile_dirt')) {
      this.load.image('tile_dirt',   base + 'dirt_S.png');
      this.load.image('tile_planks', base + 'planks_S.png');
      this.load.image('machine_cooling_unit', base + 'chimneyBase_S.png');
      this.load.image('item_coolant', base + 'hayBalesStacked_S.png');
    }
  }

  create() {
    this.camOX = this.cameras.main.width / 2;
    this.camOY = 120;

    // Dark background
    this.add.graphics().fillStyle(0x0f0f23).fillRect(0, 0, 1920, 1080).setDepth(-10);

    // Draw mini map
    this._drawFloor();

    // Room labels
    this._addLabel(2.5, 1.5, 'STOCKAGE', '#ffd93d');
    this._addLabel(6, 6, 'HUB CENTRAL', '#74b9ff');

    // Place machine (broken cooling unit at hub)
    const machinePos = { x: 7, y: 6 };
    const ms = tWorldToScreen(machinePos.x, machinePos.y);
    this.machine = this.add.image(ms.x + this.camOX, ms.y + this.camOY, 'machine_cooling_unit')
      .setScale(T_ASSET_SCALE * 1.3).setOrigin(0.5, 0.875).setDepth(ms.y + this.camOY);
    this.machineGlow = this.add.graphics().setDepth(ms.y + this.camOY - 0.5);

    this.machineLabel = this.add.text(ms.x + this.camOX, ms.y + this.camOY - 70, 'Refroidisseur', {
      fontSize: '13px', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      color: '#fff', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(ms.y + this.camOY + 1);

    this.machineStatus = this.add.text(ms.x + this.camOX, ms.y + this.camOY - 55, 'OK', {
      fontSize: '12px', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      color: '#2ecc71', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(ms.y + this.camOY + 1);

    this.machineNeed = this.add.text(ms.x + this.camOX, ms.y + this.camOY - 40, '', {
      fontSize: '12px', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      color: '#ffd93d', stroke: '#000', strokeThickness: 3,
      backgroundColor: '#000000aa', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(ms.y + this.camOY + 1).setVisible(false);

    // Place item in storage
    const itemPos = { x: 2, y: 2 };
    const is = tWorldToScreen(itemPos.x, itemPos.y);
    this.item = this.add.image(is.x + this.camOX, is.y + this.camOY, 'item_coolant')
      .setScale(T_ASSET_SCALE * 0.9).setOrigin(0.5, 0.875).setDepth(is.y + this.camOY);
    this.itemLabel = this.add.text(is.x + this.camOX, is.y + this.camOY + 6, 'Refrigerant', {
      fontSize: '12px', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      color: '#ffd93d', stroke: '#000', strokeThickness: 3,
      backgroundColor: '#000000aa', padding: { x: 4, y: 2 },
    }).setOrigin(0.5, 0).setDepth(is.y + this.camOY + 1);

    // Create bot player sprite
    this._genBotTexture();
    const botStart = { x: 5, y: 5.5 };
    const bs = tWorldToScreen(botStart.x, botStart.y);
    this.bot = this.add.image(bs.x + this.camOX, bs.y + this.camOY, 'tuto_bot')
      .setOrigin(0.5, 0.9).setDepth(10000);
    this.botWorldX = botStart.x;
    this.botWorldY = botStart.y;

    // Bot name label
    this.botName = this.add.text(0, 0, 'OUVRIER', {
      fontSize: '13px', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      color: '#2ecc71', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(10001);

    // Speech bubble
    this.bubbleBg = this.add.graphics().setDepth(10002);
    this.bubbleText = this.add.text(0, 0, '', {
      fontSize: '15px', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      color: '#fff', stroke: '#000', strokeThickness: 2,
      wordWrap: { width: 280 }, align: 'center',
    }).setOrigin(0.5, 1).setDepth(10003);

    // Title
    this.titleText = this.add.text(960, 50, 'TUTORIEL', {
      fontSize: '48px', fontFamily: 'Inter, sans-serif', fontStyle: '900',
      color: '#ffd93d', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(10010).setScrollFactor(0);

    // Start the scripted sequence
    this._runSequence();
  }

  _genBotTexture() {
    if (this.textures.exists('tuto_bot')) return;
    const g = this.make.graphics({ add: false });
    const w = 48, h = 72;
    g.fillStyle(0x000000, 0.3); g.fillEllipse(w/2, h-4, 32, 14);
    g.fillStyle(0x2d3436); g.fillRoundedRect(w/2-10, h-16, 8, 12, 2); g.fillRoundedRect(w/2+2, h-16, 8, 12, 2);
    g.fillStyle(0x636e72); g.fillRect(w/2-8, h-28, 6, 14); g.fillRect(w/2+2, h-28, 6, 14);
    g.fillStyle(0x3498db);
    g.beginPath(); g.moveTo(w/2, 18); g.lineTo(w-6, h*0.42); g.lineTo(w/2, h-26); g.lineTo(6, h*0.42); g.closePath(); g.fillPath();
    g.lineStyle(2, 0xffffff, 0.3); g.strokePath();
    g.fillStyle(0x2d3436); g.fillRect(w/2-14, h-30, 28, 4);
    g.fillStyle(0xffeaa7); g.fillCircle(w/2, 16, 9);
    g.fillStyle(0xf1c40f); g.fillRoundedRect(w/2-11, 5, 22, 10, 3); g.fillRect(w/2-13, 12, 26, 3);
    g.fillStyle(0x2d3436); g.fillCircle(w/2-3, 16, 1.5); g.fillCircle(w/2+3, 16, 1.5);
    g.fillStyle(0x95a5a6); g.fillRect(w-10, h*0.42, 3, 12);
    g.generateTexture('tuto_bot', w, h);
    g.destroy();
  }

  _drawFloor() {
    for (let r = 0; r < T_MAP_H; r++)
      for (let c = 0; c < T_MAP_W; c++) {
        const key = T_TILE_KEYS[TUTO_TILES[r][c]];
        if (!key) continue;
        const { x, y } = tWorldToScreen(c, r);
        const sprite = this.add.image(x + this.camOX, y + this.camOY, key);
        sprite.setScale(T_ASSET_SCALE);
        sprite.setOrigin(0.5, 0.875);
        sprite.setDepth(-1);
      }
  }

  _addLabel(col, row, text, color) {
    const { x, y } = tWorldToScreen(col, row);
    this.add.text(x + this.camOX, y + this.camOY - 10, text, {
      fontSize: '14px', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      color, stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(0).setAlpha(0.8);
  }

  // ----------------------------------------------------------
  //  Bot Movement
  // ----------------------------------------------------------
  _moveBotTo(tx, ty, speed = 3) {
    return new Promise((resolve) => {
      const dx = tx - this.botWorldX;
      const dy = ty - this.botWorldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const duration = (dist / speed) * 1000;

      const startX = this.botWorldX, startY = this.botWorldY;

      this.tweens.addCounter({
        from: 0, to: 1, duration,
        ease: 'Linear',
        onUpdate: (tween) => {
          const t = tween.getValue();
          this.botWorldX = startX + dx * t;
          this.botWorldY = startY + dy * t;
          this._updateBotPosition();

          // Walking animation
          this.bot.x += Math.sin(Date.now() * 0.015) * 1;
        },
        onComplete: () => {
          this.botWorldX = tx;
          this.botWorldY = ty;
          this._updateBotPosition();
          resolve();
        },
      });
    });
  }

  _updateBotPosition() {
    const { x, y } = tWorldToScreen(this.botWorldX, this.botWorldY);
    const sx = x + this.camOX, sy = y + this.camOY;
    this.bot.setPosition(sx, sy);
    this.bot.setDepth(sy + 50);
    this.botName.setPosition(sx, sy - 55);
    this.botName.setDepth(sy + 51);
  }

  // ----------------------------------------------------------
  //  Speech Bubble
  // ----------------------------------------------------------
  _showBubble(text, duration = 2500) {
    return new Promise((resolve) => {
      const { x, y } = tWorldToScreen(this.botWorldX, this.botWorldY);
      const sx = x + this.camOX, sy = y + this.camOY;

      this.bubbleText.setText(text);
      this.bubbleText.setPosition(sx, sy - 85);
      this.bubbleText.setAlpha(1);

      // Draw bubble background
      const bounds = this.bubbleText.getBounds();
      const pad = 12;
      this.bubbleBg.clear();
      this.bubbleBg.fillStyle(0x000000, 0.8);
      this.bubbleBg.fillRoundedRect(
        bounds.x - pad, bounds.y - pad,
        bounds.width + pad * 2, bounds.height + pad * 2, 10
      );
      this.bubbleBg.lineStyle(2, 0xffd93d, 0.6);
      this.bubbleBg.strokeRoundedRect(
        bounds.x - pad, bounds.y - pad,
        bounds.width + pad * 2, bounds.height + pad * 2, 10
      );
      // Triangle pointer
      this.bubbleBg.fillStyle(0x000000, 0.8);
      this.bubbleBg.fillTriangle(sx - 8, bounds.y + bounds.height + pad, sx + 8, bounds.y + bounds.height + pad, sx, bounds.y + bounds.height + pad + 10);
      this.bubbleBg.setAlpha(1);

      this.time.delayedCall(duration, () => {
        this.tweens.add({
          targets: [this.bubbleText, this.bubbleBg],
          alpha: 0, duration: 300,
          onComplete: resolve,
        });
      });
    });
  }

  _hideBubble() {
    this.bubbleText.setAlpha(0);
    this.bubbleBg.clear();
  }

  // ----------------------------------------------------------
  //  Wait utility
  // ----------------------------------------------------------
  _wait(ms) { return new Promise(r => this.time.delayedCall(ms, r)); }

  // ----------------------------------------------------------
  //  Scripted Tutorial Sequence
  // ----------------------------------------------------------
  async _runSequence() {
    // Phase 1: Bot walks around casually
    await this._wait(800);
    await this._showBubble("Tout va bien, pas de probleme en vue !", 2500);
    await this._moveBotTo(6, 6, 2.5);
    await this._wait(400);

    // Phase 2: Emergency happens!
    // Red flash + machine breaks
    this._breakMachine();
    await this._showBubble("Oh non ! Le refroidisseur est en panne !", 2500);
    await this._wait(300);

    // Phase 3: Bot goes to check the machine
    await this._showBubble("Voyons de quoi j'ai besoin...", 1500);
    await this._moveBotTo(6.5, 6, 3);
    await this._wait(500);
    await this._showBubble("Il me faut un Refrigerant !\nVite, direction le stockage !", 2500);
    await this._wait(300);

    // Phase 4: Bot goes to storage to pick up item
    await this._moveBotTo(4, 4, 3.5);
    await this._moveBotTo(2, 2, 3.5);
    await this._wait(300);

    // Pick up item
    this.item.setVisible(false);
    this.itemLabel.setVisible(false);
    // Show carry indicator
    this.botCarry = this.add.text(0, 0, 'Refrigerant', {
      fontSize: '12px', fontFamily: 'Inter, sans-serif', fontStyle: 'bold',
      color: '#ffd93d', stroke: '#000', strokeThickness: 3,
      backgroundColor: '#000000aa', padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 1).setDepth(10004);

    await this._showBubble("C'est bon, je l'ai ! Vite, retour a la machine !", 2000);
    await this._wait(200);

    // Phase 5: Bot returns to machine and repairs
    await this._moveBotTo(4, 4, 4);
    await this._moveBotTo(6.5, 6, 4);
    await this._wait(300);

    await this._showBubble("Reparation en cours... (touche R)", 1000);

    // Animated repair bar
    await this._animateRepair();

    // Fix machine
    this._fixMachine();
    if (this.botCarry) this.botCarry.destroy();
    await this._showBubble("Machine reparee ! +20 points !", 2000);

    // Show floating points
    const { x, y } = tWorldToScreen(this.botWorldX, this.botWorldY);
    const pts = this.add.text(x + this.camOX, y + this.camOY - 80, '+20', {
      fontSize: '28px', fontFamily: 'Inter, sans-serif', fontStyle: '900',
      color: '#2ecc71', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(10010);
    this.tweens.add({ targets: pts, y: pts.y - 50, alpha: 0, duration: 1500 });

    await this._wait(1200);

    // Phase 6: Conclusion
    await this._showBubble("Voila, c'est aussi simple que ca !", 2500);
    await this._wait(800);

    // Fade title out
    this.tweens.add({ targets: this.titleText, alpha: 0, duration: 500 });

    // Show "Compris" button via ScreenManager
    this._showComprisButton();
  }

  _breakMachine() {
    // Red screen flash
    const flash = this.add.graphics().setDepth(9999);
    flash.fillStyle(0xff0000, 0.3); flash.fillRect(0, 0, 1920, 1080);
    this.tweens.add({ targets: flash, alpha: 0, duration: 800, onComplete: () => flash.destroy() });

    // Machine status change
    this.machineStatus.setText('EN PANNE');
    this.machineStatus.setColor('#ff0000');
    this.machineNeed.setText('Besoin: Refrigerant');
    this.machineNeed.setVisible(true);

    // Pulsing glow
    this._machineGlowTimer = this.time.addEvent({
      delay: 50, loop: true,
      callback: () => {
        if (!this._machineBroken) return;
        this.machineGlow.clear();
        const ms = tWorldToScreen(7, 6);
        const pulse = 0.2 + Math.sin(Date.now() * 0.005) * 0.15;
        this.machineGlow.fillStyle(0xff0000, pulse);
        this.machineGlow.fillEllipse(ms.x + this.camOX, ms.y + this.camOY, 55, 28);
      },
    });
    this._machineBroken = true;
  }

  _fixMachine() {
    this._machineBroken = false;
    if (this._machineGlowTimer) this._machineGlowTimer.destroy();
    this.machineGlow.clear();
    const ms = tWorldToScreen(7, 6);
    this.machineGlow.fillStyle(0x2ecc71, 0.15);
    this.machineGlow.fillEllipse(ms.x + this.camOX, ms.y + this.camOY, 45, 22);
    this.machineStatus.setText('OK');
    this.machineStatus.setColor('#2ecc71');
    this.machineNeed.setVisible(false);
  }

  _animateRepair() {
    return new Promise((resolve) => {
      const { x, y } = tWorldToScreen(this.botWorldX, this.botWorldY);
      const sx = x + this.camOX, sy = y + this.camOY;

      const barBg = this.add.graphics().setDepth(10005);
      barBg.fillStyle(0x333333); barBg.fillRoundedRect(sx - 35, sy - 90, 70, 10, 4);

      const barFill = this.add.graphics().setDepth(10006);
      let progress = 0;

      const timer = this.time.addEvent({
        delay: 30, loop: true,
        callback: () => {
          progress += 0.02;
          barFill.clear(); barFill.fillStyle(0x2ecc71);
          barFill.fillRoundedRect(sx - 35, sy - 90, progress * 70, 10, 4);

          // Wrench animation on bot
          this.bot.x = sx + Math.sin(Date.now() * 0.01) * 2;

          if (progress >= 1) {
            timer.destroy();
            barBg.destroy(); barFill.destroy();
            resolve();
          }
        },
      });
    });
  }

  // ----------------------------------------------------------
  //  "Compris" Button
  // ----------------------------------------------------------
  _showComprisButton() {
    if (window.screenManager) {
      window.screenManager.showTutorialCompris();
    }
  }

  update() {
    // Update bot carry indicator position
    if (this.botCarry && this.botCarry.active) {
      const { x, y } = tWorldToScreen(this.botWorldX, this.botWorldY);
      this.botCarry.setPosition(x + this.camOX, y + this.camOY - 70);
    }
  }
}

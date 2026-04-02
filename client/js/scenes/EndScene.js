// ============================================================
//  Emergency Crew - EndScene (Podium + Results)
// ============================================================

import { t, t_color } from '../locale.js';

const PLAYER_COLORS_HEX = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
const PLAYER_COLORS_INT = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12];

export class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  init(data) {
    this.room      = data.room || null;
    this.reason    = data.reason || 'time';
    this.winner    = data.winner || null;
    this.scores    = data.scores || {};
    this.stability = data.stability !== undefined ? data.stability : 50;
  }

  create() {
    // Reset camera from GameScene zoom
    this.cameras.main.setZoom(1);
    this.cameras.main.setScroll(0, 0);

    // Hide game HUD, show overlay for replay button
    document.getElementById('game-hud').classList.remove('active');
    document.getElementById('pregame-overlay').classList.add('hidden');

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x080816);
    bg.fillRect(0, 0, 1280, 720);

    // Animated grid lines
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x111128, 0.3);
    for (let i = 0; i < 1280; i += 64) grid.lineBetween(i, 0, i, 720);
    for (let j = 0; j < 720; j += 32) grid.lineBetween(0, j, 1280, j);

    // Decorative corner brackets
    this._drawCornerBrackets();

    // Station status
    const saved = this.stability > 0;
    const statusText = saved ? t('end_station_saved') : t('end_station_destroyed');
    const statusColor = saved ? '#2ecc71' : '#ff4444';

    const title = this.add.text(640, 42, statusText, {
      fontSize: '44px', fontFamily: 'Orbitron, Courier New', fontStyle: 'bold',
      color: statusColor, stroke: '#000', strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: statusColor, blur: 20, fill: true },
    }).setOrigin(0.5);

    // Glow animation on title
    this.tweens.add({
      targets: title,
      alpha: { from: 0.7, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Decorative line
    const deco = this.add.graphics();
    deco.lineStyle(2, saved ? 0x2ecc71 : 0xff4444, 0.3);
    deco.lineBetween(340, 74, 940, 74);
    deco.fillStyle(saved ? 0x2ecc71 : 0xff4444, 0.6);
    deco.fillCircle(640, 74, 3);

    this.add.text(640, 88, `${t('end_stability')} ${Math.round(this.stability)}%`, {
      fontSize: '14px', fontFamily: 'Share Tech Mono, Courier New', color: '#889',
    }).setOrigin(0.5);

    // Sort players by score
    const sorted = this._getSortedPlayers();

    // Draw podium
    this._drawPodium(sorted);

    // Draw score list
    this._drawScoreList(sorted);

    // Draw special titles
    this._drawSpecialTitles(sorted);

    // Replay button
    this._drawReplayButton();

    // Particle effects
    this._addParticles(saved);

    // Leave room if still connected
    if (this.room) {
      try { this.room.leave(); } catch (e) { /* ignore */ }
      this.room = null;
    }
  }

  _drawCornerBrackets() {
    const g = this.add.graphics();
    g.lineStyle(2, 0x333366, 0.4);
    const s = 30;
    // Top-left
    g.lineBetween(20, 20, 20, 20 + s);
    g.lineBetween(20, 20, 20 + s, 20);
    // Top-right
    g.lineBetween(1260, 20, 1260, 20 + s);
    g.lineBetween(1260, 20, 1260 - s, 20);
    // Bottom-left
    g.lineBetween(20, 700, 20, 700 - s);
    g.lineBetween(20, 700, 20 + s, 700);
    // Bottom-right
    g.lineBetween(1260, 700, 1260, 700 - s);
    g.lineBetween(1260, 700, 1260 - s, 700);
  }

  _getSortedPlayers() {
    const players = [];
    for (const [sessionId, data] of Object.entries(this.scores)) {
      const colorIdx = data.color !== undefined && data.color !== null ? data.color : 0;
      const name = data.name || t_color(colorIdx);
      players.push({
        sessionId,
        score: data.score || 0,
        name: name || '???',
        color: colorIdx,
        kos: data.kos || 0,
      });
    }
    players.sort((a, b) => b.score - a.score);
    return players;
  }

  // ----------------------------------------------------------
  //  Podium
  // ----------------------------------------------------------
  _drawPodium(sorted) {
    if (sorted.length === 0) return;

    const podiumY = 260;
    const positions = [
      { x: 640, y: podiumY, h: 140, place: 1 },
      { x: 420, y: podiumY, h: 90,  place: 2 },
      { x: 860, y: podiumY, h: 60,  place: 3 },
    ];

    for (let i = 0; i < Math.min(sorted.length, 3); i++) {
      const pos = positions[i];
      const player = sorted[i];
      const colorInt = PLAYER_COLORS_INT[player.color] || 0x888888;
      const colorHex = PLAYER_COLORS_HEX[player.color] || '#888';

      // Podium block with gradient effect
      const g = this.add.graphics();
      g.fillStyle(colorInt, 0.15);
      g.fillRoundedRect(pos.x - 75, pos.y + 40 - pos.h, 150, pos.h, 8);
      g.fillStyle(colorInt, 0.08);
      g.fillRoundedRect(pos.x - 73, pos.y + 40 - pos.h + 2, 146, pos.h / 3, 6);
      g.lineStyle(2, colorInt, 0.6);
      g.strokeRoundedRect(pos.x - 75, pos.y + 40 - pos.h, 150, pos.h, 8);

      // Place number with circle background
      const placeG = this.add.graphics();
      placeG.fillStyle(colorInt, 0.3);
      placeG.fillCircle(pos.x, pos.y + 40 - pos.h + 18, 14);
      placeG.lineStyle(1, colorInt, 0.5);
      placeG.strokeCircle(pos.x, pos.y + 40 - pos.h + 18, 14);

      this.add.text(pos.x, pos.y + 40 - pos.h + 18, `${pos.place}`, {
        fontSize: '16px', fontFamily: 'Orbitron, Courier New', fontStyle: 'bold',
        color: '#fff', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);

      // Player avatar
      this._drawPlayerAvatar(pos.x, pos.y - pos.h - 20, colorInt);

      // Player name
      this.add.text(pos.x, pos.y + 40 - pos.h + 38, player.name, {
        fontSize: '14px', fontFamily: 'Share Tech Mono, Courier New', fontStyle: 'bold',
        color: colorHex,
      }).setOrigin(0.5, 0);

      // Score with glow
      const scoreText = this.add.text(pos.x, pos.y + 40 - pos.h + 58, `${player.score} pts`, {
        fontSize: '20px', fontFamily: 'Orbitron, Courier New', fontStyle: 'bold',
        color: '#ffd93d', stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5, 0);

      // Employee of the Month for 1st place
      if (i === 0) {
        const trophyY = pos.y - pos.h - 30;
        const trophy = this.add.text(pos.x, trophyY, t('end_employee_month'), {
          fontSize: '14px', fontFamily: 'Orbitron, Courier New', fontStyle: 'bold',
          color: '#ffd93d', stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5);

        this.tweens.add({
          targets: trophy,
          y: trophyY - 4,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Star decorations
        const starL = this.add.text(pos.x - 100, trophyY, '★', {
          fontSize: '16px', fontFamily: 'Courier New', color: '#ffd93d',
        }).setOrigin(0.5);
        const starR = this.add.text(pos.x + 100, trophyY, '★', {
          fontSize: '16px', fontFamily: 'Courier New', color: '#ffd93d',
        }).setOrigin(0.5);

        this.tweens.add({
          targets: [starL, starR],
          alpha: { from: 0.4, to: 1 },
          duration: 800,
          yoyo: true,
          repeat: -1,
        });
      }
    }
  }

  _drawPlayerAvatar(x, y, color) {
    const g = this.add.graphics();
    const w = 30, h = 44;

    // Shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(x, y + h / 2, 24, 10);

    // Body diamond
    g.fillStyle(color);
    g.beginPath();
    g.moveTo(x, y - h / 2 + 10);
    g.lineTo(x + w / 2, y);
    g.lineTo(x, y + h / 2 - 4);
    g.lineTo(x - w / 2, y);
    g.closePath();
    g.fillPath();

    // Highlight
    g.lineStyle(2, 0xffffff, 0.2);
    g.strokePath();

    // Head
    g.fillStyle(0xffeaa7);
    g.fillCircle(x, y - h / 2 + 10, 7);

    // Glow
    g.lineStyle(2, color, 0.3);
    g.strokeCircle(x, y, h / 2 + 5);
  }

  // ----------------------------------------------------------
  //  Full Score List
  // ----------------------------------------------------------
  _drawScoreList(sorted) {
    const startY = 400;

    this.add.text(640, startY, t('end_ranking'), {
      fontSize: '14px', fontFamily: 'Orbitron, Courier New', fontStyle: 'bold',
      color: '#667', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    const sep = this.add.graphics();
    sep.lineStyle(1, 0x222244);
    sep.lineBetween(420, startY + 20, 860, startY + 20);

    for (let i = 0; i < sorted.length; i++) {
      const player = sorted[i];
      const y = startY + 38 + i * 30;
      const colorHex = PLAYER_COLORS_HEX[player.color] || '#888';

      // Row background
      if (i % 2 === 0) {
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x111128, 0.3);
        rowBg.fillRoundedRect(430, y - 12, 420, 26, 4);
      }

      this.add.text(450, y, `${i + 1}.`, {
        fontSize: '14px', fontFamily: 'Share Tech Mono, Courier New', color: '#556',
      }).setOrigin(0, 0.5);

      // Color dot
      const dotG = this.add.graphics();
      dotG.fillStyle(PLAYER_COLORS_INT[player.color] || 0x888888);
      dotG.fillCircle(480, y, 5);

      this.add.text(500, y, player.name, {
        fontSize: '14px', fontFamily: 'Share Tech Mono, Courier New', fontStyle: 'bold',
        color: colorHex,
      }).setOrigin(0, 0.5);

      this.add.text(830, y, `${player.score} pts`, {
        fontSize: '14px', fontFamily: 'Orbitron, Courier New', fontStyle: 'bold',
        color: '#ffd93d',
      }).setOrigin(1, 0.5);
    }
  }

  // ----------------------------------------------------------
  //  Special Titles
  // ----------------------------------------------------------
  _drawSpecialTitles(sorted) {
    if (sorted.length < 2) return;

    const badges = [];

    const mostKOs = [...sorted].sort((a, b) => b.kos - a.kos)[0];
    if (mostKOs && mostKOs.kos > 0) {
      badges.push({
        title: t('end_saboteur'),
        subtitle: `${mostKOs.name} (${mostKOs.kos} KOs)`,
        color: '#e74c3c',
        icon: '⚡',
      });
    }

    const lowestScore = sorted[sorted.length - 1];
    if (lowestScore && sorted.length >= 2) {
      badges.push({
        title: t('end_intern'),
        subtitle: lowestScore.name,
        color: '#95a5a6',
        icon: '📋',
      });
    }

    const baseX = 640;
    const baseY = 568;
    const spacing = 240;
    const startX = baseX - ((badges.length - 1) * spacing) / 2;

    badges.forEach((badge, i) => {
      const bx = startX + i * spacing;

      const bg = this.add.graphics();
      bg.fillStyle(0x111128, 0.8);
      bg.fillRoundedRect(bx - 115, baseY - 22, 230, 52, 8);
      bg.lineStyle(1, 0x222244);
      bg.strokeRoundedRect(bx - 115, baseY - 22, 230, 52, 8);

      this.add.text(bx, baseY - 5, `${badge.icon} ${badge.title}`, {
        fontSize: '13px', fontFamily: 'Orbitron, Courier New', fontStyle: 'bold',
        color: badge.color, stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);

      this.add.text(bx, baseY + 16, badge.subtitle, {
        fontSize: '11px', fontFamily: 'Share Tech Mono, Courier New', color: '#889',
      }).setOrigin(0.5);
    });
  }

  // ----------------------------------------------------------
  //  Replay Button
  // ----------------------------------------------------------
  _drawReplayButton() {
    const cx = 640, y = 660;
    const w = 320, h = 50;

    const bg = this.add.graphics();
    bg.fillStyle(0x2ecc71, 0.9);
    bg.fillRoundedRect(cx - w / 2, y - h / 2, w, h, 10);

    // Subtle shine
    const shine = this.add.graphics();
    shine.fillStyle(0xffffff, 0.08);
    shine.fillRoundedRect(cx - w / 2 + 4, y - h / 2 + 4, w - 8, h / 2 - 4, { tl: 8, tr: 8, bl: 0, br: 0 });

    const txt = this.add.text(cx, y, t('end_replay'), {
      fontSize: '18px', fontFamily: 'Orbitron, Courier New', fontStyle: 'bold',
      color: '#fff',
    }).setOrigin(0.5);

    const zone = this.add.zone(cx, y, w, h).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x27ae60, 1);
      bg.fillRoundedRect(cx - w / 2, y - h / 2, w, h, 10);
      txt.setScale(1.05);
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2ecc71, 0.9);
      bg.fillRoundedRect(cx - w / 2, y - h / 2, w, h, 10);
      txt.setScale(1);
    });

    zone.on('pointerdown', () => {
      document.getElementById('pregame-overlay').classList.remove('hidden');
      this.scene.start('MenuScene');
    });
  }

  // ----------------------------------------------------------
  //  Particle Effects
  // ----------------------------------------------------------
  _addParticles(saved) {
    // Floating particles for ambiance
    const particles = this.add.graphics().setDepth(-1);
    const color = saved ? 0x2ecc71 : 0xff4444;

    for (let i = 0; i < 30; i++) {
      const px = Math.random() * 1280;
      const py = Math.random() * 720;
      const size = Math.random() * 2 + 0.5;
      const alpha = Math.random() * 0.3 + 0.05;
      particles.fillStyle(color, alpha);
      particles.fillCircle(px, py, size);
    }

    // Animated floating dots
    for (let i = 0; i < 8; i++) {
      const dot = this.add.graphics().setDepth(-1);
      dot.fillStyle(color, 0.3);
      dot.fillCircle(0, 0, Math.random() * 3 + 1);
      dot.x = Math.random() * 1280;
      dot.y = Math.random() * 720;

      this.tweens.add({
        targets: dot,
        y: dot.y - 50 - Math.random() * 100,
        alpha: 0,
        duration: 3000 + Math.random() * 3000,
        repeat: -1,
        delay: Math.random() * 2000,
      });
    }
  }
}

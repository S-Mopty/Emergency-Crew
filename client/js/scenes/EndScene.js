// ============================================================
//  Emergency Crew - EndScene (Podium + Results)
// ============================================================

const PLAYER_COLORS_HEX = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
const PLAYER_COLORS_INT = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12];
const COLOR_NAMES = ['Bleu', 'Rouge', 'Vert', 'Orange'];

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
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0f23);
    bg.fillRect(0, 0, 1280, 720);

    // Grid lines
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a1a3e, 0.2);
    for (let i = 0; i < 1280; i += 64) grid.lineBetween(i, 0, i, 720);
    for (let j = 0; j < 720; j += 32) grid.lineBetween(0, j, 1280, j);

    // Station status
    const saved = this.stability > 0;
    const statusText = saved ? 'STATION SAUVEE !' : 'STATION DETRUITE...';
    const statusColor = saved ? '#2ecc71' : '#ff0000';

    this.add.text(640, 40, statusText, {
      fontSize: '36px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: statusColor, stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    if (saved) {
      this.add.text(640, 80, `Stabilite finale: ${Math.round(this.stability)}%`, {
        fontSize: '16px', fontFamily: 'Courier New', color: '#aaa',
      }).setOrigin(0.5);
    }

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

    // Leave room if still connected
    if (this.room) {
      try { this.room.leave(); } catch (e) { /* ignore */ }
      this.room = null;
    }
  }

  _getSortedPlayers() {
    const players = [];
    for (const [sessionId, data] of Object.entries(this.scores)) {
      players.push({
        sessionId,
        score: data.score || 0,
        name: data.name || COLOR_NAMES[data.color] || '???',
        color: data.color !== undefined ? data.color : 0,
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

    const podiumY = 300;
    const positions = [
      { x: 640, y: podiumY, h: 120, place: 1 }, // 1st center
      { x: 440, y: podiumY, h: 80,  place: 2 }, // 2nd left
      { x: 840, y: podiumY, h: 50,  place: 3 }, // 3rd right
    ];

    for (let i = 0; i < Math.min(sorted.length, 3); i++) {
      const pos = positions[i];
      const player = sorted[i];
      const colorInt = PLAYER_COLORS_INT[player.color] || 0x888888;
      const colorHex = PLAYER_COLORS_HEX[player.color] || '#888';

      // Podium block
      const g = this.add.graphics();
      g.fillStyle(colorInt, 0.3);
      g.fillRoundedRect(pos.x - 70, pos.y + 40 - pos.h, 140, pos.h, 6);
      g.lineStyle(2, colorInt, 0.8);
      g.strokeRoundedRect(pos.x - 70, pos.y + 40 - pos.h, 140, pos.h, 6);

      // Place number
      this.add.text(pos.x, pos.y + 40 - pos.h + 10, `#${pos.place}`, {
        fontSize: '16px', fontFamily: 'Courier New', fontStyle: 'bold',
        color: '#fff', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5, 0);

      // Player avatar (diamond shape)
      this._drawPlayerAvatar(pos.x, pos.y - pos.h - 20, colorInt);

      // Player name
      this.add.text(pos.x, pos.y + 40 - pos.h + 30, player.name, {
        fontSize: '14px', fontFamily: 'Courier New', fontStyle: 'bold',
        color: colorHex,
      }).setOrigin(0.5, 0);

      // Score
      this.add.text(pos.x, pos.y + 40 - pos.h + 50, `${player.score} pts`, {
        fontSize: '18px', fontFamily: 'Courier New', fontStyle: 'bold',
        color: '#ffd93d', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5, 0);

      // Employee of the Month for 1st place
      if (i === 0) {
        const trophy = this.add.text(pos.x, pos.y - pos.h - 65, 'EMPLOYE DU MOIS', {
          fontSize: '18px', fontFamily: 'Courier New', fontStyle: 'bold',
          color: '#ffd93d', stroke: '#000', strokeThickness: 3,
        }).setOrigin(0.5);

        // Trophy animation
        this.tweens.add({
          targets: trophy,
          y: trophy.y - 5,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Star decorations
        this.add.text(pos.x - 110, pos.y - pos.h - 65, '*', {
          fontSize: '24px', fontFamily: 'Courier New', color: '#ffd93d',
        }).setOrigin(0.5);
        this.add.text(pos.x + 110, pos.y - pos.h - 65, '*', {
          fontSize: '24px', fontFamily: 'Courier New', color: '#ffd93d',
        }).setOrigin(0.5);
      }
    }
  }

  _drawPlayerAvatar(x, y, color) {
    const g = this.add.graphics();
    const w = 28, h = 40;

    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(x, y + h / 2, 22, 10);

    // Body
    g.fillStyle(color);
    g.beginPath();
    g.moveTo(x, y - h / 2 + 10);
    g.lineTo(x + w / 2, y);
    g.lineTo(x, y + h / 2 - 4);
    g.lineTo(x - w / 2, y);
    g.closePath();
    g.fillPath();
    g.lineStyle(2, 0xffffff, 0.3);
    g.strokePath();

    // Head
    g.fillStyle(0xffeaa7);
    g.fillCircle(x, y - h / 2 + 10, 6);
  }

  // ----------------------------------------------------------
  //  Full Score List
  // ----------------------------------------------------------
  _drawScoreList(sorted) {
    const startY = 430;

    this.add.text(640, startY, 'CLASSEMENT FINAL', {
      fontSize: '16px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#888', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Separator
    const sep = this.add.graphics();
    sep.lineStyle(1, 0x333366);
    sep.lineBetween(440, startY + 20, 840, startY + 20);

    for (let i = 0; i < sorted.length; i++) {
      const player = sorted[i];
      const y = startY + 35 + i * 28;
      const colorHex = PLAYER_COLORS_HEX[player.color] || '#888';

      // Rank
      this.add.text(460, y, `${i + 1}.`, {
        fontSize: '14px', fontFamily: 'Courier New',
        color: '#666',
      }).setOrigin(0, 0.5);

      // Name
      this.add.text(500, y, player.name, {
        fontSize: '14px', fontFamily: 'Courier New', fontStyle: 'bold',
        color: colorHex,
      }).setOrigin(0, 0.5);

      // Score
      this.add.text(800, y, `${player.score} pts`, {
        fontSize: '14px', fontFamily: 'Courier New', fontStyle: 'bold',
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

    // LE SABOTEUR: most KOs
    const mostKOs = [...sorted].sort((a, b) => b.kos - a.kos)[0];
    if (mostKOs && mostKOs.kos > 0) {
      badges.push({
        title: 'LE SABOTEUR',
        subtitle: `${mostKOs.name} (${mostKOs.kos} KOs)`,
        color: '#e74c3c',
      });
    }

    // LE STAGIAIRE: lowest score
    const lowestScore = sorted[sorted.length - 1];
    if (lowestScore && sorted.length >= 2) {
      badges.push({
        title: 'LE STAGIAIRE',
        subtitle: lowestScore.name,
        color: '#95a5a6',
      });
    }

    // Draw badges at the bottom
    const baseX = 640;
    const baseY = 610;
    const spacing = 260;
    const startX = baseX - ((badges.length - 1) * spacing) / 2;

    badges.forEach((badge, i) => {
      const bx = startX + i * spacing;

      // Badge background
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a3e, 0.8);
      bg.fillRoundedRect(bx - 100, baseY - 20, 200, 50, 6);
      bg.lineStyle(1, 0x333366);
      bg.strokeRoundedRect(bx - 100, baseY - 20, 200, 50, 6);

      this.add.text(bx, baseY - 5, badge.title, {
        fontSize: '14px', fontFamily: 'Courier New', fontStyle: 'bold',
        color: badge.color, stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);

      this.add.text(bx, baseY + 16, badge.subtitle, {
        fontSize: '11px', fontFamily: 'Courier New',
        color: '#aaa',
      }).setOrigin(0.5);
    });
  }

  // ----------------------------------------------------------
  //  Replay Button
  // ----------------------------------------------------------
  _drawReplayButton() {
    const cx = 640, y = 680;
    const w = 240, h = 44;

    const bg = this.add.graphics();
    bg.fillStyle(0x2ecc71, 0.9);
    bg.fillRoundedRect(cx - w / 2, y - h / 2, w, h, 8);

    const txt = this.add.text(cx, y, 'REJOUER', {
      fontSize: '20px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#fff',
    }).setOrigin(0.5);

    const zone = this.add.zone(cx, y, w, h).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x27ae60, 1);
      bg.fillRoundedRect(cx - w / 2, y - h / 2, w, h, 8);
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2ecc71, 0.9);
      bg.fillRoundedRect(cx - w / 2, y - h / 2, w, h, 8);
    });

    zone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}

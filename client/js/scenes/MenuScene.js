// ============================================================
//  Emergency Crew - MenuScene (Title + Lobby)
// ============================================================

const SERVER_URL = window.location.hostname === 'localhost'
  ? 'ws://localhost:3000'
  : 'wss://emergency-crew-server.onrender.com';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.client = null;
    this.room = null;
    this.inLobby = false;
    this.lobbyElements = [];
    this.menuElements = [];
    this.playerSlots = [];
  }

  create() {
    this.client = new Colyseus.Client(SERVER_URL);
    this.inLobby = false;
    this.lobbyElements = [];
    this.menuElements = [];
    this.playerSlots = [];
    this.room = null;

    this._drawMenu();
  }

  // ----------------------------------------------------------
  //  Title Screen
  // ----------------------------------------------------------
  _drawMenu() {
    const cx = 640, cy = 360;

    // Background decoration
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0f23);
    bg.fillRect(0, 0, 1280, 720);
    this.menuElements.push(bg);

    // Animated grid lines for ambiance
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a1a3e, 0.3);
    for (let i = 0; i < 1280; i += 64) {
      grid.lineBetween(i, 0, i, 720);
    }
    for (let j = 0; j < 720; j += 32) {
      grid.lineBetween(0, j, 1280, j);
    }
    this.menuElements.push(grid);

    // Title
    const title = this.add.text(cx, 160, 'EMERGENCY CREW', {
      fontSize: '64px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ff6b6b',
      stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.menuElements.push(title);

    // Flicker animation on title
    this.tweens.add({
      targets: title,
      alpha: { from: 1, to: 0.7 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    const subtitle = this.add.text(cx, 230, 'Survie Cooperative', {
      fontSize: '22px', fontFamily: 'Courier New',
      color: '#ffd93d',
    }).setOrigin(0.5);
    this.menuElements.push(subtitle);

    // Create button
    const createBtn = this._makeButton(cx, 360, 'CREER UNE PARTIE', () => {
      this._createRoom();
    });
    this.menuElements.push(...createBtn);

    // Join button
    const joinBtn = this._makeButton(cx, 430, 'REJOINDRE', () => {
      this._showJoinInput();
    });
    this.menuElements.push(...joinBtn);

    // Version text
    const ver = this.add.text(cx, 680, 'v0.1 - Prototype', {
      fontSize: '12px', fontFamily: 'Courier New', color: '#555',
    }).setOrigin(0.5);
    this.menuElements.push(ver);
  }

  _makeButton(x, y, label, callback) {
    const w = 320, h = 50;
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a3e);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    bg.lineStyle(2, 0xffd93d, 0.8);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);

    const txt = this.add.text(x, y, label, {
      fontSize: '20px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ffd93d',
    }).setOrigin(0.5);

    // Hit zone
    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2a2a5e);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      bg.lineStyle(2, 0xffd93d, 1);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      txt.setColor('#fff');
    });
    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1a1a3e);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      bg.lineStyle(2, 0xffd93d, 0.8);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      txt.setColor('#ffd93d');
    });
    zone.on('pointerdown', callback);

    return [bg, txt, zone];
  }

  // ----------------------------------------------------------
  //  Join Input (uses hidden DOM input)
  // ----------------------------------------------------------
  _showJoinInput() {
    const input = document.getElementById('room-input');
    input.classList.add('visible');
    input.value = '';
    input.focus();

    const handler = (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const roomId = input.value.trim();
        input.classList.remove('visible');
        input.removeEventListener('keydown', handler);
        this._joinRoom(roomId);
      }
      if (e.key === 'Escape') {
        input.classList.remove('visible');
        input.removeEventListener('keydown', handler);
      }
    };
    input.addEventListener('keydown', handler);
  }

  // ----------------------------------------------------------
  //  Colyseus Room Management
  // ----------------------------------------------------------
  async _createRoom() {
    try {
      this.room = await this.client.create('game');
      this._enterLobby();
    } catch (err) {
      console.error('Failed to create room:', err);
      this._showError('Impossible de creer la partie. Le serveur est-il lance ?');
    }
  }

  async _joinRoom(roomId) {
    try {
      this.room = await this.client.joinById(roomId);
      this._enterLobby();
    } catch (err) {
      console.error('Failed to join room:', err);
      this._showError('Impossible de rejoindre. Verifiez le code salle.');
    }
  }

  _showError(message) {
    const txt = this.add.text(640, 520, message, {
      fontSize: '16px', fontFamily: 'Courier New',
      color: '#ff6b6b', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.menuElements.push(txt);
    this.time.delayedCall(3000, () => txt.destroy());
  }

  // ----------------------------------------------------------
  //  Lobby View
  // ----------------------------------------------------------
  _enterLobby() {
    this.inLobby = true;

    // Clear menu
    this.menuElements.forEach(el => el.destroy());
    this.menuElements = [];

    this._drawLobby();
    this._setupRoomListeners();
  }

  _drawLobby() {
    const cx = 640;
    const COLORS = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12];
    const COLOR_NAMES = ['Bleu', 'Rouge', 'Vert', 'Orange'];

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0f23);
    bg.fillRect(0, 0, 1280, 720);
    this.lobbyElements.push(bg);

    // Grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a1a3e, 0.3);
    for (let i = 0; i < 1280; i += 64) grid.lineBetween(i, 0, i, 720);
    for (let j = 0; j < 720; j += 32) grid.lineBetween(0, j, 1280, j);
    this.lobbyElements.push(grid);

    // Title
    const title = this.add.text(cx, 60, 'SALLE D\'ATTENTE', {
      fontSize: '36px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#ffd93d', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.lobbyElements.push(title);

    // Room ID display
    const roomId = this.room.roomId || this.room.id || '???';
    const idLabel = this.add.text(cx, 110, `Code salle: ${roomId}`, {
      fontSize: '20px', fontFamily: 'Courier New',
      color: '#2ecc71', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.lobbyElements.push(idLabel);

    const copyHint = this.add.text(cx, 135, '(partagez ce code pour inviter des joueurs)', {
      fontSize: '13px', fontFamily: 'Courier New', color: '#666',
    }).setOrigin(0.5);
    this.lobbyElements.push(copyHint);

    // Player slots (4 positions)
    this.playerSlots = [];
    for (let i = 0; i < 4; i++) {
      const slotX = 280 + i * 240;
      const slotY = 320;

      // Slot background
      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x1a1a3e, 0.6);
      slotBg.fillRoundedRect(slotX - 80, slotY - 100, 160, 200, 10);
      slotBg.lineStyle(2, 0x333366, 0.5);
      slotBg.strokeRoundedRect(slotX - 80, slotY - 100, 160, 200, 10);
      this.lobbyElements.push(slotBg);

      // Color circle placeholder
      const circle = this.add.graphics();
      circle.fillStyle(COLORS[i], 0.3);
      circle.fillCircle(slotX, slotY - 20, 40);
      this.lobbyElements.push(circle);

      // Name text
      const nameText = this.add.text(slotX, slotY + 50, '- vide -', {
        fontSize: '14px', fontFamily: 'Courier New',
        color: '#555',
      }).setOrigin(0.5);
      this.lobbyElements.push(nameText);

      // Color label
      const colorLabel = this.add.text(slotX, slotY + 70, COLOR_NAMES[i], {
        fontSize: '12px', fontFamily: 'Courier New',
        color: '#' + COLORS[i].toString(16).padStart(6, '0'),
      }).setOrigin(0.5);
      this.lobbyElements.push(colorLabel);

      this.playerSlots.push({ circle, nameText, slotBg, color: COLORS[i] });
    }

    // Start button (host only) - will be shown/hidden dynamically
    this.startBtnElements = this._makeLobbyButton(cx, 560, 'LANCER LA PARTIE', () => {
      if (this.room) {
        this.room.send('start_game', {});
      }
    });
    this.lobbyElements.push(...this.startBtnElements);

    // Waiting text (non-host)
    this.waitingText = this.add.text(cx, 560, 'En attente du lancement par l\'hote...', {
      fontSize: '16px', fontFamily: 'Courier New',
      color: '#888',
    }).setOrigin(0.5);
    this.lobbyElements.push(this.waitingText);

    // Player count
    this.playerCountText = this.add.text(cx, 500, 'Joueurs: 0/4', {
      fontSize: '18px', fontFamily: 'Courier New',
      color: '#aaa', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    this.lobbyElements.push(this.playerCountText);

    this._refreshLobbyUI();
  }

  _makeLobbyButton(x, y, label, callback) {
    const w = 300, h = 50;
    const bg = this.add.graphics();
    bg.fillStyle(0x2ecc71, 0.9);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);

    const txt = this.add.text(x, y, label, {
      fontSize: '20px', fontFamily: 'Courier New', fontStyle: 'bold',
      color: '#fff',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x27ae60, 1);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    });
    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2ecc71, 0.9);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    });
    zone.on('pointerdown', callback);

    return [bg, txt, zone];
  }

  _setupRoomListeners() {
    const room = this.room;

    room.state.players.onAdd(() => this._refreshLobbyUI());
    room.state.players.onRemove(() => this._refreshLobbyUI());

    // Listen for phase change to start the game
    room.state.listen('phase', (value) => {
      if (value === 'playing') {
        this._startGame();
      }
    });

    // Handle disconnection
    room.onLeave((code) => {
      console.warn('Disconnected from room, code:', code);
      if (this.scene.isActive('MenuScene')) {
        this._showError('Deconnecte du serveur.');
        this.time.delayedCall(1500, () => {
          this.lobbyElements.forEach(el => el.destroy());
          this.lobbyElements = [];
          this.inLobby = false;
          this._drawMenu();
        });
      }
    });
  }

  _refreshLobbyUI() {
    if (!this.inLobby || !this.room) return;

    const players = this.room.state.players;
    const COLOR_NAMES = ['Bleu', 'Rouge', 'Vert', 'Orange'];
    const COLORS = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12];

    // Reset all slots
    this.playerSlots.forEach((slot, i) => {
      slot.circle.clear();
      slot.circle.fillStyle(COLORS[i], 0.15);
      slot.circle.fillCircle(0, 0, 40);
      slot.circle.setPosition(280 + i * 240, 300);
      slot.nameText.setText('- vide -');
      slot.nameText.setColor('#555');
    });

    // Fill slots with actual players
    let idx = 0;
    players.forEach((player, sessionId) => {
      if (idx < 4) {
        const slot = this.playerSlots[idx];
        const colorIdx = player.color !== undefined ? player.color : idx;
        const isLocal = sessionId === this.room.sessionId;

        slot.circle.clear();
        slot.circle.fillStyle(COLORS[colorIdx], 1);
        slot.circle.fillCircle(0, 0, 40);
        slot.circle.setPosition(280 + idx * 240, 300);

        slot.nameText.setText(isLocal ? 'VOUS' : COLOR_NAMES[colorIdx]);
        slot.nameText.setColor(isLocal ? '#2ecc71' : '#fff');
      }
      idx++;
    });

    // Player count
    const count = idx;
    if (this.playerCountText) {
      this.playerCountText.setText(`Joueurs: ${count}/4`);
    }

    // Show/hide start button based on host status and player count
    const isHost = this.room.state.hostId === this.room.sessionId;
    const canStart = isHost && count >= 2;

    if (this.startBtnElements) {
      this.startBtnElements.forEach(el => el.setVisible(canStart));
    }
    if (this.waitingText) {
      if (isHost && count < 2) {
        this.waitingText.setText('Il faut au moins 2 joueurs pour lancer.');
        this.waitingText.setVisible(true);
      } else if (!isHost) {
        this.waitingText.setText('En attente du lancement par l\'hote...');
        this.waitingText.setVisible(true);
      } else {
        this.waitingText.setVisible(false);
      }
    }
  }

  _startGame() {
    // Hide DOM input if visible
    document.getElementById('room-input').classList.remove('visible');

    // Transition to GameScene, passing the room
    this.scene.start('GameScene', { room: this.room });
  }
}

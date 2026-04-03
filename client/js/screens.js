// ============================================================
//  Emergency Crew - Screen Manager
//  Visual lobby with character display + customization + ready
//  Flow: menu → lobby (waiting) → tutorial → playing → end
// ============================================================

const PLAYER_COLORS_HEX = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
const PLAYER_COLORS_CSS = [
  'var(--player-blue)', 'var(--player-red)',
  'var(--player-green)', 'var(--player-orange)',
];
const COLOR_NAMES = ['Bleu', 'Rouge', 'Vert', 'Orange'];
const CHAR_TYPE_NAMES = ['Ouvrier', 'Ingenieur', 'Technicien', 'Chef'];
const HAT_ICONS = ['', '\u26D1\uFE0F', '\uD83D\uDC51', '\uD83C\uDF89'];
const ACC_ICONS = ['', '\uD83D\uDD27', '\uD83D\uDC53', '\uD83E\uDDE3'];
const ITEM_LABELS = {
  welding_kit: 'Kit Soudure', fuse: 'Fusible', coolant: 'Refrigerant',
};
const EMERGENCY_LABELS = {
  gas_leak: 'FUITE DE GAZ', short_circuit: 'COURT-CIRCUIT', overheat: 'SURCHAUFFE',
};

const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const SERVER_URL = window.location.hostname === 'localhost'
  ? 'ws://localhost:3000'
  : `${wsProtocol}//${window.location.host}`;

export class ScreenManager {
  constructor() {
    this.client = new Colyseus.Client(SERVER_URL);
    this.room = null;
    this.phaserGame = null;
    this.currentScreen = 'menu';
    // Local customization state (preview before sending)
    this._localCharType = 0;
    this._localHat = 0;
    this._localAcc = 0;

    this._bindEvents();
  }

  // ----------------------------------------------------------
  //  Screen Transitions
  // ----------------------------------------------------------
  showScreen(screenId) {
    const current = document.getElementById(`screen-${this.currentScreen}`);
    if (current) current.classList.remove('screen--active');
    const target = document.getElementById(`screen-${screenId}`);
    if (target) target.classList.add('screen--active');

    const hud = document.getElementById('game-hud');
    if (hud) hud.style.display = screenId === 'game' ? 'block' : 'none';

    if (this.currentScreen === 'game' && screenId !== 'game' && this.phaserGame) {
      ['GameScene', 'TutorialScene'].forEach(s => {
        const sc = this.phaserGame.scene.getScene(s);
        if (sc && sc.scene.isActive()) sc.scene.stop();
      });
    }
    this.currentScreen = screenId;
  }

  // ----------------------------------------------------------
  //  DOM Event Bindings
  // ----------------------------------------------------------
  _bindEvents() {
    // Menu
    document.getElementById('btn-create').addEventListener('click', () => this.createRoom());
    document.getElementById('btn-join').addEventListener('click', () => {
      const c = document.getElementById('join-input').value.trim();
      if (c) this.joinRoom(c);
    });
    document.getElementById('join-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { const c = e.target.value.trim(); if (c) this.joinRoom(c); }
    });

    // Lobby
    document.getElementById('btn-copy-code').addEventListener('click', () => {
      const code = document.getElementById('lobby-room-code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        const c = document.getElementById('lobby-copy-confirm');
        c.classList.add('show'); setTimeout(() => c.classList.remove('show'), 1500);
      }).catch(() => window.prompt('Code salle:', code));
    });
    document.getElementById('btn-lobby-quit').addEventListener('click', () => this.leaveRoom());
    document.getElementById('btn-start-game').addEventListener('click', () => {
      if (this.room) this.room.send('start_game', {});
    });
    document.getElementById('btn-ready').addEventListener('click', () => {
      if (this.room) this.room.send('toggle_ready', {});
    });

    // Customize: open/close
    document.getElementById('btn-customize').addEventListener('click', () => this._openCustomize());
    document.getElementById('btn-close-customize').addEventListener('click', () => this._closeCustomize());
    document.getElementById('btn-validate-customize').addEventListener('click', () => this._validateCustomize());

    // Customize: character type arrows
    document.getElementById('btn-char-prev').addEventListener('click', () => {
      this._localCharType = (this._localCharType + 3) % 4;
      this._updatePreview();
    });
    document.getElementById('btn-char-next').addEventListener('click', () => {
      this._localCharType = (this._localCharType + 1) % 4;
      this._updatePreview();
    });

    // Customize: hat/accessory pickers
    document.getElementById('picker-hat').addEventListener('click', (e) => {
      const btn = e.target.closest('.cosmetic-btn'); if (!btn) return;
      this._localHat = parseInt(btn.dataset.value, 10);
      document.querySelectorAll('#picker-hat .cosmetic-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this._updatePreview();
    });
    document.getElementById('picker-accessory').addEventListener('click', (e) => {
      const btn = e.target.closest('.cosmetic-btn'); if (!btn) return;
      this._localAcc = parseInt(btn.dataset.value, 10);
      document.querySelectorAll('#picker-accessory .cosmetic-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this._updatePreview();
    });

    // Tutorial: Compris + Skip
    document.getElementById('btn-compris').addEventListener('click', () => this._onCompris());
    document.getElementById('btn-skip-tuto').addEventListener('click', () => this._onCompris());
    // End: Restart (same room) + Quit
    document.getElementById('btn-restart').addEventListener('click', () => {
      if (this.room) this.room.send('restart_game', {});
    });
    document.getElementById('btn-replay').addEventListener('click', () => this.leaveRoom());
  }

  // ----------------------------------------------------------
  //  Customization Panel
  // ----------------------------------------------------------
  _openCustomize() {
    // Load current player state into local preview
    if (this.room) {
      const lp = this.room.state.players.get(this.room.sessionId);
      if (lp) {
        this._localCharType = lp.characterType || 0;
        this._localHat = lp.hat || 0;
        this._localAcc = lp.accessory || 0;
        document.getElementById('input-nickname').value = lp.nickname || '';
      }
    }
    // Sync picker active states
    document.querySelectorAll('#picker-hat .cosmetic-btn').forEach(b =>
      b.classList.toggle('active', parseInt(b.dataset.value) === this._localHat));
    document.querySelectorAll('#picker-accessory .cosmetic-btn').forEach(b =>
      b.classList.toggle('active', parseInt(b.dataset.value) === this._localAcc));

    this._updatePreview();
    document.getElementById('customize-overlay').style.display = 'flex';
  }

  _closeCustomize() {
    document.getElementById('customize-overlay').style.display = 'none';
  }

  _validateCustomize() {
    if (!this.room) return;
    // Send all changes at once
    const nickname = document.getElementById('input-nickname').value.trim();
    if (nickname) this.room.send('set_nickname', { name: nickname });
    this.room.send('set_cosmetic', {
      hat: this._localHat,
      accessory: this._localAcc,
      characterType: this._localCharType,
    });
    this._closeCustomize();
  }

  _updatePreview() {
    const color = this.room
      ? PLAYER_COLORS_HEX[this.room.state.players.get(this.room.sessionId)?.color || 0]
      : PLAYER_COLORS_HEX[0];

    const body = document.querySelector('.preview-body');
    if (body) body.style.background = color;

    const hat = document.querySelector('.preview-hat');
    if (hat) hat.textContent = HAT_ICONS[this._localHat] || '';

    const acc = document.querySelector('.preview-acc');
    if (acc) acc.textContent = ACC_ICONS[this._localAcc] || '';

    const typeName = document.getElementById('preview-type-name');
    if (typeName) typeName.textContent = CHAR_TYPE_NAMES[this._localCharType] || 'Ouvrier';
  }

  // ----------------------------------------------------------
  //  Menu
  // ----------------------------------------------------------
  _showMessage(text, type) {
    const el = document.getElementById('menu-message');
    el.textContent = text; el.className = 'menu-message ' + (type || '');
  }
  _clearMessage() {
    const el = document.getElementById('menu-message');
    el.textContent = ''; el.className = 'menu-message';
  }
  _setMenuLoading(loading) {
    document.getElementById('btn-create').disabled = loading;
    document.getElementById('btn-join').disabled = loading;
  }

  // ----------------------------------------------------------
  //  Room Management
  // ----------------------------------------------------------
  async createRoom() {
    this._setMenuLoading(true);
    this._showMessage('Connexion au serveur...', 'loading');
    try {
      this.room = await this.client.create('game');
      this._clearMessage();
      this._enterLobby();
    } catch (err) {
      console.error('Create failed:', err);
      this._showMessage('Connexion echouee. Reessayez.', 'error');
    }
    this._setMenuLoading(false);
  }

  async joinRoom(roomId) {
    this._setMenuLoading(true);
    this._showMessage('Connexion...', 'loading');
    try {
      this.room = await this.client.joinById(roomId);
      this._clearMessage();
      this._enterLobby();
    } catch (err) {
      console.error('Join failed:', err);
      this._showMessage('Impossible de rejoindre. Verifiez le code.', 'error');
    }
    this._setMenuLoading(false);
  }

  leaveRoom() {
    if (this.room) { try { this.room.leave(); } catch(e) {} this.room = null; }
    document.getElementById('hud-tutorial-compris').style.display = 'none';
    document.getElementById('customize-overlay').style.display = 'none';
    this.showScreen('menu');
  }

  // ----------------------------------------------------------
  //  Lobby
  // ----------------------------------------------------------
  _enterLobby() {
    document.getElementById('lobby-room-code').textContent =
      this.room.roomId || this.room.id || '???';
    this.showScreen('lobby');
    this._setupRoomListeners();
    this._refreshStage();
  }

  _setupRoomListeners() {
    const room = this.room;

    room.state.players.onAdd((player) => {
      this._refreshStage();
      ['ready','nickname','hat','accessory','characterType','color'].forEach(f => {
        player.listen(f, () => this._refreshStage());
      });
    });
    room.state.players.onRemove(() => this._refreshStage());

    // Phase transitions
    room.state.listen('phase', (value) => {
      if (value === 'tutorial') {
        this._closeCustomize();
        this.showScreen('game');
        if (this.phaserGame) this.phaserGame.scene.start('TutorialScene', { room });
        // Show skip + compris buttons immediately
        this.showTutorialCompris();
      } else if (value === 'playing') {
        this._startRealGame();
      }
    });

    room.onMessage('ready_count', (data) => {
      const s = document.getElementById('compris-status');
      if (s) s.textContent = `${data.ready}/${data.total} joueurs prets`;
    });

    room.onLeave(() => {
      if (this.currentScreen === 'lobby') {
        this._showMessage('Deconnecte du serveur.', 'error');
        setTimeout(() => this.leaveRoom(), 1500);
      }
    });
  }

  _refreshStage() {
    if (!this.room) return;
    const players = this.room.state.players;
    const slots = document.querySelectorAll('.stage-player');

    // Reset all
    slots.forEach(slot => {
      slot.classList.remove('filled', 'is-ready', 'is-local');
      slot.querySelector('.stage-nickname').textContent = '- vide -';
      slot.querySelector('.stage-ready-badge').textContent = 'PAS PRET';
      slot.querySelector('.stage-type-label').textContent = '';
      slot.querySelector('.char-hat').textContent = '';
      slot.querySelector('.char-acc').textContent = '';
    });

    let idx = 0, count = 0, allReady = true;

    players.forEach((player, sessionId) => {
      if (idx >= 4) return;
      const slot = slots[idx];
      const isLocal = sessionId === this.room.sessionId;

      slot.classList.add('filled');
      if (isLocal) slot.classList.add('is-local');
      if (player.ready) {
        slot.classList.add('is-ready');
        slot.querySelector('.stage-ready-badge').textContent = 'PRET';
      } else {
        allReady = false;
      }

      // Color
      const color = PLAYER_COLORS_HEX[player.color] || PLAYER_COLORS_HEX[0];
      slot.querySelector('.char-body').style.setProperty('--player-color', color);
      slot.querySelector('.char-body').style.background = color;

      // Name + type
      slot.querySelector('.stage-nickname').textContent = player.nickname || COLOR_NAMES[player.color];
      slot.querySelector('.stage-type-label').textContent = CHAR_TYPE_NAMES[player.characterType] || '';

      // Cosmetics
      slot.querySelector('.char-hat').textContent = HAT_ICONS[player.hat] || '';
      slot.querySelector('.char-acc').textContent = ACC_ICONS[player.accessory] || '';

      idx++; count++;
    });

    // Player count
    document.getElementById('lobby-player-count').textContent = `${count}/4`;

    // Ready button
    const readyBtn = document.getElementById('btn-ready');
    const lp = players.get(this.room.sessionId);
    if (lp) {
      readyBtn.style.display = 'inline-flex';
      readyBtn.textContent = lp.ready ? 'PAS PRET' : 'PRET';
      readyBtn.classList.toggle('is-ready', lp.ready);
    }

    // Start button
    const isHost = this.room.state.hostId === this.room.sessionId;
    const canStart = isHost && count >= 2 && allReady;
    document.getElementById('btn-start-game').style.display = canStart ? 'inline-flex' : 'none';

    const w = document.getElementById('lobby-waiting');
    if (!isHost) w.textContent = "En attente de l'hote...";
    else if (count < 2) w.textContent = 'Min. 2 joueurs';
    else if (!allReady) w.textContent = 'Tout le monde doit etre pret';
    else w.textContent = '';
  }

  // ----------------------------------------------------------
  //  Game
  // ----------------------------------------------------------
  _startRealGame() {
    document.getElementById('hud-tutorial-compris').style.display = 'none';
    this.showScreen('game');
    if (this.phaserGame) {
      const ts = this.phaserGame.scene.getScene('TutorialScene');
      if (ts && ts.scene.isActive()) ts.scene.stop();
      const gs = this.phaserGame.scene.getScene('GameScene');
      if (gs && gs.scene.isActive()) gs.scene.stop();
      this.phaserGame.scene.start('GameScene', { room: this.room });
    }
  }

  showTutorialCompris() {
    const el = document.getElementById('hud-tutorial-compris');
    el.style.display = 'block';
    document.getElementById('btn-compris').disabled = false;
    document.getElementById('btn-compris').textContent = 'COMPRIS !';
    document.getElementById('btn-skip-tuto').disabled = false;
    document.getElementById('btn-skip-tuto').textContent = 'PASSER LE TUTO';
    const total = this.room ? this.room.state.players.size : '?';
    document.getElementById('compris-status').textContent = `0/${total} joueurs prets`;
  }

  _onCompris() {
    document.getElementById('btn-compris').disabled = true;
    document.getElementById('btn-compris').textContent = 'EN ATTENTE...';
    document.getElementById('btn-skip-tuto').disabled = true;
    document.getElementById('btn-skip-tuto').textContent = 'PASSE';
    if (this.room) this.room.send('tutorial_ready', {});
  }

  // ----------------------------------------------------------
  //  HUD
  // ----------------------------------------------------------
  updateHUD(data) {
    const { timer, stability, score, carriedItem, emergencies } = data;
    const sec = Math.max(0, Math.ceil(timer));
    const timerEl = document.getElementById('hud-timer');
    timerEl.textContent = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
    timerEl.classList.toggle('critical', sec <= 30);

    const fill = document.getElementById('hud-stability-fill');
    fill.style.width = `${stability}%`;
    fill.className = 'hud-stability-fill ' + (stability<30?'low':stability<60?'mid':'high');
    document.getElementById('hud-stability-text').textContent = `${Math.round(stability)}%`;
    document.getElementById('hud-score').textContent = score;

    const ce = document.getElementById('hud-carried');
    ce.textContent = carriedItem ? `Objet : ${carriedItem}` : 'Objet : aucun';
    ce.classList.toggle('empty', !carriedItem);
    document.getElementById('hud-emergencies').textContent = emergencies.join('  |  ');
  }

  showEmergencyToast(type) {
    const t = document.createElement('div');
    t.className = 'hud-toast';
    t.textContent = `! ${EMERGENCY_LABELS[type] || type} !`;
    document.getElementById('hud-toasts').appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  showDisconnect() {
    document.getElementById('hud-disconnect').classList.add('show');
    setTimeout(() => { document.getElementById('hud-disconnect').classList.remove('show'); this.leaveRoom(); }, 2500);
  }

  // ----------------------------------------------------------
  //  End Screen
  // ----------------------------------------------------------
  showEndScreen(data) {
    // Keep room alive for restart (don't leave)

    const saved = data.stability > 0;
    const st = document.getElementById('end-status');
    st.textContent = saved ? 'STATION SAUVEE !' : 'STATION DETRUITE...';
    st.className = 'end-status ' + (saved ? 'saved' : 'destroyed');
    document.getElementById('end-stability').textContent = saved ? `Stabilite : ${Math.round(data.stability)}%` : '';

    const sorted = this._sort(data.scores);
    this._podium(sorted);
    this._ranking(sorted);
    this._badges(sorted);
    this.showScreen('end');
  }

  _sort(scores) {
    const arr = [];
    for (const [sid, d] of Object.entries(scores)) {
      arr.push(typeof d === 'object'
        ? { sid, score: d.score||0, name: d.name||'???', color: d.color||0, kos: d.kos||0 }
        : { sid, score: d||0, name: '???', color: 0, kos: 0 });
    }
    return arr.sort((a,b) => b.score - a.score);
  }

  _podium(sorted) {
    [1,2,3].forEach(p => {
      const c = document.getElementById(`podium-${p}`);
      const i = p-1;
      if (i < sorted.length) {
        const pl = sorted[i], col = PLAYER_COLORS_HEX[pl.color]||'#888';
        c.style.display='flex'; c.style.flexDirection='column'; c.style.alignItems='center';
        c.querySelector('.podium-avatar').style.color=col;
        c.querySelector('.podium-avatar').style.background=col+'25';
        c.querySelector('.podium-avatar').textContent='\u25CF';
        c.querySelector('.podium-name').textContent=pl.name;
        c.querySelector('.podium-name').style.color=col;
        c.querySelector('.podium-score').textContent=`${pl.score} pts`;
      } else c.style.display='none';
    });
  }

  _ranking(sorted) {
    const c = document.getElementById('end-ranking');
    c.querySelectorAll('.ranking-row').forEach(r=>r.remove());
    sorted.forEach((p,i) => {
      const r = document.createElement('div'); r.className='ranking-row';
      r.innerHTML=`<span class="ranking-pos">${i+1}.</span><span class="ranking-name" style="color:${PLAYER_COLORS_HEX[p.color]||'#888'}">${p.name}</span><span class="ranking-score">${p.score} pts</span>`;
      c.appendChild(r);
    });
  }

  _badges(sorted) {
    const c = document.getElementById('end-badges'); c.innerHTML='';
    if (sorted.length<2) return;
    const mk = [...sorted].sort((a,b)=>b.kos-a.kos)[0];
    if (mk&&mk.kos>0) c.appendChild(this._badge('LE SABOTEUR',`${mk.name} (${mk.kos} KOs)`,'var(--color-red)'));
    c.appendChild(this._badge('LE STAGIAIRE', sorted[sorted.length-1].name, 'var(--text-muted)'));
  }

  _badge(title, sub, color) {
    const b = document.createElement('div'); b.className='glass-panel end-badge';
    b.innerHTML=`<div class="end-badge-title" style="color:${color}">${title}</div><div class="end-badge-subtitle">${sub}</div>`;
    return b;
  }
}

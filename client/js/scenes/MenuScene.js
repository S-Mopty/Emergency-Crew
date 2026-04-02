// ============================================================
//  Emergency Crew - MenuScene (Title + Lobby)
//  Full DOM-based pre-game UI
// ============================================================

import { t, t_color, getLang, setLang } from '../locale.js';

const SERVER_URL = window.location.hostname === 'localhost'
  ? 'ws://localhost:3000'
  : 'wss://emergency-crew.onrender.com';

const COLORS_HEX = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.client = null;
    this.room = null;
  }

  create() {
    this.client = new Colyseus.Client(SERVER_URL);
    this.room = null;
    this._gameStarted = false;

    this._showOverlay();
    this._applyLocaleToDOM();
    this._switchScreen('menu-screen');
    this._bindEvents();
  }

  // ----------------------------------------------------------
  //  DOM helpers
  // ----------------------------------------------------------
  _showOverlay() {
    document.getElementById('pregame-overlay').classList.remove('hidden');
  }

  _hideOverlay() {
    document.getElementById('pregame-overlay').classList.add('hidden');
  }

  _switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'join-screen') {
      setTimeout(() => document.getElementById('room-input').focus(), 50);
    }
  }

  _setError(elementId, msg) {
    const el = document.getElementById(elementId);
    el.textContent = msg;
    if (msg) setTimeout(() => { el.textContent = ''; }, 4000);
  }

  /** Push all locale strings into the static DOM elements */
  _applyLocaleToDOM() {
    const $ = (id) => document.getElementById(id);
    $('menu-title').textContent        = t('title');
    $('menu-subtitle').textContent     = t('subtitle');
    $('btn-create').textContent        = t('btn_create');
    $('btn-join').textContent          = t('btn_join');
    $('menu-version').textContent      = t('version');
    $('menu-tagline').textContent      = t('menu_tagline');
    $('join-title').textContent        = t('join_title');
    $('join-subtitle').textContent     = t('join_subtitle');
    $('room-input').placeholder        = t('join_placeholder');
    $('btn-join-confirm').textContent  = t('btn_join_confirm');
    $('btn-join-back').textContent     = t('btn_back');
    $('lobby-title').textContent       = t('lobby_title');
    $('lobby-hint').textContent        = t('lobby_hint');
    $('btn-start').textContent         = t('btn_start');

    // Language toggle label — shows current language
    $('btn-lang').textContent = getLang() === 'fr' ? 'FR' : 'EN';
  }

  // ----------------------------------------------------------
  //  Event binding
  // ----------------------------------------------------------
  _bindEvents() {
    const $ = (id) => document.getElementById(id);

    // Clone to remove old listeners
    ['btn-create', 'btn-join', 'btn-join-confirm', 'btn-join-back', 'btn-start', 'lobby-room-code', 'btn-lang'].forEach(id => {
      const el = $(id);
      if (!el) return;
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
    });
    const oldInput = $('room-input');
    const newInput = oldInput.cloneNode(true);
    oldInput.parentNode.replaceChild(newInput, oldInput);

    // Menu
    $('btn-create').addEventListener('click', () => this._createRoom());
    $('btn-join').addEventListener('click', () => this._switchScreen('join-screen'));

    // Language toggle
    $('btn-lang').addEventListener('click', () => {
      setLang(getLang() === 'fr' ? 'en' : 'fr');
      this._applyLocaleToDOM();
    });

    // Join
    $('btn-join-confirm').addEventListener('click', () => this._joinFromInput());
    $('btn-join-back').addEventListener('click', () => {
      this._switchScreen('menu-screen');
      $('room-input').value = '';
      this._setError('join-error', '');
    });
    $('room-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._joinFromInput();
      if (e.key === 'Escape') {
        this._switchScreen('menu-screen');
        $('room-input').value = '';
      }
    });

    // Lobby
    $('btn-start').addEventListener('click', () => {
      if (this.room) this.room.send('start_game', {});
    });
    $('lobby-room-code').addEventListener('click', () => {
      const code = this.room?.id || this.room?.roomId || '';
      if (code) {
        navigator.clipboard.writeText(code).then(() => {
          $('lobby-room-code').textContent = t('lobby_copied');
          setTimeout(() => {
            $('lobby-room-code').textContent = `${t('lobby_code_prefix')} ${code}`;
          }, 1200);
        });
      }
    });
  }

  // ----------------------------------------------------------
  //  Colyseus
  // ----------------------------------------------------------
  async _createRoom() {
    try {
      this.room = await this.client.create('game');
      this._enterLobby();
    } catch (err) {
      console.error('Failed to create room:', err);
      this._setError('menu-error', t('create_error'));
    }
  }

  _joinFromInput() {
    const input = document.getElementById('room-input');
    const roomId = input.value.trim();
    if (!roomId) {
      this._setError('join-error', t('join_error_empty'));
      return;
    }
    this._joinRoom(roomId);
  }

  async _joinRoom(roomId) {
    try {
      this.room = await this.client.joinById(roomId);
      this._enterLobby();
    } catch (err) {
      console.error('Failed to join room:', err);
      this._setError('join-error', t('join_error_fail'));
    }
  }

  // ----------------------------------------------------------
  //  Lobby
  // ----------------------------------------------------------
  _enterLobby() {
    this._switchScreen('lobby-screen');
    const roomId = this.room.id || this.room.roomId || '???';
    document.getElementById('lobby-room-code').textContent = `${t('lobby_code_prefix')} ${roomId}`;
    this._buildSlots();
    this._refreshLobby();
    this._setupRoomListeners();
  }

  _buildSlots() {
    const container = document.getElementById('lobby-slots');
    container.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.id = `slot-${i}`;
      slot.innerHTML = `
        <div class="dot" style="background:${COLORS_HEX[i]}"></div>
        <div class="slot-label">${t('lobby_slot_empty')}</div>
        <div class="slot-color" style="color:${COLORS_HEX[i]}">${t_color(i)}</div>
      `;
      container.appendChild(slot);
    }
  }

  _refreshLobby() {
    if (!this.room) return;
    const players = this.room.state.players;

    for (let i = 0; i < 4; i++) {
      const slot = document.getElementById(`slot-${i}`);
      if (!slot) continue;
      slot.className = 'slot';
      slot.querySelector('.slot-label').textContent = t('lobby_slot_empty');
    }

    let idx = 0;
    players.forEach((player, sessionId) => {
      if (idx >= 4) return;
      const slot = document.getElementById(`slot-${idx}`);
      if (!slot) return;
      const isLocal = sessionId === this.room.sessionId;
      const colorIdx = player.color !== undefined ? player.color : idx;

      slot.className = 'slot filled' + (isLocal ? ' local' : '');
      slot.querySelector('.dot').style.background = COLORS_HEX[colorIdx];
      slot.querySelector('.slot-label').textContent = isLocal ? t('lobby_you') : t_color(colorIdx);
      slot.querySelector('.slot-color').style.color = COLORS_HEX[colorIdx];
      slot.querySelector('.slot-color').textContent = t_color(colorIdx);
      idx++;
    });

    const count = idx;
    document.getElementById('lobby-count').textContent = `${t('lobby_players')} ${count}${t('lobby_max')}`;

    const isHost = this.room.state.hostId === this.room.sessionId;
    const canStart = isHost && count >= 2;
    const btnStart = document.getElementById('btn-start');
    const status = document.getElementById('lobby-status');

    btnStart.disabled = !canStart;
    btnStart.style.display = isHost ? 'inline-block' : 'none';

    if (isHost && count < 2) {
      status.textContent = t('lobby_need_players');
    } else if (!isHost) {
      status.textContent = t('lobby_waiting_host');
    } else {
      status.textContent = '';
    }
  }

  _setupRoomListeners() {
    const room = this.room;
    room.state.players.onAdd(() => this._refreshLobby());
    room.state.players.onRemove(() => this._refreshLobby());

    room.state.listen('phase', (value) => {
      if (value === 'playing') this._startGame();
    });

    room.onLeave((code) => {
      console.warn('Disconnected from room, code:', code);
      if (this.scene.isActive('MenuScene')) {
        this._setError('lobby-error', t('lobby_disconnected'));
        setTimeout(() => {
          this.room = null;
          this._switchScreen('menu-screen');
        }, 1500);
      }
    });
  }

  _startGame() {
    if (this._gameStarted) return;
    this._gameStarted = true;
    this._hideOverlay();
    this.scene.start('GameScene', { room: this.room });
  }
}

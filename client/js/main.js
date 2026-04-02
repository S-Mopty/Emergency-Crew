// ============================================================
//  Emergency Crew - Main Entry Point
// ============================================================

import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { EndScene }  from './scenes/EndScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#080816',
  scene: [MenuScene, GameScene, EndScene],
  roundPixels: false,
  render: {
    antialias: true,
    pixelArt: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

window.__GAME = new Phaser.Game(config);

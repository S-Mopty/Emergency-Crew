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
  backgroundColor: '#0f0f23',
  scene: [MenuScene, GameScene, EndScene],
};

new Phaser.Game(config);

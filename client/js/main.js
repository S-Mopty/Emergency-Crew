// ============================================================
//  Emergency Crew - Main Entry Point
//  Phaser for gameplay only, HTML/CSS for all UI screens
// ============================================================

import { GameScene } from './scenes/GameScene.js';
import { TutorialScene } from './scenes/TutorialScene.js';
import { ScreenManager } from './screens.js';

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },
  parent: 'game-canvas-container',
  backgroundColor: '#0f0f23',
  render: {
    roundPixels: true,
    antialias: true,
  },
  scene: [TutorialScene, GameScene],
};

const game = new Phaser.Game(config);

// Screen manager handles all HTML UI + Colyseus connection
const screenManager = new ScreenManager();
screenManager.phaserGame = game;
window.screenManager = screenManager;

export interface Vector2 {
  x: number;
  y: number;
}

export interface Ship {
  id: string;
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  upgrades: ShipUpgrades;
  lastShotTime: number;
  isPlayer: boolean;
  controls?: PlayerControls;
}

export interface ShipUpgrades {
  weaponDamage: number;
  fireRate: number;
  speed: number;
  shieldCapacity: number;
  level: number;
}

export interface PlayerControls {
  playerId: number;
  keys: {
    up: string;
    down: string;
    left: string;
    right: string;
    shoot: string;
  };
}

export interface Projectile {
  id: string;
  position: Vector2;
  velocity: Vector2;
  damage: number;
  ownerId: string;
  isPlayerProjectile: boolean;
}

export interface Enemy {
  id: string;
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  health: number;
  maxHealth: number;
  type: EnemyType;
  lastShotTime: number;
  points: number;
}

export interface Particle {
  id: string;
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface PowerUp {
  id: string;
  position: Vector2;
  type: PowerUpType;
  value: number;
}

export interface GameState {
  ships: Ship[];
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  powerUps: PowerUp[];
  wave: number;
  score: number;
  gameMode: GameMode;
  gameStatus: GameStatus;
  canvas: {
    width: number;
    height: number;
  };
}

export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  HEAVY = 'heavy',
  SHOOTER = 'shooter'
}

export enum PowerUpType {
  HEALTH = 'health',
  SHIELD = 'shield',
  WEAPON = 'weapon',
  SPEED = 'speed'
}

export enum GameMode {
  SINGLE_PLAYER = 'single',
  LOCAL_MULTIPLAYER = 'multiplayer'
}

export enum GameStatus {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  UPGRADING = 'upgrading',
  GAME_OVER = 'game_over'
}
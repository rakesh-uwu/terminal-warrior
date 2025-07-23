export enum GameScreen {
  MAIN_MENU = 0,
  LEVELS = 1,
  PLAYING = 2,
  GAME_OVER = 3,
  VICTORY = 4,
  INSTRUCTIONS = 5,
  CHARACTER_CUSTOMIZATION = 6,
  BOSS_BATTLE = 7,
}

export enum TileType {
  EMPTY = 0,
  TERMINAL_BLOCK = 1,
  DATA_TUNNEL = 2,
  MEMORY_PLATFORM = 3,
  ANTIVIRUS_LASER = 4,
  DATA_PIT = 5,
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
  intersects(other: Rectangle): boolean
}

export interface EnemyData {
  type: string
  x: number
  y: number
  patrolDistance?: number
}

export interface CollectibleData {
  type: string
  x: number
  y: number
  value: number
}

export interface PowerUpData {
  type: string
  x: number
  y: number
}

export type WeaponUpgradeType = "rapidFire" | "piercing" | "spread" | "power"

export interface WeaponUpgradeData {
  type: WeaponUpgradeType
  x: number
  y: number
  level: number
}

export interface MovingPlatformData {
  x: number
  y: number
  path: { x: number; y: number }[]
  speed: number
  delay?: number
}

export interface ForceFieldData {
  x: number
  y: number
  width: number
  height: number
  activationDelay: number
  activeDuration: number
  inactiveDuration: number
}

export interface SpikeTrapData {
  x: number
  y: number
  activationDelay: number
  activeDuration: number
  inactiveDuration: number
}

export interface BossData {
  type: string
  x: number
  y: number
  health: number
  attackPattern: string[]
}

export interface LevelData {
  id: number
  name: string
  width: number
  height: number
  startX: number
  startY: number
  tiles: number[][]
  enemies: EnemyData[]
  collectibles: CollectibleData[]
  powerUps: PowerUpData[]
  weaponUpgrades: WeaponUpgradeData[]
  movingPlatforms: MovingPlatformData[]
  forceFields: ForceFieldData[]
  spikeTraps: SpikeTrapData[]
  boss?: BossData
}

export interface Bullet {
  x: number
  y: number
  velocityX: number
  velocityY: number
  isActive: boolean
  isEnemyBullet: boolean
  type: string
  update(deltaTime: number, level: any, isGravityReversed: boolean): void
  render(ctx: CanvasRenderingContext2D, cameraX: number): void
  getBounds(): Rectangle
}

export interface GameState {
  screen: GameScreen
  currentLevelIndex: number
  isPaused: boolean
  transitionAlpha: number
  transitionTimer: number
  isTransitioning: boolean
  nextScreen: GameScreen | null
  lives: number
  fragments: number
  totalFragments: number
  score: number
  gameTime: number
  gravityReversalUses: number
  isGravityReversed: boolean
  gravityReversalTimer: number
  debugPulseReady: boolean
  dashCooldownTimer: number
  isDashing: boolean
  powerUps: {
    firewallShield: number
    overclockChip: number
    debugPulse: number
    restorePoint: boolean
    timeWarp: number
    dataOverload: number
  }
  weaponUpgrades: {
    rapidFire: number
    piercing: number
    spread: number
    power: number
  }
  bullets: Bullet[]
  enemyBullets: Bullet[]
  menuSelection: number
  levelSelection: number
  playerCharacterSymbol: string
  playerColor: string
  isBossActive: boolean
  bossHealth: number
  bossMaxHealth: number
  bossType: string
}

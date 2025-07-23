import { type LevelData, TileType, type MovingPlatformData, type ForceFieldData, type SpikeTrapData } from "./types"
export const levels: LevelData[] = Array.from({ length: 20 }, (_, index) => {
  const levelId = index + 1
  const difficulty = Math.floor(index / 4) + 1 

  const level: LevelData = {
    id: levelId,
    name: `SECTOR ${levelId.toString().padStart(2, "0")}`,
    width: 2000 + index * 200, 
    height: 600,
    startX: 50,
    startY: 400,
    tiles: generateLevelTiles(levelId, difficulty),
    enemies: generateEnemies(levelId, difficulty),
    collectibles: generateCollectibles(levelId, difficulty),
    powerUps: generatePowerUps(levelId, difficulty),
    weaponUpgrades: generateWeaponUpgrades(levelId, difficulty), 
    movingPlatforms: generateMovingPlatforms(levelId, difficulty),
    forceFields: generateForceFields(levelId, difficulty),
    spikeTraps: generateSpikeTraps(levelId, difficulty),
  }
  if (levelId === 5) {
    level.boss = {
      type: "kernelWarden",
      x: level.width - 150,
      y: 300,
      health: 1000,
      attackPattern: ["projectileBurst", "chargeAttack"],
    }
    level.enemies = [] 
  } else if (levelId === 10) {
    level.boss = {
      type: "dataOverlord",
      x: level.width - 150,
      y: 200,
      health: 1500,
      attackPattern: ["plasmaBarrage", "dataDrain"],
    }
    level.enemies = []
  } else if (levelId === 15) {
    level.boss = {
      type: "cyberneticGuardian",
      x: level.width - 150,
      y: 350,
      health: 2000,
      attackPattern: ["laserSweep", "shieldBash"],
    }
    level.enemies = []
  } else if (levelId === 20) {
    level.boss = {
      type: "voidEntity",
      x: level.width - 150,
      y: 250,
      health: 2500,
      attackPattern: ["distortionWave", "shadowClone"],
    }
    level.enemies = []
  }
  return level
})

function generateLevelTiles(levelId: number, difficulty: number): number[][] {
  const width = Math.floor((2000 + (levelId - 1) * 200) / 32)
  const height = Math.floor(600 / 32)
  const tiles: number[][] = []
  for (let y = 0; y < height; y++) {
    tiles[y] = new Array(width).fill(TileType.EMPTY)
  }
  const groundLevel = height - 3
  for (let x = 0; x < width; x++) {
    if (Math.random() > 0.1) {
      tiles[groundLevel][x] = TileType.TERMINAL_BLOCK
      if (Math.random() > 0.7) {
        tiles[groundLevel - 1][x] = TileType.TERMINAL_BLOCK
      }
    }
  }
  const platformCount = 3 + difficulty
  for (let i = 0; i < platformCount; i++) {
    const x = Math.floor(Math.random() * (width - 10)) + 5
    const y = Math.floor(Math.random() * (groundLevel - 5)) + 3
    const length = 3 + Math.floor(Math.random() * 5)

    for (let j = 0; j < length && x + j < width; j++) {
      tiles[y][x + j] = Math.random() > 0.5 ? TileType.TERMINAL_BLOCK : TileType.MEMORY_PLATFORM
    }
  }
  const tunnelCount = 1 + Math.floor(difficulty / 2)
  for (let i = 0; i < tunnelCount; i++) {
    const x = Math.floor(Math.random() * (width - 20)) + 10
    const height_tunnel = 3 + Math.floor(Math.random() * 4)

    for (let j = 0; j < height_tunnel; j++) {
      if (groundLevel - j >= 0) {
        tiles[groundLevel - j][x] = TileType.DATA_TUNNEL
      }
    }
  }
  if (difficulty > 2) {
    const hazardCount = difficulty - 2
    for (let i = 0; i < hazardCount; i++) {
      const x = Math.floor(Math.random() * (width - 10)) + 5
      const y = groundLevel - 1
      tiles[y][x] = TileType.ANTIVIRUS_LASER
    }
  }
  return tiles
}
function generateEnemies(levelId: number, difficulty: number): any[] {
  const enemies = []
  const baseEnemyCount = 2 + difficulty * 2
  const styleGroup = Math.floor((levelId - 1) / 5)

  let availableEnemyTypes: string[] = []
  switch (styleGroup) {
    case 0: 
      availableEnemyTypes = ["glitchBug", "firewallDrone", "sentinelBot"]
      break
    case 1: 
      availableEnemyTypes = ["glitchBug", "firewallDrone", "dataLeech"]
      break
    case 2: 
      availableEnemyTypes = ["glitchBug", "firewallDrone", "plasmaTurret"]
      break
    case 3: 
      availableEnemyTypes = ["glitchBug", "firewallDrone", "shadowCrawler"]
      break
  }

  for (let i = 0; i < baseEnemyCount; i++) {
    const x = 200 + i * 300 + Math.random() * 100
    const y = 350
    const type = availableEnemyTypes[Math.floor(Math.random() * availableEnemyTypes.length)]

    enemies.push({
      type,
      x,
      y,
      patrolDistance: 80 + Math.random() * 40,
    })
  }

  return enemies
}

function generateCollectibles(levelId: number, difficulty: number): any[] {
  const collectibles = []
  const collectibleCount = 15 + difficulty * 5

  for (let i = 0; i < collectibleCount; i++) {
    const x = 100 + i * 80 + Math.random() * 40
    const y = 300 + Math.random() * 100
    const type = Math.random() > 0.3 ? "codeFragment" : "dataChunk"
    const value = type === "codeFragment" ? 1 : 5

    collectibles.push({
      type,
      x,
      y,
      value,
    })
  }
  return collectibles
}
function generatePowerUps(levelId: number, difficulty: number): any[] {
  const powerUps = []
  const basePowerUpTypes = ["firewallShield", "overclockChip", "debugPulse", "restorePoint"]
  const newPowerUpTypes = ["timeWarp", "dataOverload"] 
  const allPowerUpTypes = basePowerUpTypes.concat(newPowerUpTypes)
  const powerUpCount = 1 + Math.floor(difficulty / 2)
  for (let i = 0; i < powerUpCount; i++) {
    const x = 400 + i * 600 + Math.random() * 200
    const y = 250 + Math.random() * 100
    const type = allPowerUpTypes[Math.floor(Math.random() * allPowerUpTypes.length)]

    powerUps.push({
      type,
      x,
      y,
    })
  }
  return powerUps
}

function generateWeaponUpgrades(levelId: number, difficulty: number): any[] {
  const upgrades: any[] = []
  const upgradeTypes = ["rapidFire", "piercing", "spread", "power"]
  const upgradeCount = Math.floor(difficulty / 2) + (levelId > 10 ? 1 : 0)
  for (let i = 0; i < upgradeCount; i++) {
    const x = 800 + i * 800 + Math.random() * 200
    const y = 200 + Math.random() * 150
    const type = upgradeTypes[Math.floor(Math.random() * upgradeTypes.length)]
    const level = Math.min(3, Math.floor(difficulty / 2) + 1) 

    upgrades.push({
      type,
      x,
      y,
      level,
    })
  }

  return upgrades
}

// New functions for interactive elements
function generateMovingPlatforms(levelId: number, difficulty: number): MovingPlatformData[] {
  const platforms: MovingPlatformData[] = []
  const numPlatforms = Math.floor(difficulty / 2) + 1 

  for (let i = 0; i < numPlatforms; i++) {
    const startX = 500 + i * 500 + Math.random() * 100
    const startY = 300 + Math.random() * 100
    const pathType = Math.random() 

    if (pathType < 0.5) {
      platforms.push({
        x: startX,
        y: startY,
        path: [
          { x: startX, y: startY },
          { x: startX + 150, y: startY },
        ],
        speed: 50 + difficulty * 5,
        delay: 1 + Math.random() * 1,
      })
    } else {
      platforms.push({
        x: startX,
        y: startY,
        path: [
          { x: startX, y: startY },
          { x: startX, y: startY - 100 },
        ],
        speed: 40 + difficulty * 5,
        delay: 1 + Math.random() * 1,
      })
    }
  }
  return platforms
}

function generateForceFields(levelId: number, difficulty: number): ForceFieldData[] {
  const fields: ForceFieldData[] = []
  const numFields = Math.floor(difficulty / 3) 

  if (difficulty >= 3) {
    for (let i = 0; i < numFields; i++) {
      const x = 700 + i * 700 + Math.random() * 100
      const y = 200 + Math.random() * 150
      const width = 32 + Math.floor(Math.random() * 3) * 32 
      const height = 64 + Math.floor(Math.random() * 2) * 32 

      fields.push({
        x,
        y,
        width,
        height,
        activationDelay: 2 + Math.random() * 1,
        activeDuration: 1.5 + Math.random() * 1,
        inactiveDuration: 2 + Math.random() * 1,
      })
    }
  }
  return fields
}

function generateSpikeTraps(levelId: number, difficulty: number): SpikeTrapData[] {
  const traps: SpikeTrapData[] = []
  const numTraps = Math.floor(difficulty / 2) 

  if (difficulty >= 2) {
    for (let i = 0; i < numTraps; i++) {
      const x = 600 + i * 600 + Math.random() * 100
      const y = 448 

      traps.push({
        x,
        y,
        activationDelay: 1 + Math.random() * 1,
        activeDuration: 0.8 + Math.random() * 0.5,
        inactiveDuration: 1.5 + Math.random() * 1,
      })
    }
  }
  return traps
}

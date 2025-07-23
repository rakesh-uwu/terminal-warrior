import { type LevelData, TileType, type GameState } from "./types"
import { Enemy } from "./enemy"
import { Collectible } from "./collectible"
import { PowerUp } from "./powerup"
import { WeaponUpgrade } from "./weapon-upgrade" 
import { MovingPlatform } from "./moving-platform" 
import { ForceField } from "./force-field" 
import { SpikeTrap } from "./spike-trap" 
import { Boss } from "./boss" 
import type { Player } from "./player"
import type { Game } from "./game" 

export class Level {
  id: number
  name: string
  width: number
  height: number
  startX: number
  startY: number
  tiles: number[][]
  enemies: Enemy[]
  collectibles: Collectible[]
  powerUps: PowerUp[]
  weaponUpgrades: WeaponUpgrade[] 
  movingPlatforms: MovingPlatform[] 
  forceFields: ForceField[]
  spikeTraps: SpikeTrap[] 
  boss: Boss | null 
  private game: Game 

  constructor(data: LevelData, game: Game) {
    this.id = data.id
    this.name = data.name
    this.width = data.width
    this.height = data.height
    this.startX = data.startX
    this.startY = data.startY
    this.tiles = data.tiles
    this.game = game 
    this.enemies = data.enemies.map((enemyData) => new Enemy(enemyData, this.game))
    this.collectibles = data.collectibles.map((collectibleData) => new Collectible(collectibleData))
    this.powerUps = data.powerUps.map((powerUpData) => new PowerUp(powerUpData))
    this.weaponUpgrades = data.weaponUpgrades.map((upgradeData) => new WeaponUpgrade(upgradeData))
    this.movingPlatforms = data.movingPlatforms.map((mpData) => new MovingPlatform(mpData))
    this.forceFields = data.forceFields.map((ffData) => new ForceField(ffData))
    this.spikeTraps = data.spikeTraps.map((stData) => new SpikeTrap(stData))
    this.boss = data.boss ? new Boss(data.boss, this.game, this.game.particles) : null
  }
  update(deltaTime: number, player: Player, gameState: GameState): void {
    this.enemies.forEach((enemy) => enemy.update(deltaTime, this, gameState))
    this.collectibles.forEach((collectible) => collectible.update(deltaTime))
    this.powerUps.forEach((powerUp) => powerUp.update(deltaTime))
    this.weaponUpgrades.forEach((upgrade) => upgrade.update(deltaTime))
    this.movingPlatforms.forEach((platform) => platform.update(deltaTime))
    this.forceFields.forEach((field) => field.update(deltaTime))
    this.spikeTraps.forEach((trap) => trap.update(deltaTime))
    if (this.boss && this.boss.isActive) {
      this.boss.update(deltaTime, this.game.player, gameState)
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, levelId: number): void {
    const tileSize = 32
    const startTileX = Math.floor(cameraX / tileSize)
    const endTileX = Math.ceil((cameraX + ctx.canvas.width) / tileSize)
    for (let tileY = 0; tileY < this.tiles.length; tileY++) {
      for (let tileX = startTileX; tileX < endTileX && tileX < this.tiles[tileY].length; tileX++) {
        if (tileX < 0) continue

        const tile = this.tiles[tileY][tileX]
        if (tile === TileType.EMPTY) continue

        const screenX = tileX * tileSize - cameraX + 100
        const screenY = tileY * tileSize

        this.renderTile(ctx, screenX, screenY, tile, levelId)
      }
    }
    this.enemies.forEach((enemy) => enemy.render(ctx, cameraX, levelId)) 
    this.collectibles.forEach((collectible) => collectible.render(ctx, cameraX, levelId)) 
    this.powerUps.forEach((powerUp) => powerUp.render(ctx, cameraX, levelId))
    this.weaponUpgrades.forEach((upgrade) => upgrade.render(ctx, cameraX, levelId))
    this.movingPlatforms.forEach((platform) => platform.render(ctx, cameraX, levelId))
    this.forceFields.forEach((field) => field.render(ctx, cameraX, levelId))
    this.spikeTraps.forEach((trap) => trap.render(ctx, cameraX, levelId))
    if (this.boss && this.boss.isActive) {
      this.boss.render(ctx, cameraX, levelId)
    }
  }
  private renderTile(ctx: CanvasRenderingContext2D, x: number, y: number, tileType: number, levelId: number): void {
    const time = Date.now() / 1000
    const styleGroup = Math.floor((levelId - 1) / 5)
    ctx.save()
    switch (styleGroup) {
      case 0: 
        switch (tileType) {
          case TileType.TERMINAL_BLOCK:
            const gradient0 = ctx.createLinearGradient(x, y, x, y + 32)
            gradient0.addColorStop(0, "#003300")
            gradient0.addColorStop(1, "#001100")
            ctx.fillStyle = gradient0
            ctx.fillRect(x, y, 32, 32)
            ctx.shadowColor = "#00ff00"
            ctx.shadowBlur = 3
            ctx.strokeStyle = "#00ff00"
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, 32, 32)
            ctx.fillStyle = `rgba(0, 255, 0, ${0.8 + Math.sin(time * 2 + x * 0.01) * 0.2})`
            ctx.font = "16px monospace"
            ctx.textAlign = "center"
            ctx.fillText("█", x + 16, y + 20)
            break
          case TileType.DATA_TUNNEL:
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(time * 4 + y * 0.02) * 0.4})`
            ctx.lineWidth = 2
            ctx.strokeRect(x + 2, y + 2, 28, 28)
            ctx.fillStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(time * 6) * 0.2})`
            ctx.font = "20px monospace"
            ctx.textAlign = "center"
            ctx.fillText("║", x + 16, y + 24)
            break
          case TileType.MEMORY_PLATFORM:
            const platformY0 = y + Math.sin(time * 2 + x * 0.01) * 2
            ctx.fillStyle = "#ffff00"
            ctx.fillRect(x, platformY0 + 24, 32, 8)
            ctx.shadowColor = "#ffff00"
            ctx.shadowBlur = 8
            ctx.fillStyle = `rgba(255, 255, 0, ${0.7 + Math.sin(time * 4) * 0.3})`
            ctx.font = "16px monospace"
            ctx.textAlign = "center"
            ctx.fillText("═", x + 16, platformY0 + 24)
            break
          case TileType.ANTIVIRUS_LASER:
            ctx.fillStyle = "#ff0000"
            ctx.fillRect(x, y, 32, 32)
            ctx.shadowColor = "#ff0000"
            ctx.shadowBlur = 10 + Math.sin(time * 8) * 5
            ctx.fillStyle = "#ffffff"
            ctx.font = "20px monospace"
            ctx.textAlign = "center"
            ctx.fillText("▲", x + 16, y + 24)
            if (Math.random() < 0.1) {
              ctx.fillStyle = `rgba(255, 0, 0, ${Math.random()})`
              ctx.fillRect(x + Math.random() * 32, y + Math.random() * 32, 2, 2)
            }
            break
        }
        break

      case 1: 
        switch (tileType) {
          case TileType.TERMINAL_BLOCK:
            const gradient1 = ctx.createLinearGradient(x, y, x, y + 32)
            gradient1.addColorStop(0, "#000033")
            gradient1.addColorStop(1, "#000011")
            ctx.fillStyle = gradient1
            ctx.fillRect(x, y, 32, 32)
            ctx.shadowColor = "#0000ff"
            ctx.shadowBlur = 3
            ctx.strokeStyle = "#0000ff"
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, 32, 32)
            ctx.fillStyle = `rgba(0, 0, 255, ${0.8 + Math.sin(time * 2 + x * 0.01) * 0.2})`
            ctx.font = "16px monospace"
            ctx.textAlign = "center"
            ctx.fillText("▓", x + 16, y + 20)
            break
          case TileType.DATA_TUNNEL:
            ctx.strokeStyle = `rgba(128, 0, 128, ${0.6 + Math.sin(time * 4 + y * 0.02) * 0.4})`
            ctx.lineWidth = 2
            ctx.strokeRect(x + 2, y + 2, 28, 28)
            ctx.fillStyle = `rgba(128, 0, 128, ${0.3 + Math.sin(time * 6) * 0.2})`
            ctx.font = "20px monospace"
            ctx.textAlign = "center"
            ctx.fillText("╏", x + 16, y + 24)
            break
          case TileType.MEMORY_PLATFORM:
            const platformY1 = y + Math.sin(time * 2 + x * 0.01) * 2
            ctx.fillStyle = "#00ffff"
            ctx.fillRect(x, platformY1 + 24, 32, 8)
            ctx.shadowColor = "#00ffff"
            ctx.shadowBlur = 8
            ctx.fillStyle = `rgba(0, 255, 255, ${0.7 + Math.sin(time * 4) * 0.3})`
            ctx.font = "16px monospace"
            ctx.textAlign = "center"
            ctx.fillText("≡", x + 16, platformY1 + 24)
            break
          case TileType.ANTIVIRUS_LASER:
            ctx.fillStyle = "#ff8800"
            ctx.fillRect(x, y, 32, 32)
            ctx.shadowColor = "#ff8800"
            ctx.shadowBlur = 10 + Math.sin(time * 8) * 5
            ctx.fillStyle = "#ffffff"
            ctx.font = "20px monospace"
            ctx.textAlign = "center"
            ctx.fillText("♦", x + 16, y + 24)
            if (Math.random() < 0.1) {
              ctx.fillStyle = `rgba(255, 136, 0, ${Math.random()})`
              ctx.fillRect(x + Math.random() * 32, y + Math.random() * 32, 2, 2)
            }
            break
        }
        break

      case 2: 
        switch (tileType) {
          case TileType.TERMINAL_BLOCK:
            const gradient2 = ctx.createLinearGradient(x, y, x, y + 32)
            gradient2.addColorStop(0, "#330000")
            gradient2.addColorStop(1, "#110000")
            ctx.fillStyle = gradient2
            ctx.fillRect(x, y, 32, 32)
            ctx.shadowColor = "#ff0000"
            ctx.shadowBlur = 3
            ctx.strokeStyle = "#ff0000"
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, 32, 32)
            ctx.fillStyle = `rgba(255, 0, 0, ${0.8 + Math.sin(time * 2 + x * 0.01) * 0.2})`
            ctx.font = "16px monospace"
            ctx.textAlign = "center"
            ctx.fillText("▒", x + 16, y + 20)
            break
          case TileType.DATA_TUNNEL:
            ctx.strokeStyle = `rgba(255, 165, 0, ${0.6 + Math.sin(time * 4 + y * 0.02) * 0.4})`
            ctx.lineWidth = 2
            ctx.strokeRect(x + 2, y + 2, 28, 28)
            ctx.fillStyle = `rgba(255, 165, 0, ${0.3 + Math.sin(time * 6) * 0.2})`
            ctx.font = "20px monospace"
            ctx.textAlign = "center"
            ctx.fillText("╎", x + 16, y + 24)
            break
          case TileType.MEMORY_PLATFORM:
            const platformY2 = y + Math.sin(time * 2 + x * 0.01) * 2
            ctx.fillStyle = "#ffaa00"
            ctx.fillRect(x, platformY2 + 24, 32, 8)
            ctx.shadowColor = "#ffaa00"
            ctx.shadowBlur = 8
            ctx.fillStyle = `rgba(255, 170, 0, ${0.7 + Math.sin(time * 4) * 0.3})`
            ctx.font = "16px monospace"
            ctx.textAlign = "center"
            ctx.fillText("─", x + 16, platformY2 + 24)
            break
          case TileType.ANTIVIRUS_LASER:
            ctx.fillStyle = "#00ff00"
            ctx.fillRect(x, y, 32, 32)
            ctx.shadowColor = "#00ff00"
            ctx.shadowBlur = 10 + Math.sin(time * 8) * 5
            ctx.fillStyle = "#ffffff"
            ctx.font = "20px monospace"
            ctx.textAlign = "center"
            ctx.fillText("X", x + 16, y + 24)
            if (Math.random() < 0.1) {
              ctx.fillStyle = `rgba(0, 255, 0, ${Math.random()})`
              ctx.fillRect(x + Math.random() * 32, y + Math.random() * 32, 2, 2)
            }
            break
        }
        break

      case 3: 
        switch (tileType) {
          case TileType.TERMINAL_BLOCK:
            const gradient3 = ctx.createLinearGradient(x, y, x, y + 32)
            gradient3.addColorStop(0, "#222222")
            gradient3.addColorStop(1, "#111111")
            ctx.fillStyle = gradient3
            ctx.fillRect(x, y, 32, 32)
            ctx.shadowColor = "#ffffff"
            ctx.shadowBlur = 3
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, 32, 32)
            ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(time * 2 + x * 0.01) * 0.2})`
            ctx.font = "16px monospace"
            ctx.textAlign = "center"
            ctx.fillText("░", x + 16, y + 20)
            break
          case TileType.DATA_TUNNEL:
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 4 + y * 0.02) * 0.4})`
            ctx.lineWidth = 2
            ctx.strokeRect(x + 2, y + 2, 28, 28)
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 6) * 0.2})`
            ctx.font = "20px monospace"
            ctx.textAlign = "center"
            ctx.fillText("¦", x + 16, y + 24)
            break
          case TileType.MEMORY_PLATFORM:
            const platformY3 = y + Math.sin(time * 2 + x * 0.01) * 2
            ctx.fillStyle = "#cccccc"
            ctx.fillRect(x, platformY3 + 24, 32, 8)
            ctx.shadowColor = "#cccccc"
            ctx.shadowBlur = 8
            ctx.fillStyle = `rgba(204, 204, 204, ${0.7 + Math.sin(time * 4) * 0.3})`
            ctx.font = "16px monospace"
            ctx.textAlign = "center"
            ctx.fillText("≈", x + 16, platformY3 + 24)
            break
          case TileType.ANTIVIRUS_LASER:
            ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(time * 15) * 0.5})` 
            ctx.fillRect(x, y, 32, 32)
            ctx.shadowColor = `rgba(255, 0, 0, ${0.8 + Math.sin(time * 15) * 0.2})`
            ctx.shadowBlur = 15 + Math.sin(time * 10) * 10
            ctx.fillStyle = "#000000"
            ctx.font = "20px monospace"
            ctx.textAlign = "center"
            ctx.fillText("!", x + 16, y + 24)
            if (Math.random() < 0.2) {
              ctx.fillStyle = `rgba(255, 0, 0, ${Math.random()})`
              ctx.fillRect(x + Math.random() * 32, y + Math.random() * 32, 3, 3)
            }
            break
        }
        break
    }

    ctx.restore()
  }

  reset(): void {
    this.enemies.forEach((enemy) => enemy.reset())
    this.collectibles.forEach((collectible) => collectible.reset())
    this.powerUps.forEach((powerUp) => powerUp.reset())
    this.weaponUpgrades.forEach((upgrade) => upgrade.reset())
    this.movingPlatforms.forEach((platform) => platform.reset())
    this.forceFields.forEach((field) => field.reset())
    this.spikeTraps.forEach((trap) => trap.reset())
    if (this.boss) {
      this.boss.reset()
    }
  }
}
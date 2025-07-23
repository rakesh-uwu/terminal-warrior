import type { Rectangle, EnemyData, GameState } from "./types" // Import GameState
import type { Level } from "./level"
import type { Game } from "./game" 

export class Enemy {
  x: number
  y: number
  width = 24
  height = 24
  velocityX = 50
  velocityY = 0
  type: string
  isActive = true
  patrolDistance: number
  startX: number
  direction = 1
  private game: Game 
  private shootTimer = 0
  private shootCooldown = 2 
  private stealthTimer = 0
  private isStealthed = false
  private stealthDuration = 3 
  private stealthCooldown = 5 
  constructor(data: EnemyData, game: Game) {
    this.x = data.x
    this.y = data.y
    this.startX = data.x
    this.type = data.type
    this.patrolDistance = data.patrolDistance || 100
    this.game = game
  }
  update(deltaTime: number, level: Level, gameState: GameState): void {
    if (!this.isActive) return
    const speedMultiplier = gameState.powerUps.timeWarp > 0 ? 0.5 : 1 
    this.velocityY += 800 * deltaTime
    this.y += this.velocityY * deltaTime
    if (this.y > 400) {
      this.y = 400
      this.velocityY = 0
    }
    switch (this.type) {
      case "glitchBug":
      case "firewallDrone":
        this.x += this.velocityX * this.direction * deltaTime * speedMultiplier
        if (Math.abs(this.x - this.startX) > this.patrolDistance) {
          this.direction *= -1
        }
        break
      case "sentinelBot":
        this.shootTimer += deltaTime
        if (this.shootTimer >= this.shootCooldown) {
          this.shootProjectile(this.game.player.x, this.game.player.y, "enemyPulse")
          this.shootTimer = 0
        }
        break
      case "dataLeech":
        const playerX = this.game.player.x
        const playerY = this.game.player.y
        const directionToPlayerX = playerX > this.x ? 1 : -1
        const directionToPlayerY = playerY > this.y ? 1 : -1
        this.x += directionToPlayerX * this.velocityX * 1.5 * deltaTime * speedMultiplier
        this.y += directionToPlayerY * this.velocityY * 0.5 * deltaTime * speedMultiplier
        if (this.x < 0) this.x = 0
        if (this.x + this.width > level.width) this.x = level.width - this.width
        break

      case "plasmaTurret":
        this.shootTimer += deltaTime
        if (this.shootTimer >= this.shootCooldown * 1.5) {
          this.shootProjectile(this.game.player.x, this.game.player.y, "plasmaBall")
          this.shootTimer = 0
        }
        break

      case "shadowCrawler":
        this.x += this.velocityX * this.direction * deltaTime * speedMultiplier
        if (Math.abs(this.x - this.startX) > this.patrolDistance) {
          this.direction *= -1
        }
        this.stealthTimer += deltaTime
        if (!this.isStealthed && this.stealthTimer >= this.stealthCooldown) {
          this.isStealthed = true
          this.stealthTimer = 0
        } else if (this.isStealthed && this.stealthTimer >= this.stealthDuration) {
          this.isStealthed = false
          this.stealthTimer = 0
        }
        break
    }
  }
  private shootProjectile(targetX: number, targetY: number, bulletType: string): void {
    const bulletX = this.x + this.width / 2
    const bulletY = this.y + this.height / 2
    const angle = Math.atan2(targetY - bulletY, targetX - bulletX)
    const speed = bulletType === "plasmaBall" ? 100 : 250 

    this.game.createEnemyBullet(bulletX, bulletY, Math.cos(angle) * speed, Math.sin(angle) * speed, bulletType)
  }
  render(ctx: CanvasRenderingContext2D, cameraX: number, levelId: number): void {
    if (!this.isActive) return
    const screenX = this.x - cameraX + 100
    const time = Date.now() / 1000
    const styleGroup = Math.floor((levelId - 1) / 5) 
    ctx.save()
    let enemyColor = "#ff0000"
    let glowColor = "#ff0000"
    let particleColor = "#ff0000"
    let symbol = "X"
    switch (styleGroup) {
      case 0: 
        enemyColor = "#ff0000"
        glowColor = "#ff0000"
        particleColor = "#ff0000"
        break
      case 1: 
        enemyColor = "#0000ff"
        glowColor = "#0000ff"
        particleColor = "#0000ff"
        break
      case 2: 
        enemyColor = "#ff8800"
        glowColor = "#ff8800"
        particleColor = "#ff8800"
        break
      case 3: 
        enemyColor = "#888888"
        glowColor = "#ffffff" 
        particleColor = "#444444"
        break
    }
    if (this.type === "shadowCrawler" && this.isStealthed) {
      ctx.globalAlpha = 0.3 + Math.sin(time * 15) * 0.1
      glowColor = "#00ffff" 
    }
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 8 + Math.sin(time * 6) * 3
    const hexToRgba = (hex: string, alpha: number) => {
      const r = Number.parseInt(hex.slice(1, 3), 16)
      const g = Number.parseInt(hex.slice(3, 5), 16)
      const b = Number.parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    ctx.fillStyle = hexToRgba(enemyColor, 0.9 + Math.sin(time * 4) * 0.1)
    ctx.font = "20px monospace"
    ctx.textAlign = "center"
    const bobOffset = Math.sin(time * 8 + this.x * 0.01) * 2
    switch (this.type) {
      case "glitchBug":
        const glitchOffset = Math.sin(time * 20) * 1
        ctx.fillStyle = "#00ff00" 
        ctx.fillText("※", screenX + this.width / 2 + glitchOffset, this.y + this.height - 4 + bobOffset + 1)
        ctx.fillStyle = enemyColor 
        symbol = "※"
        break
      case "firewallDrone":
        ctx.translate(screenX + this.width / 2, this.y + this.height - 4 + bobOffset)
        ctx.rotate(time * 3)
        symbol = "◊"
        break
      case "sentinelBot":
        symbol = "⌂"
        ctx.font = "24px monospace"
        ctx.fillStyle = enemyColor
        if (this.shootTimer < this.shootCooldown * 0.5) {
          ctx.fillStyle = `rgba(255, 255, 0, ${0.5 + Math.sin(time * 10) * 0.5})`
          ctx.fillText("•", screenX + this.width / 2, this.y - 10)
        }
        break

      case "dataLeech":
        symbol = "§" 
        ctx.font = "22px monospace"
        ctx.fillStyle = enemyColor
        if (Math.random() < 0.1) {
          ctx.fillStyle = `rgba(0, 255, 255, ${Math.random()})`
          ctx.fillText("~", screenX + Math.random() * this.width, this.y + Math.random() * this.height)
        }
        break

      case "plasmaTurret":
        symbol = "¤" 
        ctx.font = "24px monospace"
        ctx.fillStyle = enemyColor
        if (this.shootTimer < this.shootCooldown * 1.5 * 0.5) {
          ctx.fillStyle = `rgba(255, 100, 0, ${0.5 + Math.sin(time * 10) * 0.5})`
          ctx.fillText("○", screenX + this.width / 2, this.y - 10)
        }
        break
      case "shadowCrawler":
        symbol = "¶"
        ctx.font = "20px monospace"
        ctx.fillStyle = enemyColor
        if (this.isStealthed && Math.random() < 0.3) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`
          ctx.fillText(
            String.fromCharCode(0x2580 + Math.floor(Math.random() * 16)), 
            screenX + Math.random() * this.width,
            this.y + Math.random() * this.height,
          )
        }
        break

      default:
        symbol = "X"
    }
    if (this.type !== "firewallDrone") {
      ctx.fillText(symbol, screenX + this.width / 2, this.y + this.height - 4 + bobOffset)
    }
    ctx.restore()
    if (Math.random() < 0.2) {
      ctx.fillStyle = hexToRgba(particleColor, Math.random() * 0.5)
      ctx.fillRect(screenX + Math.random() * this.width, this.y + Math.random() * this.height, 1, 1)
    }
  }
  getBounds(): Rectangle {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      intersects: function (other: Rectangle) {
        return (
          this.x < other.x + other.width &&
          this.x + this.width > other.x &&
          this.y < other.y + other.height &&
          this.y + this.height > other.y
        )
      },
    }
  }
  destroy(): void {
    this.isActive = false
  }
  reset(): void {
    this.isActive = true
    this.x = this.startX
    this.direction = 1
    this.velocityY = 0
    this.shootTimer = 0
    this.stealthTimer = 0
    this.isStealthed = false
  }
}
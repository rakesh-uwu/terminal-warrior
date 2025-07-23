import type { Rectangle } from "./types"
import type { Level } from "./level"

export class Bullet {
  x: number
  y: number
  width = 8
  height = 4
  velocityX: number
  velocityY: number
  isActive = true
  direction: number 
  lifeTime = 0
  maxLifeTime = 3 
  private gravity = 800 
  isEnemyBullet: boolean
  type: string 
  piercing: number 
  damage: number 

  constructor(
    x: number,
    y: number,
    direction: number,
    isEnemyBullet = false,
    type = "playerPulse",
    piercing = 0,
    damage = 50,
  ) {
    this.x = x
    this.y = y
    this.direction = direction
    this.isEnemyBullet = isEnemyBullet
    this.type = type
    this.piercing = piercing
    this.damage = damage

    if (isEnemyBullet) {
      this.velocityX = 0 
      this.velocityY = 0 
    } else {
      this.velocityX = direction * 400 
      this.velocityY = 0
    }
  }

  update(deltaTime: number, level: Level, isGravityReversed: boolean): void {
    if (!this.isActive) return
    const gravityDirection = isGravityReversed ? -1 : 1
    this.velocityY += this.gravity * gravityDirection * deltaTime
    this.x += this.velocityX * deltaTime
    this.y += this.velocityY * deltaTime
    this.lifeTime += deltaTime
    if (this.lifeTime > this.maxLifeTime) {
      this.isActive = false
      return
    }
    this.checkTileCollisions(level)
    if (this.x < -100 || this.x > level.width + 100 || this.y < -100 || this.y > level.height + 100) {
      this.isActive = false
    }
  }
  private checkTileCollisions(level: Level): void {
    const bounds = this.getBounds()
    const tileSize = 32

    const startTileX = Math.floor(bounds.x / tileSize)
    const endTileX = Math.ceil((bounds.x + bounds.width) / tileSize)
    const startTileY = Math.floor(bounds.y / tileSize)
    const endTileY = Math.ceil((bounds.y + bounds.height) / tileSize)

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        if (tileY < 0 || tileY >= level.tiles.length || tileX < 0 || tileX >= level.tiles[tileY].length) {
          continue
        }
        const tile = level.tiles[tileY][tileX]
        if (tile === 0) continue // Empty tile

        const tileRect = {
          x: tileX * tileSize,
          y: tileY * tileSize,
          width: tileSize,
          height: tileSize,
          intersects: function (other: Rectangle) {
            return (
              this.x < other.x + other.width &&
              this.x + this.width > other.x &&
              this.y < other.y + other.height &&
              this.y + this.height > other.y
            )
          },
        }

        if (bounds.intersects(tileRect)) {
          if (this.piercing <= 0 || this.isEnemyBullet) {
            this.isActive = false
          }
          return
        }
      }
    }
  }
  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    if (!this.isActive) return

    const screenX = this.x - cameraX + 100
    const time = Date.now() / 1000

    ctx.save()

    let bulletColor = "#00ffff" 
    let symbol = "•"
    let fontSize = "12px monospace"
    let trailLength = 5

    if (this.isEnemyBullet) {
      switch (this.type) {
        case "enemyPulse":
          bulletColor = "#ff0000"
          symbol = "×"
          fontSize = "14px monospace"
          trailLength = 3
          break
        case "plasmaBall":
          bulletColor = "#ff8800"
          symbol = "◎"
          fontSize = "20px monospace"
          trailLength = 2
          ctx.shadowBlur = 15 
          break
      }
    } else {
      if (this.piercing > 0) {
        bulletColor = "#ffff00" 
        symbol = "⟶"
        fontSize = "16px monospace"
      }
      if (this.damage > 50) {
        bulletColor = "#ff00ff" 
        symbol = "◉"
        fontSize = "18px monospace"
        ctx.shadowBlur = 12
      }
    }
    ctx.shadowColor = bulletColor
    ctx.shadowBlur = ctx.shadowBlur || 8
    ctx.fillStyle = `rgba(${Number.parseInt(bulletColor.slice(1, 3), 16)}, ${Number.parseInt(bulletColor.slice(3, 5), 16)}, ${Number.parseInt(bulletColor.slice(5, 7), 16)}, ${0.9 + Math.sin(time * 10) * 0.1})`
    ctx.font = fontSize
    ctx.textAlign = "center"
    ctx.fillText(symbol, screenX + this.width / 2, this.y + this.height)
    for (let i = 1; i <= trailLength; i++) {
      const alpha = ((trailLength - i) / trailLength) * 0.6
      ctx.fillStyle = `rgba(${Number.parseInt(bulletColor.slice(1, 3), 16)}, ${Number.parseInt(bulletColor.slice(3, 5), 16)}, ${Number.parseInt(bulletColor.slice(5, 7), 16)}, ${alpha})`
      ctx.fillText(symbol, screenX + this.width / 2 - this.direction * i * 8, this.y + this.height)
    }
    ctx.restore()
    if (Math.random() < (this.piercing > 0 || this.damage > 50 ? 0.8 : 0.5)) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`
      ctx.fillRect(screenX + Math.random() * 8, this.y + Math.random() * 4, 1, 1)
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
  hitEnemy(): void {
    if (this.piercing > 0) {
      this.piercing--
      if (this.piercing <= 0) {
        this.isActive = false
      }
    } else {
      this.isActive = false
    }
  }
}
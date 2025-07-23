import type { Rectangle, MovingPlatformData } from "./types"
export class MovingPlatform {
  x: number
  y: number
  width = 64
  height = 16
  private path: { x: number; y: number }[]
  private speed: number
  private currentPathIndex = 0
  private direction = 1 
  private delayTimer: number
  private initialDelay: number
  private isMoving = false
  private originalX: number
  private originalY: number
  velocityX = 0
  velocityY = 0

  constructor(data: MovingPlatformData) {
    this.x = data.x
    this.y = data.y
    this.originalX = data.x
    this.originalY = data.y
    this.path = data.path
    this.speed = data.speed
    this.initialDelay = data.delay || 0
    this.delayTimer = this.initialDelay
  }

  update(deltaTime: number): void {
    if (this.delayTimer > 0) {
      this.delayTimer -= deltaTime
      if (this.delayTimer <= 0) {
        this.isMoving = true
      }
      return
    }

    if (!this.isMoving || this.path.length < 2) {
      this.velocityX = 0
      this.velocityY = 0
      return
    }

    const targetPoint = this.path[this.currentPathIndex]
    const dx = targetPoint.x - this.x
    const dy = targetPoint.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < this.speed * deltaTime) {
      this.x = targetPoint.x
      this.y = targetPoint.y
      this.currentPathIndex += this.direction

      if (this.currentPathIndex >= this.path.length || this.currentPathIndex < 0) {
        this.direction *= -1 
        this.currentPathIndex += this.direction 
        this.delayTimer = this.initialDelay
        this.isMoving = false
      }
    } else {
      const moveAmount = this.speed * deltaTime
      this.velocityX = (dx / distance) * moveAmount
      this.velocityY = (dy / distance) * moveAmount
      this.x += this.velocityX
      this.y += this.velocityY
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, levelId: number): void {
    const screenX = this.x - cameraX + 100
    const styleGroup = Math.floor((levelId - 1) / 5)
    const time = Date.now() / 1000

    ctx.save()

    let platformColor = "#ffff00" 
    let glowColor = "#ffff00"
    let symbol = "═"

    switch (styleGroup) {
      case 0: 
        platformColor = "#ffff00"
        glowColor = "#ffff00"
        symbol = "═"
        break
      case 1:
        platformColor = "#00ffff"
        glowColor = "#00ffff"
        symbol = "≡"
        break
      case 2: 
        platformColor = "#ffaa00"
        glowColor = "#ffaa00"
        symbol = "─"
        break
      case 3:
        platformColor = "#cccccc"
        glowColor = "#ffffff"
        symbol = "≈"
        break
    }

    ctx.shadowColor = glowColor
    ctx.shadowBlur = 8 + Math.sin(time * 4) * 3

    ctx.fillStyle = platformColor
    ctx.fillRect(screenX, this.y, this.width, this.height)

    ctx.strokeStyle = glowColor
    ctx.lineWidth = 2
    ctx.strokeRect(screenX, this.y, this.width, this.height)

    ctx.fillStyle = `rgba(0, 0, 0, ${0.5 + Math.sin(time * 6) * 0.2})`
    ctx.fillRect(screenX + 2, this.y + 2, this.width - 4, this.height - 4)

    ctx.fillStyle = platformColor
    ctx.font = "16px monospace"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(symbol.repeat(Math.floor(this.width / 16)), screenX + this.width / 2, this.y + this.height / 2)

    ctx.restore()
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

  reset(): void {
    this.x = this.originalX
    this.y = this.originalY
    this.currentPathIndex = 0
    this.direction = 1
    this.delayTimer = this.initialDelay
    this.isMoving = false
    this.velocityX = 0
    this.velocityY = 0
  }
}
import type { Rectangle, PowerUpData } from "./types"

export class PowerUp {
  x: number
  y: number
  width = 24
  height = 24
  type: string
  isActive = true
  animationTimer = 0

  constructor(data: PowerUpData) {
    this.x = data.x
    this.y = data.y
    this.type = data.type
  }

  update(deltaTime: number): void {
    if (!this.isActive) return
    this.animationTimer += deltaTime
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, levelId: number): void {
    if (!this.isActive) return

    const screenX = this.x - cameraX + 100
    const pulse = Math.sin(this.animationTimer * 6) * 0.3 + 0.7
    const styleGroup = Math.floor((levelId - 1) / 5) 

    let powerUpColor = "rgba(255, 255, 0, "
    let textColor = "rgba(255, 255, 0, "

    switch (styleGroup) {
      case 0: 
        powerUpColor = "rgba(255, 255, 0, "
        textColor = "rgba(255, 255, 0, "
        break
      case 1: 
        powerUpColor = "rgba(0, 255, 255, " 
        textColor = "rgba(0, 255, 255, "
        break
      case 2: 
        powerUpColor = "rgba(255, 100, 0, " 
        textColor = "rgba(255, 100, 0, "
        break
      case 3: 
        powerUpColor = "rgba(200, 200, 200, " 
        textColor = "rgba(200, 200, 200, "
        break
    }

    ctx.fillStyle = powerUpColor + pulse + ")"
    ctx.font = "20px monospace"
    ctx.textAlign = "center"
    ctx.shadowColor = powerUpColor.slice(0, -2) + "1)" 
    ctx.shadowBlur = 8
    switch (this.type) {
      case "firewallShield":
        ctx.fillText("⚡", screenX + this.width / 2, this.y + this.height - 4)
        break
      case "overclockChip":
        ctx.fillText("▲", screenX + this.width / 2, this.y + this.height - 4)
        break
      case "debugPulse":
        ctx.fillText("◈", screenX + this.width / 2, this.y + this.height - 4)
        break
      case "restorePoint":
        ctx.fillText("♦", screenX + this.width / 2, this.y + this.height - 4)
        break
      default:
        ctx.fillText("?", screenX + this.width / 2, this.y + this.height - 4)
    }
    ctx.shadowBlur = 0 
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
  collect(): void {
    this.isActive = false
  }
  reset(): void {
    this.isActive = true
  }
}
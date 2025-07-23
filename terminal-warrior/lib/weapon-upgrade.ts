import type { Rectangle, WeaponUpgradeData } from "./types"

export class WeaponUpgrade {
  x: number
  y: number
  width = 28
  height = 28
  type: string
  level: number
  isActive = true
  animationTimer = 0

  constructor(data: WeaponUpgradeData) {
    this.x = data.x
    this.y = data.y
    this.type = data.type
    this.level = data.level
  }

  update(deltaTime: number): void {
    if (!this.isActive) return
    this.animationTimer += deltaTime
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, levelId: number): void {
    if (!this.isActive) return

    const screenX = this.x - cameraX + 100
    const time = Date.now() / 1000
    const pulse = Math.sin(this.animationTimer * 8) * 0.3 + 0.7
    const styleGroup = Math.floor((levelId - 1) / 5)

    let upgradeColor = "rgba(255, 165, 0, "
    let glowColor = "#ffa500"
    let symbol = "⚡"

    switch (styleGroup) {
      case 0:
        upgradeColor = "rgba(255, 165, 0, "
        glowColor = "#ffa500"
        break
      case 1:
        upgradeColor = "rgba(0, 191, 255, "
        glowColor = "#00bfff"
        break
      case 2:
        upgradeColor = "rgba(255, 69, 0, "
        glowColor = "#ff4500"
        break
      case 3:
        upgradeColor = "rgba(255, 255, 255, "
        glowColor = "#ffffff"
        break
    }

    ctx.save()
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 15 + Math.sin(time * 10) * 5

    ctx.fillStyle = upgradeColor + pulse + ")"
    ctx.font = "24px monospace"
    ctx.textAlign = "center"

    switch (this.type) {
      case "rapidFire":
        symbol = "⚡"
        break
      case "piercing":
        symbol = "⟶"
        break
      case "spread":
        symbol = "※"
        break
      case "power":
        symbol = "◉"
        break
      default:
        symbol = "⚡"
    }

    ctx.fillText(symbol, screenX + this.width / 2, this.y + this.height - 4)

    ctx.font = "8px monospace"
    ctx.fillStyle = upgradeColor + "0.8)"
    for (let i = 0; i < this.level; i++) {
      ctx.fillText("•", screenX + this.width / 2 - 8 + i * 8, this.y - 5)
    }

    if (Math.random() < 0.4) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`
      ctx.fillRect(screenX + Math.random() * this.width, this.y + Math.random() * this.height, 2, 2)
    }

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

  collect(): void {
    this.isActive = false
  }

  reset(): void {
    this.isActive = true
  }
}

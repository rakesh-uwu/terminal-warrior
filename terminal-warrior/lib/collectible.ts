import type { Rectangle, CollectibleData } from "./types"

export class Collectible {
  x: number
  y: number
  width = 16
  height = 16
  type: string
  value: number
  isActive = true
  animationTimer = 0

  constructor(data: CollectibleData) {
    this.x = data.x
    this.y = data.y
    this.type = data.type
    this.value = data.value
  }

  update(deltaTime: number): void {
    if (!this.isActive) return
    this.animationTimer += deltaTime
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, levelId: number): void {
    if (!this.isActive) return

    const screenX = this.x - cameraX + 100
    const time = Date.now() / 1000
    const bounce = Math.sin(this.animationTimer * 4) * 3
    const pulse = 0.8 + Math.sin(this.animationTimer * 6) * 0.2
    const styleGroup = Math.floor((levelId - 1) / 5) 

    ctx.save()

    let collectibleColor = "#00ffff" 
    let glowColor = "#00ffff"
    let sparkleColor = "#00ffff"
    switch (styleGroup) {
      case 0: 
        collectibleColor = "#00ffff"
        glowColor = "#00ffff"
        sparkleColor = "#00ffff"
        break
      case 1: 
        collectibleColor = "#800080" 
        glowColor = "#800080"
        sparkleColor = "#ffffff" 
        break
      case 2: 
        collectibleColor = "#ffaa00" 
        glowColor = "#ffaa00"
        sparkleColor = "#ffffff"
        break
      case 3: 
        collectibleColor = "#cccccc" 
        glowColor = "#ffffff"
        sparkleColor = "#ffffff"
        break
    }
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 10 + Math.sin(time * 8) * 5
    const hexToRgba = (hex: string, alpha: number) => {
      const r = Number.parseInt(hex.slice(1, 3), 16)
      const g = Number.parseInt(hex.slice(3, 5), 16)
      const b = Number.parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    ctx.fillStyle = hexToRgba(collectibleColor, pulse)
    ctx.font = "16px monospace"
    ctx.textAlign = "center"
    const rotation = this.animationTimer * 2
    ctx.translate(screenX + this.width / 2, this.y + this.height - 4 + bounce)
    ctx.rotate(rotation)
    switch (this.type) {
      case "codeFragment":
        ctx.fillText("◦", 0, 0)
        break
      case "dataChunk":
        ctx.fillText("●", 0, 0)
        break
      default:
        ctx.fillText("○", 0, 0)
    }
    ctx.restore()
    if (Math.random() < 0.3) {
      ctx.fillStyle = hexToRgba(sparkleColor, Math.random())
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
  collect(): void {
    this.isActive = false
  }

  reset(): void {
    this.isActive = true
  }
}
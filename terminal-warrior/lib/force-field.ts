import type { Rectangle, ForceFieldData } from "./types"

export class ForceField {
  x: number
  y: number
  width: number
  height: number
  private activationDelay: number
  private activeDuration: number
  private inactiveDuration: number
  private timer: number
  isActive = false
  private originalX: number
  private originalY: number
  constructor(data: ForceFieldData) {
    this.x = data.x
    this.y = data.y
    this.originalX = data.x
    this.originalY = data.y
    this.width = data.width
    this.height = data.height
    this.activationDelay = data.activationDelay
    this.activeDuration = data.activeDuration
    this.inactiveDuration = data.inactiveDuration
    this.timer = this.activationDelay 
  }
  update(deltaTime: number): void {
    this.timer -= deltaTime
    if (this.isActive) {
      if (this.timer <= 0) {
        this.isActive = false
        this.timer = this.inactiveDuration
      }
    } else {
      if (this.timer <= 0) {
        this.isActive = true
        this.timer = this.activeDuration
      }
    }
  }
  render(ctx: CanvasRenderingContext2D, cameraX: number, levelId: number): void {
    if (!this.isActive) return
    const screenX = this.x - cameraX + 100
    const time = Date.now() / 1000
    const styleGroup = Math.floor((levelId - 1) / 5)
    ctx.save()
    let fieldColor = "#00ffff"
    let glowColor = "#00ffff"
    switch (styleGroup) {
      case 0: 
        fieldColor = "#00ffff"
        glowColor = "#00ffff"
        break
      case 1: 
        fieldColor = "#800080" 
        glowColor = "#800080"
        break
      case 2: 
        fieldColor = "#ffaa00" 
        glowColor = "#ffaa00"
        break
      case 3: 
        fieldColor = "#cccccc"
        glowColor = "#ffffff"
        break
    }
    const alpha = 0.4 + Math.sin(time * 10) * 0.2
    ctx.globalAlpha = alpha
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 15 + Math.sin(time * 8) * 5

    ctx.fillStyle = fieldColor
    ctx.fillRect(screenX, this.y, this.width, this.height)

    ctx.strokeStyle = fieldColor
    ctx.lineWidth = 2
    ctx.strokeRect(screenX, this.y, this.width, this.height)

    ctx.globalAlpha = alpha * 0.8
    ctx.strokeStyle = fieldColor
    ctx.lineWidth = 1
    for (let i = 0; i < this.height; i += 8) {
      ctx.beginPath()
      ctx.moveTo(screenX, this.y + i)
      ctx.lineTo(screenX + this.width, this.y + i)
      ctx.stroke()
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
  reset(): void {
    this.timer = this.activationDelay
    this.isActive = false
  }
}

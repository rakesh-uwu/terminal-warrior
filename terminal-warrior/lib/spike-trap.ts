import type { Rectangle, SpikeTrapData } from "./types"

export class SpikeTrap {
  x: number
  y: number
  width = 32
  height = 32
  private activationDelay: number
  private activeDuration: number
  private inactiveDuration: number
  private timer: number
  isActive = false
  private originalX: number
  private originalY: number

  constructor(data: SpikeTrapData) {
    this.x = data.x
    this.y = data.y
    this.originalX = data.x
    this.originalY = data.y
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
    const screenX = this.x - cameraX + 100
    const time = Date.now() / 1000
    const styleGroup = Math.floor((levelId - 1) / 5)

    ctx.save()

    let trapColor = "#ff0000"
    let glowColor = "#ff0000"
    let symbol = "▲"

    switch (styleGroup) {
      case 0:
        trapColor = "#ff0000"
        glowColor = "#ff0000"
        symbol = "▲"
        break
      case 1:
        trapColor = "#ff8800"
        glowColor = "#ff8800"
        symbol = "♦"
        break
      case 2:
        trapColor = "#00ff00"
        glowColor = "#00ff00"
        symbol = "X"
        break
      case 3:
        trapColor = "#ff0000"
        glowColor = "#ff0000"
        symbol = "!"
        break
    }

    ctx.fillStyle = "#333333"
    ctx.fillRect(screenX, this.y + this.height / 2, this.width, this.height / 2)
    ctx.strokeStyle = "#555555"
    ctx.lineWidth = 1
    ctx.strokeRect(screenX, this.y + this.height / 2, this.width, this.height / 2)

    if (this.isActive) {
      ctx.shadowColor = glowColor
      ctx.shadowBlur = 10 + Math.sin(time * 15) * 5
      ctx.fillStyle = trapColor
      ctx.font = "24px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      for (let i = 0; i < 3; i++) {
        ctx.fillText(symbol, screenX + this.width / 4 + (i * this.width) / 4, this.y + this.height / 4)
      }

      if (Math.random() < 0.2) {
        ctx.fillStyle = `rgba(${Number.parseInt(trapColor.slice(1, 3), 16)}, ${Number.parseInt(trapColor.slice(3, 5), 16)}, ${Number.parseInt(trapColor.slice(5, 7), 16)}, ${Math.random()})`
        ctx.fillRect(screenX + Math.random() * this.width, this.y + (Math.random() * this.height) / 2, 2, 2)
      }
    } else {
      ctx.fillStyle = "#555555"
      ctx.font = "16px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("□", screenX + this.width / 2, this.y + this.height / 2)
    }

    ctx.restore()
  }

  getBounds(): Rectangle {
    return {
      x: this.x,
      y: this.y + (this.isActive ? 0 : this.height / 2),
      width: this.width,
      height: this.isActive ? this.height : this.height / 2,
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

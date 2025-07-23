import type { Rectangle } from "./types"
import type { InputManager } from "./input"
import type { Level } from "./level"

export class Player {
  x: number
  y: number
  width = 32
  height = 32
  velocityX = 0
  velocityY = 0
  isGrounded = false
  isInvulnerable = false
  invulnerabilityTimer = 0
  speedBoostTimer = 0
  canDoubleJump = false
  hasDoubleJumped = false
  lastJumpTime = 0
  private jumpPower = -400
  private moveSpeed = 200
  private gravity = 1200
  private maxFallSpeed = 600
  private game: any 

  constructor(x: number, y: number, game?: any) {
    this.x = x
    this.y = y
    this.game = game
  }

  update(deltaTime: number, input: InputManager, level: Level): void {
    this.handleInput(input)
    this.applyPhysics(deltaTime)
    this.checkCollisions(level)
    this.updateTimers(deltaTime)
  }

  private handleInput(input: InputManager): void {
    this.velocityX = 0
    const currentSpeed = this.speedBoostTimer > 0 ? this.moveSpeed * 1.5 : this.moveSpeed

    if (input.isKeyDown("ArrowLeft") || input.isKeyDown("KeyA")) {
      this.velocityX = -currentSpeed
    }
    if (input.isKeyDown("ArrowRight") || input.isKeyDown("KeyD")) {
      this.velocityX = currentSpeed
    }
    const jumpPressed = input.isKeyPressed("Space") || input.isKeyPressed("ArrowUp") || input.isKeyPressed("KeyW")
    const currentTime = Date.now()

    if (jumpPressed) {
      if (this.isGrounded) {
        this.velocityY = this.jumpPower
        this.isGrounded = false
        this.canDoubleJump = true
        this.hasDoubleJumped = false
        this.lastJumpTime = currentTime
      } else if (this.canDoubleJump && !this.hasDoubleJumped && currentTime - this.lastJumpTime > 100) {
        this.velocityY = this.jumpPower * 0.8 
        this.hasDoubleJumped = true
        this.canDoubleJump = false
      }
    }
    if (input.isKeyPressed("ControlLeft") || input.isKeyPressed("KeyZ")) {
      this.shootDebugPulse()
    }
  }

  private applyPhysics(deltaTime: number): void {
    this.velocityY += this.gravity * deltaTime
    if (this.velocityY > this.maxFallSpeed) {
      this.velocityY = this.maxFallSpeed
    }
    this.x += this.velocityX * deltaTime
    this.y += this.velocityY * deltaTime
  }
  private checkCollisions(level: Level): void {
    const bounds = this.getBounds()
    this.isGrounded = false
    for (let tileY = 0; tileY < level.tiles.length; tileY++) {
      for (let tileX = 0; tileX < level.tiles[tileY].length; tileX++) {
        const tile = level.tiles[tileY][tileX]
        if (tile === 0) continue 

        const tileRect = {
          x: tileX * 32,
          y: tileY * 32,
          width: 32,
          height: 32,
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
          this.handleTileCollision(tileRect, tile)
        }
      }
    }
  }
  private handleTileCollision(tileRect: Rectangle, tileType: number): void {
    const bounds = this.getBounds()
    const overlapX = Math.min(bounds.x + bounds.width - tileRect.x, tileRect.x + tileRect.width - bounds.x)
    const overlapY = Math.min(bounds.y + bounds.height - tileRect.y, tileRect.y + tileRect.height - bounds.y)
    if (overlapX < overlapY) {
      if (bounds.x < tileRect.x) {
        this.x = tileRect.x - this.width
      } else {
        this.x = tileRect.x + tileRect.width
      }
      this.velocityX = 0
    } else {
      if (bounds.y < tileRect.y) {
        this.y = tileRect.y - this.height
        this.velocityY = 0
        this.isGrounded = true
        this.canDoubleJump = false
        this.hasDoubleJumped = false
      } else {
        this.y = tileRect.y + tileRect.height
        this.velocityY = 0
      }
    }
  }

  private updateTimers(deltaTime: number): void {
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= deltaTime * 1000
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false
      }
    }

    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= deltaTime * 1000
    }
  }

  private shootDebugPulse(): void {
    if (this.game && this.game.gameState.debugPulseReady) {
      const direction = this.velocityX >= 0 ? 1 : -1 
      this.game.createBullet(this.x + this.width / 2, this.y + this.height / 2, direction)
      this.game.gameState.debugPulseReady = false
      setTimeout(() => {
        if (this.game) {
          this.game.gameState.debugPulseReady = true
        }
      }, 2000)
    }
  }

  makeInvulnerable(duration: number): void {
    this.isInvulnerable = true
    this.invulnerabilityTimer = duration
  }

  applySpeedBoost(duration: number): void {
    this.speedBoostTimer = duration
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

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const screenX = this.x - cameraX + 100
    ctx.fillStyle = this.isInvulnerable && Math.floor(Date.now() / 100) % 2 ? "#00ff00" : "#00ff00"
    ctx.font = "24px monospace"
    ctx.textAlign = "center"
    ctx.fillText("@", screenX + this.width / 2, this.y + this.height - 8)
    if (false) {
      ctx.strokeStyle = "#ff0000"
      ctx.strokeRect(screenX, this.y, this.width, this.height)
    }
  }
  reset(x: number, y: number): void {
    this.x = x
    this.y = y
    this.velocityX = 0
    this.velocityY = 0
    this.isGrounded = false
    this.isInvulnerable = false
    this.invulnerabilityTimer = 0
    this.speedBoostTimer = 0
    this.canDoubleJump = false
    this.hasDoubleJumped = false
    this.lastJumpTime = 0
  }
}

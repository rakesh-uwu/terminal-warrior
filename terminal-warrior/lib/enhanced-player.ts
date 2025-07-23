import type { Rectangle } from "./types"
import type { InputManager } from "./input"
import type { Level } from "./level"
import { ParticleSystem } from "./particle"

export class EnhancedPlayer {
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
  animationFrame = 0
  animationTimer = 0
  facingDirection = 1
  private jumpPower = -400 
  private moveSpeed = 200
  private gravity = 1200
  private maxFallSpeed = 600
  private game: any
  private particles: ParticleSystem
  private dashSpeed = 600 
  private dashDuration = 0.15 
  private dashDistance = 100 
  private dashCooldown = 1.5 
  constructor(x: number, y: number, game?: any, particles?: ParticleSystem) {
    this.x = x
    this.y = y
    this.game = game
    this.particles = particles || new ParticleSystem()
  }
  update(deltaTime: number, input: InputManager, level: Level): void {
    this.handleInput(input)
    this.applyPhysics(deltaTime)
    this.checkCollisions(level)
    this.updateTimers(deltaTime)
    this.updateAnimation(deltaTime)
    this.handleDash(deltaTime, input) 
  }
  private updateAnimation(deltaTime: number): void {
    this.animationTimer += deltaTime
    if (this.animationTimer > 0.15) {
      this.animationFrame = (this.animationFrame + 1) % 4
      this.animationTimer = 0
    }
  }
  private handleInput(input: InputManager): void {
    this.velocityX = 0
    const currentSpeed = this.speedBoostTimer > 0 ? this.moveSpeed * 1.5 : this.moveSpeed
    if (input.isKeyDown("ArrowLeft") || input.isKeyDown("KeyA")) {
      this.velocityX = -currentSpeed
      this.facingDirection = -1
    }
    if (input.isKeyDown("ArrowRight") || input.isKeyDown("KeyD")) {
      this.velocityX = currentSpeed
      this.facingDirection = 1
    }
    const jumpPressed = input.isKeyPressed("Space") || input.isKeyPressed("ArrowUp") || input.isKeyPressed("KeyW")
    const currentTime = Date.now()
    const isReversed = this.game?.gameState?.isGravityReversed || false
    if (jumpPressed) {
      if (isReversed) {
        this.velocityY = this.jumpPower 
        this.lastJumpTime = currentTime
        this.particles.addGravityJumpEffect(this.x + this.width / 2, this.y + this.height / 2, isReversed)
        if (this.game?.audioManager) {
          this.game.audioManager.playSound("gravityJump")
        }
      } else {
        if (this.isGrounded) {
          this.velocityY = this.jumpPower
          this.isGrounded = false
          this.canDoubleJump = true
          this.hasDoubleJumped = false
          this.lastJumpTime = currentTime
          this.particles.addJumpEffect(this.x + this.width / 2, this.y + this.height)
        } else if (this.canDoubleJump && !this.hasDoubleJumped && currentTime - this.lastJumpTime > 100) {
          this.velocityY = this.jumpPower * 0.8
          this.hasDoubleJumped = true
          this.canDoubleJump = false
          this.particles.addJumpEffect(this.x + this.width / 2, this.y + this.height / 2)
        }
      }
    }
    if (input.isKeyPressed("ControlLeft") || input.isKeyPressed("KeyZ")) {
      this.shootDebugPulse()
    }
    if (input.isKeyPressed("KeyX")) {
      this.activateGravityReversal()
    }
  }
  private handleDash(deltaTime: number, input: InputManager): void {
    if (!this.game) return
    const dashPressed = input.isKeyPressed("KeyC") 
    const { gameState } = this.game
    if (gameState.isDashing) {
      this.x += this.dashSpeed * this.facingDirection * deltaTime
      gameState.dashCooldownTimer += deltaTime 
      if (gameState.dashCooldownTimer >= this.dashDuration) {
        gameState.isDashing = false
        gameState.dashCooldownTimer = this.dashCooldown 
        this.velocityX = 0 
        this.velocityY = 0 
      }
    } else {
      if (gameState.dashCooldownTimer > 0) {
        gameState.dashCooldownTimer -= deltaTime
        if (gameState.dashCooldownTimer < 0) {
          gameState.dashCooldownTimer = 0
        }
      }
      if (dashPressed && gameState.dashCooldownTimer <= 0) {
        gameState.isDashing = true
        gameState.dashCooldownTimer = 0 
        this.game.audioManager.playSound("dash") 
        this.particles.addDashEffect(this.x + this.width / 2, this.y + this.height / 2, this.facingDirection)
        this.makeInvulnerable(this.dashDuration * 1000) 
      }
    }
  }
  private applyPhysics(deltaTime: number): void {
    const isReversed = this.game?.gameState?.isGravityReversed || false
    const gravityDirection = isReversed ? -1 : 1
    if (!this.game?.gameState?.isDashing) {
      this.velocityY += this.gravity * gravityDirection * deltaTime
      if (isReversed) {
        if (this.velocityY < -this.maxFallSpeed) {
          this.velocityY = -this.maxFallSpeed
        }
      } else {
        if (this.velocityY > this.maxFallSpeed) {
          this.velocityY = this.maxFallSpeed
        }
      }
      this.x += this.velocityX * deltaTime
      this.y += this.velocityY * deltaTime
    }
  }
  private checkCollisions(level: Level): void {
    const bounds = this.getBounds()
    const wasGrounded = this.isGrounded
    const isReversed = this.game?.gameState?.isGravityReversed || false
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
          this.handleTileCollision(tileRect, tile, isReversed)
        }
      }
    }
    for (const platform of level.movingPlatforms) {
      const platformBounds = platform.getBounds()
      if (bounds.intersects(platformBounds)) {
        if (
          this.y + this.height - this.velocityY * this.game.lastDeltaTime <= platformBounds.y &&
          this.y + this.height > platformBounds.y
        ) {
          this.y = platformBounds.y - this.height 
          this.velocityY = 0
          this.isGrounded = true
          this.canDoubleJump = false
          this.hasDoubleJumped = false
          this.x += platform.velocityX * this.game.lastDeltaTime
          this.y += platform.velocityY * this.game.lastDeltaTime
        } else if (!this.game?.gameState?.isDashing) {
          const overlapX = Math.min(
            bounds.x + bounds.width - platformBounds.x,
            platformBounds.x + platformBounds.width - bounds.x,
          )
          const overlapY = Math.min(
            bounds.y + bounds.height - platformBounds.y,
            platformBounds.y + platformBounds.height - bounds.y,
          )
          if (overlapX < overlapY) {
            if (bounds.x < platformBounds.x) {
              this.x = platformBounds.x - this.width
            } else {
              this.x = platformBounds.x + platformBounds.width
            }
            this.velocityX = 0
          } else {
            if (bounds.y < platformBounds.y) {
              this.y = platformBounds.y - this.height
              this.velocityY = 0
              this.isGrounded = true
            } else {
              this.y = platformBounds.y + this.height
              this.velocityY = 0
            }
          }
        }
      }
    }
    for (const field of level.forceFields) {
      if (field.isActive && bounds.intersects(field.getBounds())) {
        if (!this.isInvulnerable) {
          this.game.playerDied() 
        }
      }
    }
    for (const trap of level.spikeTraps) {
      if (trap.isActive && bounds.intersects(trap.getBounds())) {
        if (!this.isInvulnerable) {
          this.game.playerDied() 
        }
      }
    }
    if (!wasGrounded && this.isGrounded && Math.abs(this.velocityY) > 200) {
      const effectY = isReversed ? this.y : this.y + this.height
      this.particles.addJumpEffect(this.x + this.width / 2, effectY)
    }
    if (isReversed && this.y < 0) {
      this.y = 0
      this.velocityY = Math.max(0, this.velocityY) 
      this.isGrounded = true 
    }
  }
  private handleTileCollision(tileRect: Rectangle, tileType: number, isReversed: boolean): void {
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
      if (isReversed) {
        if (bounds.y > tileRect.y) {
          this.y = tileRect.y + tileRect.height
          this.velocityY = Math.min(0, this.velocityY) 
          this.isGrounded = true
        } else {
          this.y = tileRect.y - this.height
          this.velocityY = Math.max(0, this.velocityY) 
        }
      } else {
        if (bounds.y < tileRect.y) {
          this.y = tileRect.y - this.height
          this.velocityY = 0
          this.isGrounded = true
          this.canDoubleJump = false 
          this.hasDoubleJumped = false
        } else {
          this.y = tileRect.y + this.height
          this.velocityY = 0
        }
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
      const direction = this.facingDirection
      const upgrades = this.game.gameState.weaponUpgrades
      const piercing = upgrades.piercing
      const damage = 50 + upgrades.power * 25 
      const bulletSize = upgrades.power > 0 ? 12 : 8 
      if (upgrades.spread > 0) {
        const spreadCount = 1 + upgrades.spread
        const spreadAngle = 0.3 
        for (let i = 0; i < spreadCount; i++) {
          const angle = (i - (spreadCount - 1) / 2) * spreadAngle
          const bulletX = this.x + this.width / 2
          const bulletY = this.y + this.height / 2
          this.game.createBullet(bulletX, bulletY, direction, piercing, damage, angle, bulletSize)
        }
      } else {
        this.game.createBullet(
          this.x + this.width / 2,
          this.y + this.height / 2,
          direction,
          piercing,
          damage,
          0,
          bulletSize,
        )
      }
      this.game.gameState.debugPulseReady = false
      const baseCooldown = 2000 
      const cooldownReduction = upgrades.rapidFire * 400
      const finalCooldown = Math.max(200, baseCooldown - cooldownReduction)
      setTimeout(() => {
        if (this.game) {
          this.game.gameState.debugPulseReady = true
        }
      }, finalCooldown)
    }
  }
  private activateGravityReversal(): void {
    if (this.game && this.game.gameState.gravityReversalUses > 0 && !this.game.gameState.isGravityReversed) {
      this.game.activateGravityReversal()
      this.particles.addGravityReversalEffect(this.x + this.width / 2, this.y + this.height / 2)
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
    const screenY = this.y 
    const time = Date.now() / 1000
    const isReversed = this.game?.gameState?.isGravityReversed || false
    const isDashing = this.game?.gameState?.isDashing || false
    ctx.save() 
    if (this.isInvulnerable && !isDashing) {
      ctx.globalAlpha = 0.5 + Math.sin(time * 20) * 0.5
    }
    if (this.speedBoostTimer > 0) {
      ctx.shadowColor = "#ffff00"
      ctx.shadowBlur = 15
    }
    let playerColor = this.game?.gameState?.playerColor || "#00ff00"
    if (this.isInvulnerable && !isDashing) playerColor = "#ff00ff"
    if (isReversed) playerColor = `rgba(255, 0, 255, ${0.9 + Math.sin(time * 6) * 0.1})`
    if (isDashing) playerColor = `rgba(0, 255, 255, ${0.9 + Math.sin(time * 15) * 0.1})`
    ctx.fillStyle = playerColor
    ctx.font = "32px monospace" 
    ctx.textAlign = "center"
    ctx.textBaseline = "middle" 
    ctx.shadowColor = playerColor
    ctx.shadowBlur = 10
    let sprites: string[]
    if (this.facingDirection === 1) {
      sprites = ["◢", "◣", "◤", "◥"] 
    } else {
      sprites = ["◣", "◢", "◥", "◤"] 
    }
    let sprite: string
    if (isDashing) {
      sprite = "»" 
      ctx.font = "40px monospace"
      ctx.shadowBlur = 20 + Math.sin(time * 20) * 10
    } else if (Math.abs(this.velocityX) > 10) {
      sprite = sprites[this.animationFrame]
    } else {
      sprite = this.game?.gameState?.playerCharacterSymbol || (isReversed ? "◇" : "◆")
    }
    if (Math.abs(this.velocityX) > 10 && !isDashing) {
      ctx.save() 
      ctx.globalAlpha = 0.4
      const trailSprite = sprites[(this.animationFrame + 2) % 4]
      ctx.fillText(trailSprite, screenX + this.width / 2 - this.facingDirection * 12, screenY + this.height / 2)

      ctx.globalAlpha = 0.2
      ctx.fillText(trailSprite, screenX + this.width / 2 - this.facingDirection * 24, screenY + this.height / 2)
      ctx.restore() 
    }
    if (isReversed && !isDashing) {
      ctx.shadowColor = "#ff00ff" 
      ctx.shadowBlur = 25 + Math.sin(time * 8) * 5
      ctx.translate(screenX + this.width / 2, screenY + this.height / 2)
      ctx.rotate(Math.PI + Math.sin(time * 10) * 0.2)
      ctx.fillText(sprite, 0, 0) 
    } else {
      ctx.fillText(sprite, screenX + this.width / 2, screenY + this.height / 2)
    }
    ctx.restore() 
    if (isReversed && !isDashing) {
      ctx.fillStyle = `rgba(255, 0, 255, ${0.8 + Math.sin(time * 8) * 0.2})`
      ctx.font = "14px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "alphabetic"
      ctx.fillText("↕", screenX + this.width / 2, screenY - 15)
      ctx.fillText("∞", screenX + this.width / 2 - 15, screenY - 5)
      ctx.fillText("∞", screenX + this.width / 2 + 15, screenY - 5)
      if (Math.random() < 0.5) {
        ctx.fillStyle = `rgba(255, 0, 255, ${Math.random()})`
        ctx.fillRect(screenX + Math.random() * this.width, screenY + Math.random() * this.height, 2, 2)
      }
      for (let i = 0; i < 3; i++) {
        const angle = time * 2 + i * ((Math.PI * 2) / 3)
        const radius = 20 + Math.sin(time * 4) * 5
        const particleX = screenX + this.width / 2 + Math.cos(angle) * radius
        const particleY = screenY + this.height / 2 + Math.sin(angle) * radius
        ctx.fillStyle = `rgba(255, 0, 255, ${0.6 + Math.sin(time * 6 + i) * 0.4})`
        ctx.fillRect(particleX - 1, particleY - 1, 2, 2)
      }
    }
  }
  takeDamage(): void {
    this.particles.addDeathEffect(this.x + this.width / 2, this.y + this.height / 2)
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
    this.animationFrame = 0
    this.animationTimer = 0
    this.facingDirection = 1
  }
}
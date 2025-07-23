import type { Rectangle, BossData, GameState } from "./types"
import type { Game } from "./game"
import type { EnhancedPlayer } from "./enhanced-player"
import type { ParticleSystem } from "./particle"

export class Boss {
  x: number
  y: number
  width: number
  height: number
  health: number
  maxHealth: number
  type: string
  isActive = true
  private game: Game
  private particles: ParticleSystem
  private attackTimer = 0
  private attackCooldown = 3 
  private currentAttackIndex = 0
  private attackPattern: string[]
  private moveTimer = 0
  private moveCooldown = 2 
  private targetX: number
  private targetY: number
  private moveSpeed = 50
  constructor(data: BossData, game: Game, particles: ParticleSystem) {
    this.x = data.x
    this.y = data.y
    this.type = data.type
    this.health = data.health
    this.maxHealth = data.health
    this.attackPattern = data.attackPattern
    this.game = game
    this.particles = particles
    switch (this.type) {
      case "kernelWarden":
        this.width = 96
        this.height = 96
        break
      case "dataOverlord":
        this.width = 128
        this.height = 64
        break
      case "cyberneticGuardian":
        this.width = 80
        this.height = 120
        break
      case "voidEntity":
        this.width = 100
        this.height = 100
        break
      default:
        this.width = 64
        this.height = 64
    }

    this.targetX = this.x
    this.targetY = this.y
  }
  update(deltaTime: number, player: EnhancedPlayer, gameState: GameState): void {
    if (!this.isActive) return

    const speedMultiplier = gameState.powerUps.timeWarp > 0 ? 0.5 : 1

    this.moveTimer += deltaTime
    if (this.moveTimer >= this.moveCooldown) {
      this.moveTimer = 0
      this.setNewTarget(player)
    }
    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 5) {
      this.x += (dx / distance) * this.moveSpeed * deltaTime * speedMultiplier
      this.y += (dy / distance) * this.moveSpeed * deltaTime * speedMultiplier
    }

    this.attackTimer += deltaTime
    if (this.attackTimer >= this.attackCooldown / speedMultiplier) {
      this.attackTimer = 0
      this.performAttack(player)
      this.currentAttackIndex = (this.currentAttackIndex + 1) % this.attackPattern.length
    }
  }
  private setNewTarget(player: EnhancedPlayer): void {
    switch (this.type) {
      case "kernelWarden":
        this.targetX = this.game.player.x + (Math.random() - 0.5) * 200
        this.targetY = this.game.player.y + (Math.random() - 0.5) * 100
        break
      case "dataOverlord":
        this.targetX = this.x + (Math.random() - 0.5) * 300
        this.targetY = this.y + (Math.random() - 0.5) * 150
        break
      case "cyberneticGuardian":
        this.targetX = this.x + (Math.random() - 0.5) * 100
        this.targetY = this.y + (Math.random() - 0.5) * 50
        break
      case "voidEntity":
        this.targetX = this.game.player.x + (Math.random() - 0.5) * 400
        this.targetY = this.game.player.y + (Math.random() - 0.5) * 200
        break
    }

    if (this.game.currentLevel) {
      this.targetX = Math.max(this.width / 2, Math.min(this.game.currentLevel.width - this.width / 2, this.targetX))
      this.targetY = Math.max(this.height / 2, Math.min(this.game.currentLevel.height - this.height / 2, this.targetY))
    }
  }

  private performAttack(player: EnhancedPlayer): void {
    const attackType = this.attackPattern[this.currentAttackIndex]
    const bulletSpeed = 200
    const playerCenterX = player.x + player.width / 2
    const playerCenterY = player.y + player.height / 2
    const bossCenterX = this.x + this.width / 2
    const bossCenterY = this.y + this.height / 2

    switch (this.type) {
      case "kernelWarden":
        if (attackType === "projectileBurst") {
          for (let i = 0; i < 5; i++) {
            const angleOffset = (i - 2) * 0.2 
            const angle = Math.atan2(playerCenterY - bossCenterY, playerCenterX - bossCenterX) + angleOffset
            this.game.createEnemyBullet(
              bossCenterX,
              bossCenterY,
              Math.cos(angle) * bulletSpeed,
              Math.sin(angle) * bulletSpeed,
              "enemyPulse",
            )
          }
          this.game.audioManager.playSound("bossAttack1")
        } else if (attackType === "chargeAttack") {
          const chargeSpeed = 400
          const angle = Math.atan2(playerCenterY - bossCenterY, playerCenterX - bossCenterX)
          this.x += Math.cos(angle) * chargeSpeed * 0.5 
          this.y += Math.sin(angle) * chargeSpeed * 0.5
          this.particles.addExplosion(bossCenterX, bossCenterY, "#ff0000")
          this.game.audioManager.playSound("bossAttack2")
        }
        break

      case "dataOverlord":
        if (attackType === "plasmaBarrage") {
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              const angle = Math.atan2(playerCenterY - bossCenterY, playerCenterX - bossCenterX)
              this.game.createEnemyBullet(
                bossCenterX,
                bossCenterY,
                Math.cos(angle) * 150,
                Math.sin(angle) * 150,
                "plasmaBall",
              )
            }, i * 200) 
          }
          this.game.audioManager.playSound("bossAttack1")
        } else if (attackType === "dataDrain") {
          this.particles.addDataDrainEffect(bossCenterX, bossCenterY)
          this.game.audioManager.playSound("bossAttack2")
        }
        break

      case "cyberneticGuardian":
        if (attackType === "laserSweep") {
          for (let i = 0; i < 7; i++) {
            const angleOffset = (i - 3) * 0.15
            const angle = Math.atan2(playerCenterY - bossCenterY, playerCenterX - bossCenterX) + angleOffset
            this.game.createEnemyBullet(
              bossCenterX,
              bossCenterY,
              Math.cos(angle) * 300,
              Math.sin(angle) * 300,
              "enemyPulse",
            )
          }
          this.game.audioManager.playSound("bossAttack1")
        } else if (attackType === "shieldBash") {
          this.makeInvulnerable(1000)
          this.particles.addExplosion(bossCenterX, bossCenterY, "#00ffff")
          if (this.getBounds().intersects(player.getBounds())) {
            const pushForce = 300
            const angle = Math.atan2(playerCenterY - bossCenterY, playerCenterX - bossCenterX)
            player.x += Math.cos(angle) * pushForce * 0.1
            player.y += Math.sin(angle) * pushForce * 0.1
          }
          this.game.audioManager.playSound("bossAttack2")
        }
        break
      case "voidEntity":
        if (attackType === "distortionWave") {
          for (let i = 0; i < 3; i++) {
            const angleOffset = (i - 1) * 0.3
            const angle = Math.atan2(playerCenterY - bossCenterY, playerCenterX - bossCenterX) + angleOffset
            this.game.createEnemyBullet(
              bossCenterX,
              bossCenterY,
              Math.cos(angle) * 100,
              Math.sin(angle) * 100,
              "plasmaBall", 
            )
          }
          this.particles.addVoidEffect(bossCenterX, bossCenterY)
          this.game.audioManager.playSound("bossAttack1")
        } else if (attackType === "shadowClone") {
          for (let i = 0; i < 2; i++) {
            this.particles.addShadowCloneEffect(
              bossCenterX + (Math.random() - 0.5) * 100,
              bossCenterY + (Math.random() - 0.5) * 50,
            )
          }
          this.game.audioManager.playSound("bossAttack2")
        }
        break
    }
  }
  takeDamage(amount: number): void {
    if (!this.isActive) return
    this.health -= amount
    this.game.audioManager.playSound("bossHit")
    this.particles.addExplosion(this.x + this.width / 2, this.y + this.height / 2, "#ff0000")

    if (this.health <= 0) {
      this.health = 0
      this.isActive = false
      this.game.handleBossDefeat()
    }
  }
  makeInvulnerable(duration: number): void {
    this.particles.addExplosion(this.x + this.width / 2, this.y + this.height / 2, "#ffffff")
  }
  render(ctx: CanvasRenderingContext2D, cameraX: number, levelId: number): void {
    if (!this.isActive) return
    const screenX = this.x - cameraX + 100
    const time = Date.now() / 1000
    const styleGroup = Math.floor((levelId - 1) / 5)

    ctx.save()

    let bossColor = "#ff0000"
    let glowColor = "#ff0000"
    let symbol = "Ω" 
    let fontSize = "48px monospace"

    switch (styleGroup) {
      case 0: 
        bossColor = "#ff0000"
        glowColor = "#ff0000"
        symbol = "Ω"
        fontSize = "48px monospace"
        break
      case 1: 
        bossColor = "#800080"
        glowColor = "#00ffff"
        symbol = "Ψ"
        fontSize = "52px monospace"
        break
      case 2: 
        bossColor = "#ffaa00" 
        glowColor = "#ff0000"
        symbol = "Δ" 
        fontSize = "48px monospace"
        break
      case 3: 
        bossColor = "#444444"
        glowColor = "#ffffff"
        symbol = "Ø"
        fontSize = "56px monospace"
        break
    }
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 20 + Math.sin(time * 6) * 10

    ctx.fillStyle = bossColor
    ctx.font = fontSize
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    switch (this.type) {
      case "kernelWarden":
        ctx.fillText(symbol, screenX + this.width / 2, this.y + this.height / 2)
        ctx.fillStyle = `rgba(255, 255, 0, ${0.5 + Math.sin(time * 10) * 0.5})`
        ctx.beginPath()
        ctx.arc(screenX + this.width / 2, this.y + this.height / 2, 10 + Math.sin(time * 8) * 3, 0, Math.PI * 2)
        ctx.fill()
        break
      case "dataOverlord":
        ctx.fillText(symbol, screenX + this.width / 2, this.y + this.height / 2)
        ctx.fillStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(time * 12) * 0.2})`
        for (let i = 0; i < 5; i++) {
          ctx.fillText("~", screenX + Math.random() * this.width, this.y + Math.random() * this.height)
        }
        break
      case "cyberneticGuardian":
        ctx.fillText(symbol, screenX + this.width / 2, this.y + this.height / 2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(time * 7) * 0.2})`
        ctx.lineWidth = 2
        ctx.strokeRect(screenX + 5, this.y + 5, this.width - 10, this.height - 10)
        break
      case "voidEntity":
        ctx.fillText(symbol, screenX + this.width / 2, this.y + this.height / 2)
        if (Math.random() < 0.3) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`
          ctx.fillText(
            String.fromCharCode(0x2580 + Math.floor(Math.random() * 16)),
            screenX + Math.random() * this.width,
            this.y + Math.random() * this.height,
          )
        }
        break
      default:
        ctx.fillText(symbol, screenX + this.width / 2, this.y + this.height / 2)
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
    this.health = this.maxHealth
    this.isActive = true
    this.attackTimer = 0
    this.currentAttackIndex = 0
    this.moveTimer = 0
  }
}
import type { GameState } from "./types"
export class Renderer {
  private ctx: CanvasRenderingContext2D
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }
  characterCustomizationOptions = [
    {
      label: "Symbol",
      type: "symbol",
      values: [
        "◆",
        "◎",
        "▧",
        "◒",
        "◓",
        "◩",
        "◪",
        "◫",
        "◰",
        "◱",
        "◲",
        "◳",
        "◴",
        "◵",
        "◶",
        "◷",
        "◸",
        "◹",
        "◺",
        "◹",
        "◸",
        "◿",
      ],
    },
    {
      label: "Color",
      type: "color",
      values: ["#00ff00", "#00ffff", "#ff00ff", "#ffff00", "#ff8800", "#0000ff", "#ffffff", "#888888"],
    },
    { label: "Back", type: "action", value: "back" },
  ]
  renderMainMenu(gameState: GameState): void {
    const ctx = this.ctx
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2
    const time = Date.now() / 1000
    this.renderAnimatedGrid()
    ctx.shadowColor = "#00ff00"
    ctx.shadowBlur = 10
    ctx.strokeStyle = "#00ff00"
    ctx.lineWidth = 3
    ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100)
    ctx.shadowBlur = 0
    const glitchOffset = Math.sin(time * 10) * 2
    ctx.fillStyle = "#ff0000"
    ctx.font = "bold 48px monospace"
    ctx.textAlign = "center"
    ctx.fillText("CYBER WARRIOR", centerX + glitchOffset, centerY - 100 + 1)

    ctx.fillStyle = "#00ff00"
    ctx.fillText("CYBER WARRIOR", centerX, centerY - 100)
    ctx.font = "24px monospace"
    const subtitle = "A MINIGAEME BY ℜ𝔞𝔨𝔢𝔰𝔥"
    const typewriterLength = Math.floor((time * 3) % (subtitle.length + 10))
    const displayText = subtitle.substring(0, Math.min(typewriterLength, subtitle.length))
    ctx.fillText(displayText + (typewriterLength < subtitle.length ? "_" : ""), centerX, centerY - 60)
    ctx.font = "20px monospace"
    const menuOptions = ["Start Game", "Levels", "Character", "Instructions"] 

    menuOptions.forEach((option, index) => {
      const isSelected = gameState.menuSelection === index
      const yPos = centerY + 20 + index * 30

      if (isSelected) {
        ctx.shadowColor = "#ffff00"
        ctx.shadowBlur = 15
        ctx.fillStyle = "#ffff00"
        const pulseSize = 3 + Math.sin(time * 8) * 2
        const pointerX = centerX - 120
        ctx.beginPath()
        ctx.arc(pointerX, yPos - 8, pulseSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(pointerX, yPos - 8, pulseSize + 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.3
        ctx.beginPath()
        ctx.arc(pointerX, yPos - 8, pulseSize + 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
        ctx.shadowColor = "#ffff00"
        ctx.shadowBlur = 15
        ctx.fillStyle = "#ffff00"
        const bracket1 = ">" + " ".repeat(Math.floor(Math.sin(time * 8) * 2 + 3))
        const bracket2 = " ".repeat(Math.cos(time * 8) * 2 + 3) + "<"
        ctx.fillText(bracket1 + option + bracket2, centerX, yPos)
      } else {
        ctx.shadowBlur = 0
        ctx.fillStyle = "#00ff00"
        ctx.fillText("  " + option, centerX, yPos)
      }
    })

    ctx.shadowBlur = 0
    ctx.font = "16px monospace"
    ctx.fillStyle = `rgba(136, 136, 136, ${0.7 + Math.sin(time * 2) * 0.3})`
    ctx.fillText("Use ARROW KEYS or MOUSE to navigate, ENTER/CLICK to select", centerX, centerY + 140)
    ctx.font = "14px monospace"
    ctx.fillStyle = `rgba(100, 255, 100, ${0.6 + Math.sin(time * 3) * 0.2})`
    ctx.fillText("◆ = Player Character | X = Gravity Reversal (∞ Jump) | Z/Ctrl = Shoot", centerX, centerY + 170)
    this.renderScanlines()
    this.renderMatrixRain()
  }

  renderHUD(gameState: GameState, currentSector: number): void {
    const ctx = this.ctx
    const time = Date.now() / 1000
    const gradient = ctx.createLinearGradient(0, 0, 0, 40)
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.9)")
    gradient.addColorStop(1, "rgba(0, 50, 0, 0.8)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, ctx.canvas.width, 40)
    ctx.shadowColor = "#00ff00"
    ctx.shadowBlur = 5
    ctx.strokeStyle = "#00ff00"
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, ctx.canvas.width, 40)
    ctx.shadowBlur = 0
    ctx.fillStyle = "#00ff00"
    ctx.font = "16px monospace"
    ctx.textAlign = "left"

    const pulseAlpha = 0.8 + Math.sin(time * 4) * 0.2
    const debugPulseColor = gameState.debugPulseReady
      ? `rgba(0, 255, 0, ${pulseAlpha})`
      : `rgba(255, 255, 0, ${pulseAlpha})`

    const hudText = `[SECTOR: ${currentSector.toString().padStart(2, "0")}]  [LIVES: ${gameState.lives.toString().padStart(2, "0")}]  [FRAGMENTS: ${gameState.fragments.toString().padStart(3, "0")}]`
    ctx.fillText(hudText, 10, 25)
    ctx.fillStyle = debugPulseColor
    ctx.fillText(`[DEBUG PULSE: ${gameState.debugPulseReady ? "READY" : "CHARGING"}]`, 450, 25)
    const gravityColor = gameState.isGravityReversed
      ? `rgba(255, 0, 255, ${0.8 + Math.sin(time * 8) * 0.2})`
      : gameState.gravityReversalUses > 0
        ? `rgba(255, 0, 255, ${pulseAlpha})`
        : "rgba(100, 100, 100, 0.5)"

    ctx.fillStyle = gravityColor
    const gravityText = gameState.isGravityReversed
      ? `[GRAVITY: REVERSED ${Math.ceil(gameState.gravityReversalTimer)}s ∞ JUMP]`
      : `[GRAVITY REV: ${gameState.gravityReversalUses}x]`
    ctx.fillText(gravityText, 10, ctx.canvas.height - 35)
    ctx.fillStyle = "#ffa500" 
    ctx.font = "14px monospace"
    const upgrades = gameState.weaponUpgrades
    let upgradeText = "[WEAPON: "

    if (upgrades.rapidFire > 0) upgradeText += `RF:${upgrades.rapidFire} `
    if (upgrades.piercing > 0) upgradeText += `P:${upgrades.piercing} `
    if (upgrades.spread > 0) upgradeText += `S:${upgrades.spread} `
    if (upgrades.power > 0) upgradeText += `PWR:${upgrades.power} `

    upgradeText += "]"
    ctx.fillText(upgradeText, 10, ctx.canvas.height - 15)
    if (gameState.powerUps.timeWarp > 0) {
      ctx.fillStyle = `rgba(0, 255, 255, ${0.8 + Math.sin(time * 8) * 0.2})`
      ctx.fillText(`[TIME WARP: ${Math.ceil(gameState.powerUps.timeWarp)}s]`, 750, ctx.canvas.height - 15)
    }
    ctx.shadowColor = "#00ffff"
    ctx.shadowBlur = 3
    ctx.fillStyle = "#00ffff"
    ctx.textAlign = "right"
    ctx.fillText(`SCORE: ${gameState.score}`, ctx.canvas.width - 10, 25)
    ctx.shadowBlur = 0
  }

  renderBossHealthBar(gameState: GameState, bossType: string): void {
    if (!gameState.isBossActive || gameState.bossMaxHealth === 0) return

    const ctx = this.ctx
    const barWidth = ctx.canvas.width * 0.8
    const barHeight = 20
    const barX = (ctx.canvas.width - barWidth) / 2
    const barY = 50 

    const healthPercentage = gameState.bossHealth / gameState.bossMaxHealth
    const currentBarWidth = barWidth * healthPercentage

    let barColor = "#ff0000" 
    let borderColor = "#ff0000"
    const textColor = "#ffffff"
    let bossName = ""

    switch (bossType) {
      case "kernelWarden":
        barColor = "#ff0000"
        borderColor = "#ff0000"
        bossName = "KERNEL WARDEN"
        break
      case "dataOverlord":
        barColor = "#800080" 
        borderColor = "#00ffff" 
        bossName = "DATA OVERLORD"
        break
      case "cyberneticGuardian":
        barColor = "#ffaa00"
        borderColor = "#ff0000"
        bossName = "CYBERNETIC GUARDIAN"
        break
      case "voidEntity":
        barColor = "#444444"
        borderColor = "#ffffff"
        bossName = "VOID ENTITY"
        break
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.fillRect(barX, barY, barWidth, barHeight)

    ctx.fillStyle = barColor
    ctx.fillRect(barX, barY, currentBarWidth, barHeight)

    ctx.shadowColor = borderColor
    ctx.shadowBlur = 8
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 2
    ctx.strokeRect(barX, barY, barWidth, barHeight)
    ctx.shadowBlur = 0

    ctx.fillStyle = textColor
    ctx.font = "16px monospace"
    ctx.textAlign = "center"
    ctx.fillText(
      `${bossName} - ${Math.ceil(gameState.bossHealth)} / ${gameState.bossMaxHealth}`,
      ctx.canvas.width / 2,
      barY + barHeight / 2 + 6,
    )
  }

  renderGameOver(gameState: GameState): void {
    const ctx = this.ctx
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2

    ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.strokeStyle = "#ff0000"
    ctx.lineWidth = 2
    ctx.strokeRect(centerX - 200, centerY - 100, 400, 200)

    ctx.fillStyle = "#ff0000"
    ctx.font = "bold 32px monospace"
    ctx.textAlign = "center"
    ctx.fillText("SYSTEM CORRUPTED!", centerX, centerY - 40)

    ctx.font = "18px monospace"
    ctx.fillText("You ran out of lives...", centerX, centerY)

    ctx.fillStyle = "#00ff00"
    ctx.font = "16px monospace"
    ctx.fillText("> Try Again", centerX, centerY + 40)
    ctx.fillText("  Return to Main Menu", centerX, centerY + 65)

    ctx.fillStyle = "#888888"
    ctx.fillText("Press ENTER or CLICK to try again", centerX, centerY + 100)
  }

  renderVictory(gameState: GameState): void {
    const ctx = this.ctx
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2

    ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.strokeStyle = "#00ff00"
    ctx.lineWidth = 3
    ctx.strokeRect(centerX - 250, centerY - 150, 500, 300)

    ctx.fillStyle = "#00ff00"
    ctx.font = "bold 36px monospace"
    ctx.textAlign = "center"
    ctx.fillText("SYSTEM RESTORED!", centerX, centerY - 80)

    ctx.font = "20px monospace"
    if (gameState.currentLevelIndex === 19) {
      ctx.fillText("You defeated the Void Entity!", centerX, centerY - 40)
    } else {
      ctx.fillText("Sector Cleared!", centerX, centerY - 40)
    }

    ctx.font = "16px monospace"
    const minutes = Math.floor(gameState.gameTime / 60)
    const seconds = Math.floor(gameState.gameTime % 60)
    ctx.fillText(`Total Fragments: ${gameState.fragments}/1600`, centerX, centerY + 10)
    ctx.fillText(
      `Final Time: ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      centerX,
      centerY + 35,
    )
    ctx.fillText(`Final Score: ${gameState.score}`, centerX, centerY + 60)

    ctx.fillText("> PLAY AGAIN", centerX, centerY + 100)
    ctx.fillText("  EXIT", centerX, centerY + 125)

    ctx.fillStyle = "#888888"
    ctx.fillText("Press ENTER or CLICK to continue", centerX, centerY + 160)
  }

  renderPauseOverlay(): void {
    const ctx = this.ctx
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.fillStyle = "#00ff00"
    ctx.font = "bold 48px monospace"
    ctx.textAlign = "center"
    ctx.fillText("PAUSED", centerX, centerY)

    ctx.font = "16px monospace"
    ctx.fillStyle = "#888888"
    ctx.fillText("Press ESC to resume", centerX, centerY + 40)
  }

  private renderScanlines(): void {
    const ctx = this.ctx
    ctx.strokeStyle = "rgba(0, 255, 0, 0.1)"
    ctx.lineWidth = 1

    for (let y = 0; y < ctx.canvas.height; y += 4) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(ctx.canvas.width, y)
      ctx.stroke()
    }
  }

  private renderAnimatedGrid(): void {
    const ctx = this.ctx
    const time = Date.now() / 1000

    ctx.strokeStyle = `rgba(0, 255, 0, ${0.1 + Math.sin(time) * 0.05})`
    ctx.lineWidth = 1

    const gridSize = 40

    for (let x = 0; x < ctx.canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, ctx.canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y < ctx.canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(ctx.canvas.width, y)
      ctx.stroke()
    }
  }

  private renderMatrixRain(): void {
    const ctx = this.ctx
    const time = Date.now() / 100

    ctx.font = "12px monospace"
    ctx.textAlign = "left"

    for (let x = 0; x < ctx.canvas.width; x += 20) {
      const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
      const char = chars[Math.floor((time + x) / 10) % chars.length]
      const alpha = Math.max(0, Math.sin((time + x) / 50) * 0.3)

      ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`
      ctx.fillText(char, x, 100 + Math.sin((time + x) / 30) * 20)
    }
  }

  renderLevelsScreen(gameState: GameState): void {
    const ctx = this.ctx
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2
    const time = Date.now() / 1000

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.strokeStyle = "#00ff00"
    ctx.lineWidth = 2
    ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100)

    ctx.fillStyle = "#00ff00"
    ctx.font = "bold 32px monospace"
    ctx.textAlign = "center"
    ctx.fillText("SELECT SECTOR", centerX, 120)

    ctx.font = "16px monospace"
    const cols = 5
    const rows = 4
    const startX = centerX - (cols * 80) / 2
    const startY = 180

    for (let i = 0; i < 20; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * 80
      const y = startY + row * 60

      const isSelected = gameState.levelSelection === i

      if (isSelected) {
        ctx.shadowColor = "#ffff00"
        ctx.shadowBlur = 10
        ctx.fillStyle = "#ffff00"

        const pulseSize = 2 + Math.sin(time * 10) * 1
        ctx.beginPath()
        ctx.arc(x - 35, y - 5, pulseSize, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowBlur = 0
        ctx.fillStyle = "#ffff00"
        ctx.strokeStyle = "#ffff00"
        ctx.strokeRect(x - 25, y - 20, 50, 30)
      } else {
        ctx.fillStyle = "#00ff00"
      }

      ctx.textAlign = "center"
      ctx.fillText(`${(i + 1).toString().padStart(2, "0")}`, x, y)
    }

    ctx.font = "14px monospace"
    ctx.fillStyle = "#888888"
    ctx.textAlign = "center"
    ctx.fillText("ARROW KEYS: Navigate | ENTER/CLICK: Select | ESC: Back", centerX, ctx.canvas.height - 80)

    this.renderScanlines()
  }

  renderCharacterCustomization(gameState: GameState): void {
    const ctx = this.ctx
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2
    const time = Date.now() / 1000

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.strokeStyle = "#00ffff"
    ctx.lineWidth = 2
    ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100)

    ctx.fillStyle = "#00ffff"
    ctx.font = "bold 32px monospace"
    ctx.textAlign = "center"
    ctx.fillText("CUSTOMIZE CYBER WARRIOR", centerX, 120)

    const startY = ctx.canvas.height / 2 - 50
    const optionHeight = 40

    this.characterCustomizationOptions.forEach((option, index) => {
      const isSelected = gameState.menuSelection === index
      const yPos = startY + index * optionHeight

      ctx.font = "24px monospace"
      ctx.textAlign = "center"

      if (isSelected) {
        ctx.shadowColor = "#ffff00"
        ctx.shadowBlur = 10
        ctx.fillStyle = "#ffff00"
        const pulseSize = 2 + Math.sin(time * 10) * 1
        ctx.beginPath()
        ctx.arc(centerX - 150, yPos - 5, pulseSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        ctx.fillStyle = "#00ff00"
      }

      let displayValue = ""
      if (option.type === "symbol") {
        displayValue = gameState.playerCharacterSymbol
      } else if (option.type === "color") {
        displayValue = gameState.playerColor
      } else if (option.type === "action") {
        displayValue = option.value
      }

      ctx.fillText(`${option.label}: ${displayValue}`, centerX, yPos)

      if (option.type === "symbol") {
        ctx.fillStyle = gameState.playerColor
        ctx.font = "48px monospace"
        ctx.fillText(gameState.playerCharacterSymbol, centerX + 150, yPos - 5)
      } else if (option.type === "color") {
        ctx.fillStyle = gameState.playerColor
        ctx.fillRect(centerX + 130, yPos - 20, 40, 20)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 1
        ctx.strokeRect(centerX + 130, yPos - 20, 40, 20)
      }
    })

    ctx.font = "14px monospace"
    ctx.fillStyle = "#888888"
    ctx.textAlign = "center"
    ctx.fillText("ARROW KEYS: Navigate | ENTER/CLICK: Select | ESC: Back", centerX, ctx.canvas.height - 80)

    this.renderScanlines()
  }

  renderInstructions(): void {
    const ctx = this.ctx
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2
    const time = Date.now() / 1000

    ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.strokeStyle = "#00ffff"
    ctx.lineWidth = 2
    ctx.strokeRect(50, 50, ctx.canvas.width - 100, ctx.canvas.height - 100)

    ctx.fillStyle = "#00ffff"
    ctx.font = "bold 32px monospace"
    ctx.textAlign = "center"
    ctx.fillText("SYSTEM INSTRUCTIONS", centerX, 120)

    ctx.fillStyle = "#00ff00"
    ctx.font = "18px monospace"
    ctx.textAlign = "left"
    const textX = centerX - 300
    let textY = 180
    const lineHeight = 25

    const instructions = [
      "Welcome, Cyber Warrior!",
      "",
      "Your mission: Navigate the digital realm,",
      "collect code fragments, and defeat viruses.",
      "",
      "CONTROLS:",
      "  ARROW KEYS / WASD: Move Cyber Warrior",
      "  SPACE / ARROW UP / W: Jump (Double Jump available)",
      "  CTRL / Z: Shoot Debug Pulse (recharges)",
      "  X: Activate Gravity Reversal (4s, unlimited jumps)",
      "  C: Dash (Short-range evasion, grants invulnerability)",
      "  ESC: Pause Game / Back to Menu",
      "  R: Restart Current Level",
      "",
      "COLLECTIBLES:",
      "  ◦ Code Fragment: Basic collectible, increases score.",
      "  ● Data Chunk: Valuable collectible, higher score.",
      "",
      "POWER-UPS:",
      "  ⚡ Firewall Shield: Grants temporary invulnerability.",
      "  ▲ Overclock Chip: Increases movement speed.",
      "  ◈ Debug Pulse: Instantly recharges your shoot ability.",
      "  ♦ Restore Point: Respawns you at current location on death.",
      "  ⏳ Time Warp: Slows down all enemies for a duration.",
      "  💥 Data Overload: Destroys all on-screen enemies.",
      "",
      "HAZARDS:",
      "  ※ Glitch Bugs & ◊ Firewall Drones: Enemies, avoid or shoot!",
      "  ▲ Antivirus Lasers: Stationary hazards, cause damage.",
      "  ═ Moving Platforms: Navigate carefully!",
      "  █ Force Fields: Periodically activate, cause damage!",
      "  ▲ Spike Traps: Emerge from ground, cause damage!",
      "",
      "Good luck, Cyber Warrior. The network depends on you!",
    ]

    instructions.forEach((line) => {
      ctx.fillText(line, textX, textY)
      textY += lineHeight
    })

    ctx.fillStyle = "#ffff00"
    ctx.font = "20px monospace"
    ctx.textAlign = "center"
    ctx.fillText("> Back to Main Menu <", centerX, centerY + 150)

    this.renderScanlines()
  }

  renderTransitionOverlay(alpha: number): void {
    const ctx = this.ctx
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.restore()
  }
}

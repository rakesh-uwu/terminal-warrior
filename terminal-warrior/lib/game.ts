import { type GameState, GameScreen } from "./types"
import { EnhancedPlayer } from "./enhanced-player"
import { Level } from "./level"
import { InputManager } from "./input"
import { Renderer } from "./renderer"
import { AudioManager } from "./audio"
import { levels } from "./levels"
import { ParticleSystem } from "./particle"
import type { CanvasRenderingContext2D } from "canvas"
import { Bullet } from "./bullet"

export class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private _gameState: GameState
  private _player: EnhancedPlayer
  private _currentLevel: Level | null = null
  private inputManager: InputManager
  private renderer: Renderer
  private _audioManager: AudioManager
  private _particles: ParticleSystem
  private lastTime = 0
  private animationId: number | null = null
  private lastClickTime = 0
  private lastHoveredMenuOption: number | null = null 
  public lastDeltaTime = 0 

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.inputManager = new InputManager()
    this.renderer = new Renderer(this.ctx)
    this._audioManager = new AudioManager()
    this._particles = new ParticleSystem()
    this._gameState = {
      screen: GameScreen.MAIN_MENU,
      currentLevelIndex: 0,
      lives: 3,
      fragments: 0,
      totalFragments: 0,
      score: 0,
      gameTime: 0,
      isPaused: false,
      debugPulseReady: true,
      menuSelection: 0,
      levelSelection: 0,
      bullets: [],
      enemyBullets: [], 
      gravityReversalUses: 3,
      isGravityReversed: false,
      gravityReversalTimer: 0,
      powerUps: {
        firewallShield: 0,
        overclockChip: 0,
        debugPulse: 0,
        restorePoint: false,
        timeWarp: 0, 
        dataOverload: 0,
      },
      weaponUpgrades: {
        rapidFire: 0,
        piercing: 0,
        spread: 0,
        power: 0,
      },
      playerCharacterSymbol: "◆", 
      playerColor: "#00ff00", 
      transitionAlpha: 1, 
      transitionTimer: 0,
      isTransitioning: false,
      nextScreen: null,
      dashCooldownTimer: 0,
      isDashing: false, 
      isBossActive: false,
      bossHealth: 0,
      bossMaxHealth: 0,
      bossType: "",
    }

    this._player = new EnhancedPlayer(100, 400, this, this._particles)
  }
  private readonly startTransition = (nextScreen: GameScreen): void => {
    if (this.gameState.isTransitioning) return
    this.gameState.isTransitioning = true
    this.gameState.transitionTimer = 0
    this.gameState.transitionAlpha = 0 
    this.gameState.nextScreen = nextScreen
    this._audioManager.playSound("menuSelect")
  }
  async init(): Promise<void> {
    await this._audioManager.init()
    this.inputManager.setCanvas(this.canvas)
    this.setupEventListeners()
  }
  private setupEventListeners(): void {
    this.inputManager.onKeyPress("Enter", () => {
      if (this.gameState.isTransitioning) return 
      if (this.gameState.screen === GameScreen.MAIN_MENU) {
        this.handleMenuSelection()
      } else if (this.gameState.screen === GameScreen.LEVELS) {
        this.handleLevelSelection()
      } else if (this.gameState.screen === GameScreen.CHARACTER_CUSTOMIZATION) {
        this.handleCharacterCustomizationSelection()
      } else if (this.gameState.screen === GameScreen.GAME_OVER || this.gameState.screen === GameScreen.VICTORY) {
        this.resetGame()
      } else if (this.gameState.screen === GameScreen.INSTRUCTIONS) {
        this.startTransition(GameScreen.MAIN_MENU)
        this._audioManager.playSound("menuSelect")
      }
    })
    this.inputManager.onKeyPress("ArrowUp", () => {
      if (this.gameState.isTransitioning) return
      if (this.gameState.screen === GameScreen.MAIN_MENU) {
        this.gameState.menuSelection = Math.max(0, this.gameState.menuSelection - 1)
        this._audioManager.playSound("menuMove")
      } else if (this.gameState.screen === GameScreen.LEVELS) {
        const currentRow = Math.floor(this.gameState.levelSelection / 5)
        if (currentRow > 0) {
          this.gameState.levelSelection = Math.max(0, this.gameState.levelSelection - 5)
          this.audioManager.playSound("menuMove")
        }
      } else if (this.gameState.screen === GameScreen.CHARACTER_CUSTOMIZATION) {
        this.gameState.menuSelection = Math.max(0, this.gameState.menuSelection - 1)
        this.audioManager.playSound("menuMove")
      }
    })
    this.inputManager.onKeyPress("ArrowDown", () => {
      if (this.gameState.isTransitioning) return
      if (this.gameState.screen === GameScreen.MAIN_MENU) {
        this.gameState.menuSelection = Math.min(3, this.gameState.menuSelection + 1)
        this.audioManager.playSound("menuMove")
      } else if (this.gameState.screen === GameScreen.LEVELS) {
        const currentRow = Math.floor(this.gameState.levelSelection / 5)
        const maxRow = Math.floor(19 / 5) 
        if (currentRow < maxRow) {
          this.gameState.levelSelection = Math.min(19, this.gameState.levelSelection + 5)
          this.audioManager.playSound("menuMove")
        }
      } else if (this.gameState.screen === GameScreen.CHARACTER_CUSTOMIZATION) {
        this.gameState.menuSelection = Math.min(
          this.renderer.characterCustomizationOptions.length - 1,
          this.gameState.menuSelection + 1,
        )
        this.audioManager.playSound("menuMove")
      }
    })
    this.inputManager.onKeyPress("ArrowLeft", () => {
      if (this.gameState.isTransitioning) return
      if (this.gameState.screen === GameScreen.LEVELS) {
        
        const currentCol = this.gameState.levelSelection % 5
        if (currentCol > 0) {
          this.gameState.levelSelection = Math.max(0, this.gameState.levelSelection - 1)
          this.audioManager.playSound("menuMove")
        }
      } else if (this.gameState.screen === GameScreen.CHARACTER_CUSTOMIZATION) {
        this.handleCharacterCustomizationChange(-1)
        this.audioManager.playSound("menuMove")
      }
    })
    this.inputManager.onKeyPress("ArrowRight", () => {
      if (this.gameState.isTransitioning) return
      if (this.gameState.screen === GameScreen.LEVELS) {
        const currentCol = this.gameState.levelSelection % 5
        if (currentCol < 4 && this.gameState.levelSelection < 19) {
          this.gameState.levelSelection = Math.min(19, this.gameState.levelSelection + 1)
          this.audioManager.playSound("menuMove")
        }
      } else if (this.gameState.screen === GameScreen.CHARACTER_CUSTOMIZATION) {
        this.handleCharacterCustomizationChange(1)
        this.audioManager.playSound("menuMove")
      }
    })
    this.inputManager.onKeyPress("Escape", () => {
      if (this.gameState.isTransitioning) return
      if (this.gameState.screen === GameScreen.PLAYING) {
        this.gameState.isPaused = !this.gameState.isPaused
      } else if (
        this.gameState.screen === GameScreen.LEVELS ||
        this.gameState.screen === GameScreen.INSTRUCTIONS ||
        this.gameState.screen === GameScreen.CHARACTER_CUSTOMIZATION
      ) {
        this.startTransition(GameScreen.MAIN_MENU)
      }
    })
    this.inputManager.onKeyPress("KeyR", () => {
      if (this.gameState.screen === GameScreen.PLAYING) {
        this.restartLevel()
      }
    })

    this.inputManager.onKeyPress("KeyX", () => {
      if (this.gameState.screen === GameScreen.PLAYING && !this.gameState.isPaused) {
        if (this.gameState.gravityReversalUses > 0 && !this.gameState.isGravityReversed) {
          this.activateGravityReversal()
        }
      }
    })
  }
  start(): void {
    this.gameLoop(0)
  }

  private gameLoop = (currentTime: number): void => {
    const deltaTime = (currentTime - this.lastTime) / 1000
    this.lastDeltaTime = deltaTime 
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()

    this.animationId = requestAnimationFrame(this.gameLoop)
  }
  private update(deltaTime: number): void {
    if (this._gameState.isTransitioning) {
      this._gameState.transitionTimer += deltaTime
      const transitionDuration = 0.5 
      if (this._gameState.nextScreen === GameScreen.PLAYING || this._gameState.nextScreen === GameScreen.BOSS_BATTLE) {
        this._gameState.transitionAlpha = 1 - Math.min(1, this._gameState.transitionTimer / transitionDuration)
      } else {
        this._gameState.transitionAlpha = Math.min(1, this._gameState.transitionTimer / transitionDuration)
      }
      if (this._gameState.transitionTimer >= transitionDuration) {
        this._gameState.isTransitioning = false
        this._gameState.transitionTimer = 0
        if (this._gameState.nextScreen !== null) {
          this._gameState.screen = this._gameState.nextScreen
          this._gameState.nextScreen = null
          this._gameState.transitionAlpha = 1 
        }
      }
      return 
    }
    if (this._gameState.isPaused) return
    switch (this._gameState.screen) {
      case GameScreen.PLAYING:
      case GameScreen.BOSS_BATTLE: 
        this.updateGame(deltaTime)
        break
      case GameScreen.MAIN_MENU:
        this.updateMainMenu(deltaTime)
        break
      case GameScreen.LEVELS:
        this.updateLevelsScreen(deltaTime)
        break
      case GameScreen.CHARACTER_CUSTOMIZATION:
        this.updateCharacterCustomizationScreen(deltaTime)
        break
      case GameScreen.GAME_OVER:
        this.updateGameOverScreen(deltaTime)
        break
      case GameScreen.VICTORY:
        this.updateVictoryScreen(deltaTime)
        break
      case GameScreen.INSTRUCTIONS:
        this.updateInstructionsScreen(deltaTime)
        break
    }
  }
  private updateGame(deltaTime: number): void {
    if (!this._currentLevel) return
    this.gameState.gameTime += deltaTime
    if (this.gameState.isGravityReversed) {
      this.gameState.gravityReversalTimer -= deltaTime
      if (this.gameState.gravityReversalTimer <= 0) {
        this.deactivateGravityReversal()
      }
    }
    if (this.gameState.powerUps.timeWarp > 0) {
      this.gameState.powerUps.timeWarp -= deltaTime
      if (this.gameState.powerUps.timeWarp <= 0) {
      }
    }
    this.player.update(deltaTime, this.inputManager, this._currentLevel)
    this.gameState.bullets = this.gameState.bullets.filter((bullet) => {
      bullet.update(deltaTime, this._currentLevel, this.gameState.isGravityReversed) 
      return bullet.isActive
    })
    this.gameState.enemyBullets = this.gameState.enemyBullets.filter((bullet) => {
      bullet.update(deltaTime, this._currentLevel, this.gameState.isGravityReversed) 
      return bullet.isActive
    })
    this._currentLevel.update(deltaTime, this.player, this.gameState)
    this._particles.update(deltaTime)
    this.checkCollisions()
    if (!this.gameState.isBossActive && this.player.x > this._currentLevel.width - 100) {
      this.completeLevel()
    }
    if (this.player.y > this._currentLevel.height + 100) {
      this.playerDied()
    }
  }
  private updateMainMenu(deltaTime: number): void {
    const currentTime = Date.now()
    const clickDelay = 200

    const menuOptions = ["Start Game", "Levels", "Character", "Instructions"]
    const optionHeight = 30
    const optionWidth = 200
    const startY = this.canvas.height / 2 + 20
    const centerX = this.canvas.width / 2
    let hoveredOption: number | null = null
    menuOptions.forEach((_, index) => {
      const yPos = startY + index * optionHeight
      const xPos = centerX - optionWidth / 2
      if (
        this.inputManager.getMouseX() >= xPos &&
        this.inputManager.getMouseX() <= xPos + optionWidth &&
        this.inputManager.getMouseY() >= yPos - optionHeight / 2 &&
        this.inputManager.getMouseY() <= yPos + optionHeight / 2
      ) {
        hoveredOption = index
      }
    })
    if (hoveredOption !== null && hoveredOption !== this.lastHoveredMenuOption) {
      this.gameState.menuSelection = hoveredOption
      this.audioManager.playSound("menuHover")
    }
    this.lastHoveredMenuOption = hoveredOption
    if (this.inputManager.isMouseClicked() && currentTime - this.lastClickTime > clickDelay) {
      if (hoveredOption !== null) {
        this.gameState.menuSelection = hoveredOption
        this.handleMenuSelection()
        this.lastClickTime = currentTime
        this.audioManager.playSound("menuSelect")
      }
    }
  }
  private updateLevelsScreen(deltaTime: number): void {
    const currentTime = Date.now()
    const clickDelay = 200
    const cols = 5
    const rows = 4
    const startX = this.canvas.width / 2 - (cols * 80) / 2
    const startY = 180
    const tileWidth = 50
    const tileHeight = 30
    const tileSpacingX = 80
    const tileSpacingY = 60
    let hoveredLevel: number | null = null
    for (let i = 0; i < 20; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * tileSpacingX
      const y = startY + row * tileSpacingY
      const clickableX = x - tileWidth / 2
      const clickableY = y - tileHeight / 2
      if (
        this.inputManager.getMouseX() >= clickableX &&
        this.inputManager.getMouseX() <= clickableX + tileWidth &&
        this.inputManager.getMouseY() >= clickableY &&
        this.inputManager.getMouseY() <= clickableY + tileHeight
      ) {
        hoveredLevel = i
      }
    }
    if (hoveredLevel !== null && hoveredLevel !== this.gameState.levelSelection) {
      this.gameState.levelSelection = hoveredLevel
      this.audioManager.playSound("menuHover")
    }
    if (this.inputManager.isMouseClicked() && currentTime - this.lastClickTime > clickDelay) {
      if (hoveredLevel !== null) {
        this.gameState.levelSelection = hoveredLevel
        this.handleLevelSelection()
        this.lastClickTime = currentTime
        this.audioManager.playSound("menuSelect")
      }
    }
  }

  private updateCharacterCustomizationScreen(deltaTime: number): void {
    const currentTime = Date.now()
    const clickDelay = 200

    const centerX = this.canvas.width / 2
    const startY = this.canvas.height / 2 - 50

    const options = this.renderer.characterCustomizationOptions
    const optionHeight = 40
    const optionWidth = 300

    let hoveredOption: number | null = null

    options.forEach((_, index) => {
      const yPos = startY + index * optionHeight
      const xPos = centerX - optionWidth / 2

      if (
        this.inputManager.getMouseX() >= xPos &&
        this.inputManager.getMouseX() <= xPos + optionWidth &&
        this.inputManager.getMouseY() >= yPos - optionHeight / 2 &&
        this.inputManager.getMouseY() <= yPos + optionHeight / 2
      ) {
        hoveredOption = index
      }
    })

    if (hoveredOption !== null && hoveredOption !== this.gameState.menuSelection) {
      this.gameState.menuSelection = hoveredOption
      this.audioManager.playSound("menuHover")
    }

    if (this.inputManager.isMouseClicked() && currentTime - this.lastClickTime > clickDelay) {
      if (hoveredOption !== null) {
        this.handleCharacterCustomizationSelection()
        this.lastClickTime = currentTime
        this.audioManager.playSound("menuSelect")
      }
    }
  }

  private updateGameOverScreen(deltaTime: number): void {
    const currentTime = Date.now()
    const clickDelay = 200

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    const tryAgainX = centerX
    const tryAgainY = centerY + 40
    const tryAgainWidth = 150
    const tryAgainHeight = 20

    const mainMenuX = centerX
    const mainMenuY = centerY + 65
    const mainMenuWidth = 200
    const mainMenuHeight = 20

    let hoveredOption: "tryAgain" | "mainMenu" | null = null

    if (
      this.inputManager.getMouseX() >= tryAgainX - tryAgainWidth / 2 &&
      this.inputManager.getMouseX() <= tryAgainX + tryAgainWidth / 2 &&
      this.inputManager.getMouseY() >= tryAgainY - tryAgainHeight / 2 &&
      this.inputManager.getMouseY() <= tryAgainY + tryAgainHeight / 2
    ) {
      hoveredOption = "tryAgain"
    } else if (
      this.inputManager.getMouseX() >= mainMenuX - mainMenuWidth / 2 &&
      this.inputManager.getMouseX() <= mainMenuX + mainMenuWidth / 2 &&
      this.inputManager.getMouseY() >= mainMenuY - mainMenuHeight / 2 &&
      this.inputManager.getMouseY() <= mainMenuY + mainMenuHeight / 2
    ) {
      hoveredOption = "mainMenu"
    }

    if (hoveredOption === "tryAgain" && this.lastHoveredMenuOption !== 0) {
      this.lastHoveredMenuOption = 0
      this.audioManager.playSound("menuHover")
    } else if (hoveredOption === "mainMenu" && this.lastHoveredMenuOption !== 1) {
      this.lastHoveredMenuOption = 1
      this.audioManager.playSound("menuHover")
    } else if (hoveredOption === null) {
      this.lastHoveredMenuOption = null
    }

    if (this.inputManager.isMouseClicked() && currentTime - this.lastClickTime > clickDelay) {
      if (hoveredOption === "tryAgain") {
        this.resetGame()
        this.lastClickTime = currentTime
        this.audioManager.playSound("menuSelect")
      } else if (hoveredOption === "mainMenu") {
        this.startTransition(GameScreen.MAIN_MENU)
        this.resetGame()
        this.lastClickTime = currentTime
        this.audioManager.playSound("menuSelect")
      }
    }
  }

  private updateVictoryScreen(deltaTime: number): void {
    const currentTime = Date.now()
    const clickDelay = 200

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    const playAgainX = centerX
    const playAgainY = centerY + 100
    const playAgainWidth = 150
    const playAgainHeight = 20

    const exitX = centerX
    const exitY = centerY + 125
    const exitWidth = 100
    const exitHeight = 20

    let hoveredOption: "playAgain" | "exit" | null = null

    if (
      this.inputManager.getMouseX() >= playAgainX - playAgainWidth / 2 &&
      this.inputManager.getMouseX() <= playAgainX + playAgainWidth / 2 &&
      this.inputManager.getMouseY() >= playAgainY - playAgainHeight / 2 &&
      this.inputManager.getMouseY() <= playAgainY + playAgainHeight / 2
    ) {
      hoveredOption = "playAgain"
    } else if (
      this.inputManager.getMouseX() >= exitX - exitWidth / 2 &&
      this.inputManager.getMouseX() <= exitX + exitWidth / 2 &&
      this.inputManager.getMouseY() >= exitY - exitHeight / 2 &&
      this.inputManager.getMouseY() <= exitY + exitHeight / 2
    ) {
      hoveredOption = "exit"
    }

    if (hoveredOption === "playAgain" && this.lastHoveredMenuOption !== 0) {
      this.lastHoveredMenuOption = 0
      this.audioManager.playSound("menuHover")
    } else if (hoveredOption === "exit" && this.lastHoveredMenuOption !== 1) {
      this.lastHoveredMenuOption = 1
      this.audioManager.playSound("menuHover")
    } else if (hoveredOption === null) {
      this.lastHoveredMenuOption = null
    }

    if (this.inputManager.isMouseClicked() && currentTime - this.lastClickTime > clickDelay) {
      if (hoveredOption === "playAgain") {
        this.resetGame()
        this.lastClickTime = currentTime
        this.audioManager.playSound("menuSelect")
      } else if (hoveredOption === "exit") {
        this.startTransition(GameScreen.MAIN_MENU)
        this.resetGame()
        this.lastClickTime = currentTime
        this.audioManager.playSound("menuSelect")
      }
    }
  }

  private updateInstructionsScreen(deltaTime: number): void {
    const currentTime = Date.now()
    const clickDelay = 200

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    const backButtonX = centerX
    const backButtonY = centerY + 150
    const backButtonWidth = 250
    const backButtonHeight = 20

    let hoveredOption: "back" | null = null

    if (
      this.inputManager.getMouseX() >= backButtonX - backButtonWidth / 2 &&
      this.inputManager.getMouseX() <= backButtonX + backButtonWidth / 2 &&
      this.inputManager.getMouseY() >= backButtonY - backButtonHeight / 2 &&
      this.inputManager.getMouseY() <= backButtonY + backButtonHeight / 2
    ) {
      hoveredOption = "back"
    }

    if (hoveredOption === "back" && this.lastHoveredMenuOption !== 0) {
      this.lastHoveredMenuOption = 0
      this.audioManager.playSound("menuHover")
    } else if (hoveredOption === null) {
      this.lastHoveredMenuOption = null
    }

    if (this.inputManager.isMouseClicked() && currentTime - this.lastClickTime > clickDelay) {
      if (hoveredOption === "back") {
        this.startTransition(GameScreen.MAIN_MENU)
        this.lastClickTime = currentTime
        this.audioManager.playSound("menuSelect")
      }
    }
  }
  private checkCollisions(): void {
    if (!this._currentLevel) return
    for (const bullet of this.gameState.bullets) {
      if (!bullet.isActive) continue
      for (const enemy of this._currentLevel.enemies) {
        if (enemy.isActive && bullet.getBounds().intersects(enemy.getBounds())) {
          bullet.hitEnemy() 
          enemy.destroy()
          this.gameState.score += 200
          this.audioManager.playSound("enemyHit")
          this._particles.addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#ff0000")
          if (!bullet.isActive) break
        }
      }
      if (this._currentLevel.boss && this._currentLevel.boss.isActive) {
         if (bullet.getBounds().intersects(this._currentLevel.boss.getBounds())) {
           bullet.hitEnemy() 
           this._currentLevel.boss.takeDamage(bullet.damage)
           this.gameState.bossHealth = this._currentLevel.boss.health
           if (!bullet.isActive) break
         }
      }
    }
    for (const enemy of this._currentLevel.enemies) {
      if (enemy.isActive && this.player.getBounds().intersects(enemy.getBounds())) {
        if (this.gameState.isDashing) {
          enemy.destroy()
          this.gameState.score += 150 
          this.audioManager.playSound("enemyHit")
          this.particles.addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#00ffff")
        } else if (enemy.type === "dataLeech") {
          if (!this.player.isInvulnerable) {
            this.gameState.fragments = Math.max(0, this.gameState.fragments - 5) 
            this.audioManager.playSound("enemyHit") 
            this.player.makeInvulnerable(500) 
          }
        } else if (this.player.velocityY > 0 && this.player.y < enemy.y) {
          enemy.destroy()
          this.player.velocityY = -300
          this.gameState.score += 100
          this.particles.addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#00ff00")
        } else if (!this.player.isInvulnerable) {
          this.playerDied()
        }
      }
    }
    if (this._currentLevel.boss && this._currentLevel.boss.isActive) {
      if (this.player.getBounds().intersects(this._currentLevel.boss.getBounds())) {
        if (this.gameState.isDashing) {
          this._currentLevel.boss.takeDamage(25)
          this.gameState.bossHealth = this._currentLevel.boss.health
          this.particles.addExplosion(
            this._currentLevel.boss.x + this._currentLevel.boss.width / 2,
            this._currentLevel.boss.y + this._currentLevel.boss.height / 2,
            "#00ffff",
          )
        } else if (!this.player.isInvulnerable) {
          this.playerDied()
        }
      }
    }
    for (const enemyBullet of this.gameState.enemyBullets) {
      if (!enemyBullet.isActive) continue
      if (this.player.getBounds().intersects(enemyBullet.getBounds())) {
        enemyBullet.isActive = false
        if (!this.player.isInvulnerable) {
          this.playerDied()
        }
      }
    }
    for (const collectible of this._currentLevel.collectibles) {
      if (collectible.isActive && this.player.getBounds().intersects(collectible.getBounds())) {
        collectible.collect()
        this.gameState.fragments += collectible.value
        this.gameState.score += collectible.value * 10
        this.audioManager.playSound("collect")
        this.particles.addCollectEffect(collectible.x + collectible.width / 2, collectible.y + collectible.height / 2)
      }
    }
    for (const powerUp of this._currentLevel.powerUps) {
      if (powerUp.isActive && this.player.getBounds().intersects(powerUp.getBounds())) {
        powerUp.collect()
        this.applyPowerUp(powerUp.type)
        this.audioManager.playSound("powerup")
      }
    }
    if (this._currentLevel.weaponUpgrades) {
      for (const upgrade of this._currentLevel.weaponUpgrades) {
        if (upgrade.isActive && this.player.getBounds().intersects(upgrade.getBounds())) {
          upgrade.collect()
          this.applyWeaponUpgrade(upgrade.type, upgrade.level)
          this.audioManager.playSound("powerup")
          this.particles.addCollectEffect(upgrade.x + upgrade.width / 2, upgrade.y + upgrade.height / 2)
        }
      }
    }
  }
  private applyWeaponUpgrade(type: string, level: number): void {
    const maxLevel = type === "piercing" || type === "spread" ? 2 : 3
    switch (type) {
      case "rapidFire":
        this.gameState.weaponUpgrades.rapidFire = Math.min(maxLevel, this.gameState.weaponUpgrades.rapidFire + level)
        break
      case "piercing":
        this.gameState.weaponUpgrades.piercing = Math.min(maxLevel, this.gameState.weaponUpgrades.piercing + level)
        break
      case "spread":
        this.gameState.weaponUpgrades.spread = Math.min(maxLevel, this.gameState.weaponUpgrades.spread + level)
        break
      case "power":
        this.gameState.weaponUpgrades.power = Math.min(maxLevel, this.gameState.weaponUpgrades.power + level)
        break
    }
    this.gameState.score += 500 
  }
  private applyPowerUp(type: string): void {
    switch (type) {
      case "firewallShield":
        this.player.makeInvulnerable(5000)
        break
      case "overclockChip":
        this.player.applySpeedBoost(3000)
        break
      case "debugPulse":
        this.gameState.debugPulseReady = true
        break
      case "restorePoint":
        this.gameState.powerUps.restorePoint = true
        break
      case "timeWarp":
        this.gameState.powerUps.timeWarp = 5000 
        this.audioManager.playSound("timeWarp")
        break
      case "dataOverload":
        this._currentLevel?.enemies.forEach((enemy) => {
          if (enemy.isActive) {
            enemy.destroy()
            this.gameState.score += 200 
            this.particles.addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#ff0000")
          }
        })
        if (this._currentLevel?.boss && this._currentLevel.boss.isActive) {
          this._currentLevel.boss.takeDamage(this._currentLevel.boss.maxHealth * 0.15)
          this.gameState.bossHealth = this._currentLevel.boss.health
          this.particles.addExplosion(
              this._currentLevel.boss.x + this._currentLevel.boss.width / 2,
              this._currentLevel.boss.y + this._currentLevel.boss.height / 2,
              "#ffffff",
            )
        }
        this.audioManager.playSound("dataOverload")
        break
    }
  }
  private playerDied(): void {
    this._gameState.lives--
    this._audioManager.playSound("death")
    this._particles.addDeathEffect(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2)
    if (this._gameState.lives <= 0) {
      this.startTransition(GameScreen.GAME_OVER)
    } else {
      this.restartLevel()
    }
  }
  private completeLevel(): void {
    this._audioManager.playSound("levelComplete")

    if (this._gameState.currentLevelIndex >= levels.length - 1) {
      this.startTransition(GameScreen.VICTORY)
    } else {
      this._gameState.currentLevelIndex++
      this.loadLevel(this._gameState.currentLevelIndex)
    }
  }
  public handleBossDefeat(): void {
    this._gameState.isBossActive = false
    this._audioManager.playSound("bossDefeat")
    this._particles.addExplosion(
      this._currentLevel!.boss!.x + this._currentLevel!.boss!.width / 2,
          this._currentLevel!.boss!.y + this._currentLevel!.boss!.height / 2,
      "#00ff00",
    )
    this._gameState.score += 5000
    this.completeLevel()
  }

  private startGame(): void {
    this.startTransition(GameScreen.PLAYING)
    this.loadLevel(this._gameState.currentLevelIndex)
  }

  private loadLevel(levelIndex: number): void {
    if (levelIndex < levels.length) {
      this._currentLevel = new Level(levels[levelIndex], this)
      this.player.reset(this._currentLevel.startX, this._currentLevel.startY)
      this._particles.clear() 
      this._gameState.enemyBullets = []
      if (this._currentLevel.boss) {
         this._gameState.isBossActive = true
         this._gameState.bossHealth = this._currentLevel.boss.health
         this._gameState.bossMaxHealth = this._currentLevel.boss.maxHealth
         this._gameState.bossType = this._currentLevel.boss.type
        this.startTransition(GameScreen.BOSS_BATTLE) 
        this._audioManager.playSound("bossIntro") 
      } else {
        this._gameState.isBossActive = false
        this._gameState.bossHealth = 0
        this._gameState.bossMaxHealth = 0
        this._gameState.bossType = ""
        this.startTransition(GameScreen.PLAYING) 
      }
      const styleGroup = Math.floor(levelIndex / 5) 
      if (levelIndex % 5 === 0) {
        switch (styleGroup) {
          case 0:
            this.audioManager.playSound("worldStyle1Transition")
            break
          case 1:
            this.audioManager.playSound("worldStyle2Transition")
            break
          case 2:
            this.audioManager.playSound("worldStyle3Transition")
            break
          case 3:
            this.audioManager.playSound("worldStyle4Transition")
            break
        }
      }
    }
  }
  private restartLevel(): void {
    if (this._currentLevel) {
      this._currentLevel.reset()
        this.player.reset(this._currentLevel.startX, this._currentLevel.startY)
      this.particles.clear()
      this.gameState.enemyBullets = []
      if (this._currentLevel.boss) {
         this.gameState.isBossActive = true
         this.gameState.bossHealth = this._currentLevel.boss.health
         this.gameState.bossMaxHealth = this._currentLevel.boss.maxHealth
         this.gameState.bossType = this._currentLevel.boss.type
       } else {
         this.gameState.isBossActive = false
        this.gameState.bossHealth = 0
        this.gameState.bossMaxHealth = 0
        this.gameState.bossType = ""
      }
    }
  }
  private resetGame(): void {
    this._gameState = {
      screen: GameScreen.MAIN_MENU,
      currentLevelIndex: 0,
      lives: 3,
      fragments: 0,
      totalFragments: 0,
      score: 0,
      gameTime: 0,
      isPaused: false,
      debugPulseReady: true,
      menuSelection: 0,
      levelSelection: 0,
      bullets: [],
      enemyBullets: [],
      gravityReversalUses: 3,
      isGravityReversed: false,
      gravityReversalTimer: 0,
      powerUps: {
        firewallShield: 0,
        overclockChip: 0,
        debugPulse: 0,
        restorePoint: false,
        timeWarp: 0,
        dataOverload: 0,
      },
      weaponUpgrades: {
        rapidFire: 0,
        piercing: 0,
        spread: 0,
        power: 0,
      },
      playerCharacterSymbol: "◆",
      playerColor: "#00ff00",
      transitionAlpha: 1,
      transitionTimer: 0,
      isTransitioning: false,
      nextScreen: null,
      dashCooldownTimer: 0,
      isDashing: false,
      isBossActive: false,
      bossHealth: 0,
      bossMaxHealth: 0,
      bossType: "",
    }
    this._player.reset(100, 400)
    this._particles.clear()
    this._gameState.enemyBullets = []
  }

  private render(): void {
    this.ctx.fillStyle = "#000000"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    switch (this.gameState.screen) {
      case GameScreen.MAIN_MENU:
        this.renderer.renderMainMenu(this.gameState)
        break
      case GameScreen.LEVELS:
        this.renderer.renderLevelsScreen(this.gameState)
        break
      case GameScreen.CHARACTER_CUSTOMIZATION:
        this.renderer.renderCharacterCustomization(this.gameState)
        break
      case GameScreen.PLAYING:
      case GameScreen.BOSS_BATTLE: 
        this.renderGame()
        break
      case GameScreen.GAME_OVER:
        this.renderer.renderGameOver(this.gameState)
        break
      case GameScreen.VICTORY:
        this.renderer.renderVictory(this.gameState)
        break
      case GameScreen.INSTRUCTIONS:
        this.renderer.renderInstructions()
        break
    }
    if (this.gameState.isTransitioning) {
      this.renderer.renderTransitionOverlay(this.gameState.transitionAlpha)
    }
  }
  private renderGame(): void {
    if (!this._currentLevel) return

    const currentLevelId = this._gameState.currentLevelIndex + 1
    this._currentLevel.render(this.ctx, this.player.x, currentLevelId)
    this._gameState.bullets.forEach((bullet) => bullet.render(this.ctx, this.player.x)) 
    this._gameState.enemyBullets.forEach((bullet) => bullet.render(this.ctx, this.player.x))
    this.player.render(this.ctx, this.player.x)
    this._particles.render(this.ctx, this.player.x)
    this.renderer.renderHUD(this._gameState, currentLevelId)
    if (this._gameState.isBossActive && this._currentLevel?.boss) {
      this.renderer.renderBossHealthBar(this._gameState, this._currentLevel.boss.type)
    }
    if (this._gameState.isPaused) {
      this.renderer.renderPauseOverlay()
    }
  }

  private handleMenuSelection(): void {
    switch (this.gameState.menuSelection) {
      case 0: 
        this.startGame()
        break
      case 1: 
        this.startTransition(GameScreen.LEVELS)
        break
      case 2: 
        this.startTransition(GameScreen.CHARACTER_CUSTOMIZATION)
        break
      case 3:
        this.startTransition(GameScreen.INSTRUCTIONS)
        break
    }
  }
  private handleLevelSelection(): void {
    this.gameState.currentLevelIndex = this.gameState.levelSelection
    this.startGame()
  }
  private handleCharacterCustomizationSelection(): void {
    const selectedOption = this.renderer.characterCustomizationOptions[this.gameState.menuSelection]
    if (selectedOption) {
      if (selectedOption.type === "symbol") {
        this.gameState.playerCharacterSymbol = selectedOption.value
      } else if (selectedOption.type === "color") {
        this.gameState.playerColor = selectedOption.value
      }
    }
  }
  private handleCharacterCustomizationChange(direction: number): void {
    const currentOptionIndex = this.gameState.menuSelection
    const currentOption = this.renderer.characterCustomizationOptions[currentOptionIndex]

    if (!currentOption) return

    if (currentOption.type === "symbol") {
      const symbols = [
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
      ]
      const currentIndex = symbols.indexOf(this.gameState.playerCharacterSymbol)
      const newIndex = (currentIndex + direction + symbols.length) % symbols.length 
      this.gameState.playerCharacterSymbol = symbols[newIndex]
    } else if (currentOption.type === "color") {
      const colors = ["#00ff00", "#ff0000", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]
      const currentIndex = colors.indexOf(this.gameState.playerColor)
      const newIndex = (currentIndex + direction + colors.length) % colors.length 
      this.gameState.playerColor = colors[newIndex]
    }
  }
  public createBullet(x: number, y: number, direction: number, piercing = 0, damage = 50, angle = 0, size = 8): void {
    const bullet = new Bullet(x, y, direction, false, "playerPulse", piercing, damage)
    if (angle !== 0) {
      const speed = 400
      bullet.velocityX = Math.cos(angle) * speed * direction
      bullet.velocityY = Math.sin(angle) * speed
    }
    bullet.width = size
    bullet.height = size / 2

    this.gameState.bullets.push(bullet)
    this.audioManager.playSound("shoot")
  }
  public createEnemyBullet(x: number, y: number, velocityX: number, velocityY: number, type: string): void {
    const newBullet = new Bullet(x, y, 0, true) 
    newBullet.velocityX = velocityX
    newBullet.velocityY = velocityY
    newBullet.width = type === "plasmaBall" ? 16 : 8 
    newBullet.height = type === "plasmaBall" ? 16 : 4
    newBullet.maxLifeTime = type === "plasmaBall" ? 5 : 3
    newBullet.isEnemyBullet = true 
    newBullet.type = type 
    this.gameState.enemyBullets.push(newBullet)
    this.audioManager.playSound("shoot") 
  }
  public activateGravityReversal(): void {
    this.gameState.isGravityReversed = true
    this.gameState.gravityReversalUses--
    this.gameState.gravityReversalTimer = 5 
    this.audioManager.playSound("gravityReverse")
  }
  private deactivateGravityReversal(): void {
    this.gameState.isGravityReversed = false
  }
  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.inputManager.destroy()
  }
  get player() {
    return this._player
  }

  get gameState() {
    return this._gameState
  }

  get audioManager() {
    return this._audioManager
  }

  get particles() {
    return this._particles
  }

  get currentLevel() {
    return this._currentLevel
  }
}

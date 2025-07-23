export interface Particle {
  x: number
  y: number
  velocityX: number
  velocityY: number
  life: number
  maxLife: number
  color: string
  size: number
  type: string
}

export class ParticleSystem {
  private particles: Particle[] = []
  update(deltaTime: number): void {
    this.particles = this.particles.filter((particle) => {
      particle.x += particle.velocityX * deltaTime
      particle.y += particle.velocityY * deltaTime
      particle.life -= deltaTime
      if (particle.type === "spark" || particle.type === "debris") {
        particle.velocityY += 300 * deltaTime
      }
      return particle.life > 0
    })
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    this.particles.forEach((particle) => {
      const screenX = particle.x - cameraX + 100
      const alpha = particle.life / particle.maxLife

      ctx.save()
      ctx.globalAlpha = alpha

      switch (particle.type) {
        case "spark":
          ctx.fillStyle = particle.color
          ctx.fillRect(screenX - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size)
          break

        case "glow":
          ctx.shadowColor = particle.color
          ctx.shadowBlur = particle.size
          ctx.fillStyle = particle.color
          ctx.fillRect(screenX - 1, particle.y - 1, 2, 2)
          break

        case "text":
          ctx.fillStyle = particle.color
          ctx.font = `${particle.size}px monospace`
          ctx.textAlign = "center"
          const symbol = particle.color === "#ff00ff" ? "↕" : "•"
          ctx.fillText(symbol, screenX, particle.y)
          break

        case "debris":
          ctx.fillStyle = particle.color
          ctx.font = "8px monospace"
          ctx.textAlign = "center"
          ctx.fillText("█", screenX, particle.y)
          break

        case "gravityJump":
          ctx.shadowColor = particle.color
          ctx.shadowBlur = particle.size
          ctx.fillStyle = particle.color
          ctx.font = "12px monospace"
          ctx.textAlign = "center"
          ctx.fillText("∞", screenX, particle.y)
          break

        case "dash":
          ctx.fillStyle = particle.color
          ctx.font = `${particle.size}px monospace`
          ctx.textAlign = "center"
          ctx.fillText("»", screenX, particle.y) 
          break

        case "dataDrain":
          ctx.fillStyle = particle.color
          ctx.font = `${particle.size}px monospace`
          ctx.textAlign = "center"
          ctx.fillText("~", screenX, particle.y)

        case "void":
          ctx.fillStyle = particle.color
          ctx.font = `${particle.size}px monospace`
          ctx.textAlign = "center"
          ctx.fillText("Ø", screenX, particle.y)
        case "shadowClone":
          ctx.fillStyle = particle.color
          ctx.font = `${particle.size}px monospace`
          ctx.textAlign = "center"
          ctx.fillText("¶", screenX, particle.y) 
          break
      }

      ctx.restore()
    })
  }

  addExplosion(x: number, y: number, color = "#ff0000"): void {
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15
      const speed = 100 + Math.random() * 100

      this.particles.push({
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 3,
        type: "spark",
      })
    }
  }

  addCollectEffect(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      const speed = 50 + Math.random() * 50

      this.particles.push({
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed - 50,
        life: 1,
        maxLife: 1,
        color: "#00ffff",
        size: 12,
        type: "text",
      })
    }
  }

  addJumpEffect(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + 20,
        velocityX: (Math.random() - 0.5) * 100,
        velocityY: -50 - Math.random() * 50,
        life: 0.3,
        maxLife: 0.3,
        color: "#00ff00",
        size: 8,
        type: "glow",
      })
    }
  }

  addGravityJumpEffect(x: number, y: number, isReversed: boolean): void {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8
      const speed = 60 + Math.random() * 40
      const direction = isReversed ? 1 : -1

      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        velocityX: Math.cos(angle) * speed * 0.5,
        velocityY: Math.sin(angle) * speed * direction,
        life: 0.8,
        maxLife: 0.8,
        color: "#ff00ff",
        size: 10,
        type: "gravityJump",
      })
    }
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        velocityX: (Math.random() - 0.5) * 50,
        velocityY: (Math.random() - 0.5) * 50,
        life: 1.2,
        maxLife: 1.2,
        color: "#ff00ff",
        size: 14,
        type: "gravityJump",
      })
    }
  }

  addDeathEffect(x: number, y: number): void {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 50 + Math.random() * 150

      this.particles.push({
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 1 + Math.random(),
        maxLife: 2,
        color: "#ff0000",
        size: 1 + Math.random() * 2,
        type: "debris",
      })
    }
  }

  addGravityReversalEffect(x: number, y: number): void {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const radius = 30 + Math.random() * 20
      const speed = 80 + Math.random() * 40

      this.particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        velocityX: Math.cos(angle + Math.PI / 2) * speed,
        velocityY: Math.sin(angle + Math.PI / 2) * speed,
        life: 1.5,
        maxLife: 1.5,
        color: "#ff00ff",
        size: 8,
        type: "glow",
      })
    }
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        velocityX: 0,
        velocityY: (Math.random() - 0.5) * 100,
        life: 2,
        maxLife: 2,
        color: "#ff00ff",
        size: 16,
        type: "text",
      })
    }
  }

  addDashEffect(x: number, y: number, direction: number): void {
    for (let i = 0; i < 10; i++) {
      const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4 
      const speed = 50 + Math.random() * 100
      const color = Math.random() > 0.5 ? "#00ffff" : "#00ff00" 

      this.particles.push({
        x: x - direction * 10 + (Math.random() - 0.5) * 10, 
        y: y + (Math.random() - 0.5) * 20,
        velocityX: -direction * speed * Math.cos(angle),
        velocityY: speed * Math.sin(angle),
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
        color: color,
        size: 16,
        type: "dash",
      })
    }
  }

  addDataDrainEffect(x: number, y: number): void {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 50 + Math.random() * 50
      this.particles.push({
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.3,
        color: "#800080",
        size: 12,
        type: "dataDrain",
      })
    }
  }

  addVoidEffect(x: number, y: number): void {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 30 + Math.random() * 70
      this.particles.push({
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 1.0 + Math.random() * 1.0,
        maxLife: 2.0,
        color: "#ffffff",
        size: 16,
        type: "void",
      })
    }
  }

  addShadowCloneEffect(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        velocityX: (Math.random() - 0.5) * 50,
        velocityY: (Math.random() - 0.5) * 50,
        life: 1.5,
        maxLife: 1.5,
        color: "#888888", 
        size: 20,
        type: "shadowClone",
      })
    }
  }

  clear(): void {
    this.particles = []
  }
}
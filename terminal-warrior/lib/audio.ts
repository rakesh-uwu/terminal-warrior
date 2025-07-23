export class AudioManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()

  
  async init(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      await this.loadSounds()
    } catch (error) {
      console.warn("Audio initialization failed:", error)
    }
  }
  private async loadSounds(): Promise<void> {
    if (!this.audioContext) return
    this.sounds.set("jump", this.generateTone(220, 0.1, "square"))
    this.sounds.set("collect", this.generateTone(440, 0.2, "sine"))
    this.sounds.set("death", this.generateTone(110, 0.5, "sawtooth"))
    this.sounds.set("levelComplete", this.generateTone(660, 0.3, "sine"))
    this.sounds.set("powerup", this.generateTone(880, 0.2, "triangle"))
    this.sounds.set("shoot", this.generateTone(800, 0.1, "square"))
    this.sounds.set("enemyHit", this.generateTone(300, 0.2, "sawtooth"))
    this.sounds.set("menuMove", this.generateTone(600, 0.05, "sine"))
    this.sounds.set("gravityReversal", this.generateTone(150, 0.8, "sine"))
    this.sounds.set("gravityRestore", this.generateTone(300, 0.4, "sine"))
    this.sounds.set("gravityJump", this.generateTone(400, 0.15, "triangle"))
    this.sounds.set("menuSelect", this.generateTone(700, 0.1, "sine"))
    this.sounds.set("menuHover", this.generateTone(500, 0.03, "square"))
    this.sounds.set("timeWarp", this.generateTone(100, 0.5, "sine"))
    this.sounds.set("dataOverload", this.generateTone(900, 0.3, "sawtooth"))
    this.sounds.set("dash", this.generateTone(1200, 0.1, "triangle"))
    this.sounds.set("platformMove", this.generateTone(180, 0.05, "square"))
    this.sounds.set("forceFieldToggle", this.generateTone(750, 0.1, "sine"))
    this.sounds.set("trapActivate", this.generateTone(100, 0.2, "sawtooth"))
    this.sounds.set("bossIntro", this.generateTone(200, 1.0, "sine"))
    this.sounds.set("bossHit", this.generateTone(400, 0.1, "square"))
    this.sounds.set("bossDefeat", this.generateTone(900, 0.8, "triangle"))
    this.sounds.set("bossAttack1", this.generateTone(600, 0.15, "sawtooth"))
    this.sounds.set("bossAttack2", this.generateTone(350, 0.2, "square"))
    this.sounds.set("worldStyle1Transition", this.generateTone(300, 0.8, "sine", 0.1, 0.05))
    this.sounds.set("worldStyle2Transition", this.generateTone(450, 0.8, "triangle", 0.1, 0.05))
    this.sounds.set("worldStyle3Transition", this.generateTone(150, 0.8, "square", 0.1, 0.05))
    this.sounds.set("worldStyle4Transition", this.generateTone(100, 1.0, "sawtooth", 0.1, 0.05))
    this.sounds.set("weaponUpgrade", this.generateTone(1000, 0.3, "triangle", 0.05, 0.1))
    this.sounds.set("piercingShot", this.generateTone(1200, 0.08, "sine", 0.01, 0.02)) 
    this.sounds.set("spreadShot", this.generateTone(900, 0.12, "triangle", 0.01, 0.03))
    this.sounds.set("powerShot", this.generateTone(600, 0.15, "square", 0.02, 0.05)) 
  }
  private generateTone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    attack = 0.01,
    release = 0.1,
  ): AudioBuffer {
    if (!this.audioContext) throw new Error("Audio context not initialized")

    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      let value = 0

      switch (type) {
        case "sine":
          value = Math.sin(2 * Math.PI * frequency * t)
          break
        case "square":
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
          break
        case "sawtooth":
          value = 2 * (t * frequency - Math.floor(t * frequency + 0.5))
          break
        case "triangle":
          value = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1
          break
      }
      let envelope = 0
      if (t < attack) {
        envelope = t / attack
      } else if (t > duration - release) {
        envelope = (duration - t) / release
      } else {
        envelope = 1
      }
      data[i] = value * envelope * 0.1
    }
    return buffer
  }
  playSound(soundName: string): void {
    if (!this.audioContext || !this.sounds.has(soundName)) return
    try {
      const buffer = this.sounds.get(soundName)!
      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.audioContext.destination)
      source.start()
    } catch (error) {
      console.warn("Failed to play sound:", error)
    }
  }
}

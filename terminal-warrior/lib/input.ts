export class InputManager {
  private keys: Set<string> = new Set()
  private keyPressCallbacks: Map<string, () => void> = new Map()
  private keyPressed: Set<string> = new Set()
  private lastKeyPressTime: Map<string, number> = new Map()

  private mouseClicked = false
  private currentMouseX = 0
  private currentMouseY = 0
  private canvasRect: DOMRect | null = null

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    window.addEventListener("keydown", (e) => {
      const currentTime = Date.now()
      const lastTime = this.lastKeyPressTime.get(e.code) || 0
      if (!this.keys.has(e.code) || currentTime - lastTime > 150) {
        this.keyPressed.add(e.code)
        this.lastKeyPressTime.set(e.code, currentTime)
      }

      this.keys.add(e.code)

      const callback = this.keyPressCallbacks.get(e.code)
      if (callback && (!this.keys.has(e.code) || currentTime - lastTime > 150)) {
        callback()
      }
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape"].includes(e.code)) {
        e.preventDefault()
      }
    })

    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.code)
      this.keyPressed.delete(e.code)
    })
    window.addEventListener("mousedown", this.handleMouseDown)
    window.addEventListener("mouseup", this.handleMouseUp)
    window.addEventListener("mousemove", this.handleMouseMove)
  }

  private handleMouseDown = (e: MouseEvent): void => {
    if (this.canvasRect && e.target === this.canvasRect.ownerDocument?.getElementById("game-canvas")) {
      this.mouseClicked = true
      this.updateMousePosition(e)
      e.preventDefault() 
    }
  }

  private handleMouseUp = (e: MouseEvent): void => {
    this.mouseClicked = false 
  }

  private handleMouseMove = (e: MouseEvent): void => {
    this.updateMousePosition(e)
  }

  private updateMousePosition(e: MouseEvent): void {
    if (this.canvasRect) {
      this.currentMouseX = e.clientX - this.canvasRect.left
      this.currentMouseY = e.clientY - this.canvasRect.top
    }
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvasRect = canvas.getBoundingClientRect()
  }

  isKeyDown(key: string): boolean {
    return this.keys.has(key)
  }

  isKeyPressed(key: string): boolean {
    const pressed = this.keyPressed.has(key)
    if (pressed) {
      this.keyPressed.delete(key)
    }
    return pressed
  }

  isMouseClicked(): boolean {
    return this.mouseClicked
  }

  getMouseX(): number {
    return this.currentMouseX
  }

  getMouseY(): number {
    return this.currentMouseY
  }

  onKeyPress(key: string, callback: () => void): void {
    this.keyPressCallbacks.set(key, callback)
  }

  destroy(): void {
    if (this.canvasRect) {
      window.removeEventListener("mousedown", this.handleMouseDown)
      window.removeEventListener("mouseup", this.handleMouseUp)
      window.removeEventListener("mousemove", this.handleMouseMove)
    }
    this.keys.clear()
    this.keyPressCallbacks.clear()
    this.keyPressed.clear()
    this.lastKeyPressTime.clear()
  }
}

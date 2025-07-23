"use client"

import { useEffect, useRef, useState } from "react"
import { Game } from "@/lib/game"

export default function CyberWarriorGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      gameRef.current = new Game(canvasRef.current)
      gameRef.current.init().then(() => {
        setIsLoaded(true)
        gameRef.current?.start()
      })
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          id="game-canvas" 
          width={1024}
          height={576}
          className="border-2 border-green-500 bg-black"
          style={{ imageRendering: "pixelated" }}
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-green-500 font-mono">
            <div className="text-center">
              <div className="text-2xl mb-4">INITIALIZING TERMINAL...</div>
              <div className="animate-pulse">Loading...</div>
            </div>
          </div>
        )}
        <div className="mt-4 text-green-500 font-mono text-sm text-center">
          <div>CONTROLS: Arrow Keys/WASD - Move | Space - Jump | Ctrl/Z - Shoot</div>
          <div>X - Gravity Reversal (Unlimited Jump) | C - Dash | ESC - Pause | R - Restart Level</div>
          <div className="text-cyan-400 mt-2">Player: ◆ (Diamond) | Moving: ◢◣◤◥ (Directional)</div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import Image from "next/image"

interface GameOverScreenProps {
  score: number
}

export default function GameOverScreen({ score }: GameOverScreenProps) {
  useEffect(() => {
    const audio = new Audio("/audio/end.mp3")
    audio.volume = 0.7
    audio.play().catch((err) => {
      console.warn("End sound blocked, waiting for user interaction.")
    })
  }, [])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#f5e6d8] p-10 rounded-lg shadow-lg flex flex-col items-center">
        {/* Logo at the top of the game over screen */}
        <div className="relative w-[200px] h-[100px] mb-6">
          <Image src="/images/logo.png" alt="GRAZA DASH" fill className="object-contain" />
        </div>

        <h2 className="text-4xl font-garamond text-[#40442c] mb-6">Game Over!</h2>
        <p className="text-2xl mb-8 font-garamond text-[#40442c]">Plates Saved: {score}</p>
        <p className="text-center text-lg text-[#40442c]/70 mt-4 font-garamond">Restarting in 3 seconds...</p>
      </div>
    </div>
  )
}

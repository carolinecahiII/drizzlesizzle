"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import GameScreen from "@/components/game-screen"
import StartScreen from "@/components/start-screen"
import GameOverScreen from "@/components/game-over-screen"
import AudioPlayer from "@/components/audio-player"

export default function Home() {
  const [gameState, setGameState] = useState<"start" | "playing" | "gameOver">("start")
  const [character, setCharacter] = useState<"sizzle" | "drizzle">("sizzle")
  const [score, setScore] = useState(0)

  // Reset game state when game over
  useEffect(() => {
    if (gameState === "gameOver") {
      const timer = setTimeout(() => {
        setGameState("start")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [gameState])

  const startGame = (selectedCharacter: "sizzle" | "drizzle") => {
    setCharacter(selectedCharacter)
    setScore(0)
    setGameState("playing")
  }

  const endGame = () => {
    setGameState("gameOver")
  }

  return (
    <div className="min-h-screen bg-[#f5e6d8] p-[50px]">
      <main className="flex flex-col items-center justify-center relative overflow-hidden font-garamond p-8 border-[5px] border-[#98e46c] border-[style:wavy] h-full min-h-[calc(100vh-100px)]">
        {/* Logo at the top of the page with added padding and margin */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-[250px] h-[125px] p-4 mb-32">
          <Image src="/images/logo.png" alt="GRAZA DASH" fill className="object-contain" priority />
        </div>

        {/* Audio player with mute toggle */}
        <AudioPlayer isPlaying={gameState === "playing"} />

        <div className="w-full max-w-6xl h-[600px] relative mt-36">
          {gameState === "start" && <StartScreen onStart={startGame} />}

          {gameState === "playing" && (
            <GameScreen character={character} onGameOver={endGame} score={score} setScore={setScore} />
          )}

          {gameState === "gameOver" && <GameOverScreen score={score} />}
        </div>
      </main>
    </div>
  )
}


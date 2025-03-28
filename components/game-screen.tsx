"use client"

import { useEffect, useRef, useState } from "react"
import { useMobile } from "@/hooks/use-mobile"
import Player from "./player"
import Obstacle from "./obstacle"
import ScoreCounter from "./score-counter"

// Dust particle effect component
function DustEffect({ x, y }: { x: number; y: number }) {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      opacity: number
      speedX: number
      speedY: number
    }>
  >([])

  useEffect(() => {
    // Create dust particles
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: x + Math.random() * 30 - 15,
      y: y + Math.random() * 8,
      size: 3 + Math.random() * 4,
      opacity: 0.7 + Math.random() * 0.3,
      speedX: (Math.random() - 0.5) * 4,
      speedY: -Math.random() * 3 - 1.5,
    }))

    setParticles(newParticles)

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.speedX,
            y: p.y + p.speedY,
            size: p.size * 0.95,
            opacity: p.opacity * 0.9,
          }))
          .filter((p) => p.opacity > 0.1),
      )
    }, 50)

    // Clean up
    return () => clearInterval(interval)
  }, [x, y])

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-[#40442c]/60 rounded-full"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
        />
      ))}
    </>
  )
}

interface GameScreenProps {
  character: "sizzle" | "drizzle"
  onGameOver: () => void
  score: number
  setScore: (score: number) => void
}

// Obstacle types with their respective images, sizes, and speeds
// Reduced sizes by 1x (now 2x original size)
const OBSTACLES = [
  { type: "pan", width: 180, height: 120, image: "/images/pan.png", speedFactor: 0.8 },
  { type: "tomato", width: 120, height: 120, image: "/images/tomato.png", speedFactor: 1.2 },
  { type: "lemon", width: 120, height: 120, image: "/images/lemon.png", speedFactor: 1.1 },
  { type: "garlic", width: 110, height: 110, image: "/images/garlic.png", speedFactor: 1.0 },
]

export default function GameScreen({ character, onGameOver, score, setScore }: GameScreenProps) {
  const isMobile = useMobile()
  const gameRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const baseSpeedRef = useRef<number>(5)
  const obstacleTimerRef = useRef<number>(0)
  const jumpTimerRef = useRef<number>(0)
  const gameHeightRef = useRef<number>(700) // Default height, will be updated
  const jumpedObstaclesRef = useRef<Set<number>>(new Set()) // Track jumped obstacles
  const newlyJumpedObstaclesRef = useRef<number[]>([]) // Track newly jumped obstacles for scoring
  const groundHeightRef = useRef<number>(20) // Height of the gray ground section

  const [isJumping, setIsJumping] = useState(false)
  const [jumpHeight, setJumpHeight] = useState(0)
  const [showDust, setShowDust] = useState(false)
  const [obstacles, setObstacles] = useState<
    Array<{
      id: number
      type: string
      x: number
      width: number
      height: number
      image: string
      speed: number
    }>
  >([])

  // Reduced player size (now 2x original size)
  const playerHeight = 240 // Was 360
  const playerWidth = 90 // Was 135
  const playerX = 80

  // Position player at the top of the gray section (lower on screen)
  // Calculate groundY to be at the bottom of the screen minus the ground height
  const groundY = gameHeightRef.current - groundHeightRef.current
  const playerY = groundY - playerHeight - jumpHeight
  const jumpDuration = 1000 // 1 second jump cycle

  // Handle score updates separately from rendering
  useEffect(() => {
    if (newlyJumpedObstaclesRef.current.length > 0) {
      // Update score based on newly jumped obstacles
      setScore((prevScore) => prevScore + newlyJumpedObstaclesRef.current.length)
      // Clear the array after processing
      newlyJumpedObstaclesRef.current = []
    }
  }, [setScore, obstacles]) // Add obstacles as dependency to trigger on obstacle updates

  // Get game container height
  useEffect(() => {
    if (gameRef.current) {
      gameHeightRef.current = gameRef.current.clientHeight
    }

    const updateGameHeight = () => {
      if (gameRef.current) {
        gameHeightRef.current = gameRef.current.clientHeight
      }
    }

    window.addEventListener("resize", updateGameHeight)
    return () => window.removeEventListener("resize", updateGameHeight)
  }, [])

  // Handle keyboard and touch events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        // Reset jump timer to start a new jump
        jumpTimerRef.current = 0
        setIsJumping(true)

        // Only show dust when on the ground
        if (jumpHeight < 5) {
          setShowDust(true)
          setTimeout(() => setShowDust(false), 300)
        }
      }
    }

    const handleTouchStart = () => {
      // Reset jump timer to start a new jump
      jumpTimerRef.current = 0
      setIsJumping(true)

      // Only show dust when on the ground
      if (jumpHeight < 5) {
        setShowDust(true)
        setTimeout(() => setShowDust(false), 300)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    if (isMobile && gameRef.current) {
      gameRef.current.addEventListener("touchstart", handleTouchStart)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)

      if (isMobile && gameRef.current) {
        gameRef.current.removeEventListener("touchstart", handleTouchStart)
      }
    }
  }, [isMobile, jumpHeight])

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp
      }

      const deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Increase base game speed over time
      baseSpeedRef.current = 5 + Math.floor(score / 500) * 0.5

      // Handle jumping
      if (isJumping) {
        jumpTimerRef.current += deltaTime

        // Calculate jump height based on a sine wave for a smooth up and down motion
        // Complete cycle in 1 second (jumpDuration)
        const jumpProgress = Math.min(jumpTimerRef.current / jumpDuration, 1)
        const jumpCurve = Math.sin(jumpProgress * Math.PI)

        // Max jump height is the game window height minus some padding
        const maxJumpHeight = gameHeightRef.current - playerHeight - 50
        const newJumpHeight = maxJumpHeight * jumpCurve
        setJumpHeight(newJumpHeight)

        // Reset jump when complete
        if (jumpTimerRef.current >= jumpDuration) {
          setIsJumping(false)
          jumpTimerRef.current = 0
          setJumpHeight(0)
        }
      }

      // Spawn obstacles
      obstacleTimerRef.current += deltaTime
      if (obstacleTimerRef.current > 1500 + Math.random() * 1000) {
        obstacleTimerRef.current = 0
        const randomObstacle = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)]

        // Add random variation to speed
        const speedVariation = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
        const obstacleSpeed = baseSpeedRef.current * randomObstacle.speedFactor * speedVariation

        setObstacles((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: randomObstacle.type,
            x: 800,
            width: randomObstacle.width,
            height: randomObstacle.height,
            image: randomObstacle.image,
            speed: obstacleSpeed,
          },
        ])
      }

      // Move obstacles and check for successful jumps
      setObstacles((prev) => {
        // Clear newly jumped obstacles array before processing
        const newlyJumped: number[] = []

        const updatedObstacles = prev
          .map((obstacle) => {
            const newX = obstacle.x - obstacle.speed

            // Check if player has successfully jumped over this obstacle
            if (
              !jumpedObstaclesRef.current.has(obstacle.id) && // Not already counted
              newX < playerX - playerWidth / 2 && // Obstacle has passed the player
              obstacle.x >= playerX - playerWidth / 2 // Obstacle was previously not past the player
            ) {
              jumpedObstaclesRef.current.add(obstacle.id)
              // Add to newly jumped obstacles for scoring
              newlyJumped.push(obstacle.id)
            }

            return {
              ...obstacle,
              x: newX,
            }
          })
          .filter((obstacle) => obstacle.x > -obstacle.width)

        // Update the ref with newly jumped obstacles
        if (newlyJumped.length > 0) {
          newlyJumpedObstaclesRef.current = [...newlyJumpedObstaclesRef.current, ...newlyJumped]
        }

        return updatedObstacles
      })

      // Check collisions - only when player overlaps with obstacle center
      const playerCenter = {
        x: playerX + playerWidth / 2,
        y: playerY + playerHeight / 2,
      }

      for (const obstacle of obstacles) {
        // Calculate obstacle center
        const obstacleCenter = {
          x: obstacle.x + obstacle.width / 2,
          y: groundY - obstacle.height / 2,
        }

        // Calculate distance between centers
        const dx = playerCenter.x - obstacleCenter.x
        const dy = playerCenter.y - obstacleCenter.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Calculate minimum distance for collision (half of player + half of obstacle)
        const minDistance =
          Math.min(playerWidth, playerHeight) / 2 + (Math.min(obstacle.width, obstacle.height) / 2) * 0.7 // 0.7 to make it more forgiving

        // Check if centers are close enough for collision
        if (distance < minDistance) {
          cancelAnimationFrame(requestRef.current!)
          onGameOver()
          return
        }
      }

      requestRef.current = requestAnimationFrame(gameLoop)
    }

    requestRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isJumping, obstacles, onGameOver, score, setScore])

  return (
    <div ref={gameRef} className="absolute inset-0 overflow-hidden">
      {/* Ground */}
      <div className="absolute bottom-0 w-full h-20 bg-[#40442c]/20"></div>

      {/* Player shadow */}
      <div
        className="absolute bg-black/20 rounded-full blur-sm transition-all"
        style={{
          left: `${playerX + playerWidth / 4}px`,
          bottom: `${20 - 5}px`,
          width: `${playerWidth * 1.2 * (1 - jumpHeight / 300)}px`,
          height: `${15 * (1 - jumpHeight / 300)}px`,
          opacity: 1 - jumpHeight / 300,
        }}
      />

      {/* Obstacle shadows */}
      {obstacles.map((obstacle) => (
        <div
          key={`shadow-${obstacle.id}`}
          className="absolute bg-black/20 rounded-full blur-sm"
          style={{
            left: `${obstacle.x + obstacle.width / 4}px`,
            bottom: `${20 - 5}px`,
            width: `${obstacle.width * 0.8}px`,
            height: `${12}px`,
          }}
        />
      ))}

      {/* Player */}
      <Player
        character={character}
        x={playerX}
        y={playerY}
        width={playerWidth}
        height={playerHeight}
        isJumping={isJumping}
      />

      {/* Dust effect when jumping */}
      {showDust && <DustEffect x={playerX + playerWidth / 2} y={groundY - 10} />}

      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <Obstacle
          key={obstacle.id}
          type={obstacle.type}
          x={obstacle.x}
          y={groundY - obstacle.height}
          width={obstacle.width}
          height={obstacle.height}
          image={obstacle.image}
        />
      ))}

      {/* Score */}
      <ScoreCounter score={score} />
    </div>
  )
}


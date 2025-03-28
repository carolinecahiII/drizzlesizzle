"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

interface PlayerProps {
  character: "sizzle" | "drizzle"
  x: number
  y: number
  width: number
  height: number
  isJumping: boolean
}

export default function Player({ character, x, y, width, height, isJumping }: PlayerProps) {
  const imageSrc = character === "sizzle" ? "/images/sizzle.png" : "/images/drizzle.png"
  const bounceRef = useRef<number>(0)
  const rotationRef = useRef<number>(0)

  // Reset animation when not jumping
  useEffect(() => {
    if (!isJumping) {
      bounceRef.current = 0
      rotationRef.current = 0
    }
  }, [isJumping])

  // Bounce animation
  useEffect(() => {
    let animationFrame: number

    const animate = () => {
      if (isJumping) {
        // Oscillate between -3 and 3 for bounce effect
        bounceRef.current = Math.sin(Date.now() / 100) * 3

        // Slight rotation during jump
        rotationRef.current = Math.sin(Date.now() / 200) * 5
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [isJumping])

  return (
    <div
      className="absolute transition-transform"
      style={{
        left: `${x}px`,
        top: `${y + (isJumping ? bounceRef.current : 0)}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: isJumping ? `rotate(${rotationRef.current}deg)` : "none",
        transition: "transform 0.1s ease-out",
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={character}
          fill
          className="object-contain image-rendering-pixelated"
          style={{ imageRendering: "pixelated" }}
          priority
        />
      </div>
    </div>
  )
}

